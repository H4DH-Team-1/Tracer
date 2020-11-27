//NOTE: you need to copy the contents of "aws-exports.js" from root SRC
//into an environment variable in Lambda.
//WARNING: There must be a better way to share this!  Just a hackathon quick fix...
const config = JSON.parse(process.env.AMPLIFYCFG);
const AWS = require('aws-sdk');
const { createApolloFetch } = require('apollo-fetch');
const rekognition = new AWS.Rekognition({region: config.aws_user_files_s3_bucket_region});
const collectionIdForFaces = 'newtHackMaskTrack';

const fetchGraphQl = createApolloFetch({
  uri: config.aws_appsync_graphqlEndpoint,
});

fetchGraphQl.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {};
  }
  options.headers['x-api-key'] = config.aws_appsync_apiKey;

  next();
});

// eslint-disable-next-line
exports.handler = async function(event, context) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));
  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name //eslint-disable-line
  const key = event.Records[0].s3.object.key //eslint-disable-line
  console.log(`Bucket: ${bucket}`, `Key: ${key}`);

  //Start of the procedural process:
  await ensureCollectionExists();
  const faceIds = await findFaces(bucket, key);
  
  if (faceIds.length <= 0)
  {
    if (isCheckin(key))
    {
      const checkinId = getCheckinId(key);
      console.log(`Processing checkin '${checkinId}' - NO FACES DETECTED!`);
      await attachFaceToCheckin(checkinId, ''); //clear out the faceid
    }
  }
  else
  {
    await asyncForEach(faceIds, async (faceId) => {
      if (isCheckin(key))
      {
        const checkinId = getCheckinId(key);
        console.log(`Processing checkin '${checkinId}' with face '${faceId}'`);
        await attachFaceToCheckin(checkinId, faceId);
        console.log('Processsed!\'');
      }
    });
  }
  //todo: if 'c' - find the checkin and update it (graphql mutation)
  //otherwise, try create a 'movement', search for faces (graphql filter) and attach the movement

  context.done(null, 'Successfully processed S3 event');
};

const ensureCollectionExists = async () => {
  const collections = await rekognition.listCollections().promise();
  console.log('Got list collection response', collections);
  if (!collections || !collections.CollectionIds || collections.CollectionIds.length === 0
    || collections.CollectionIds.filter((i) => i === collectionIdForFaces).length === 0)
  {
    const createCollection = await rekognition.createCollection({ CollectionId: collectionIdForFaces }).promise();
    console.log('Got create collection response', createCollection);
  }
};

const findFaces = async (bucket, key) => {
  const faces = await rekognition.indexFaces({
    CollectionId: collectionIdForFaces, 
    DetectionAttributes: ['ALL'], 
    Image: {
      S3Object: {
      Bucket: bucket, 
      Name: key
      }
    }
    }).promise();
    console.log('Got index faces response', faces);

  const faceIds = faces.FaceRecords ? faces.FaceRecords.map(f => f.Face.FaceId) : [];
  console.log(`FACES FOUND: ${faceIds.length}`, faceIds);
  return faceIds;
};

const attachFaceToCheckin = async (checkinId, faceId) => {
  console.log('Starting attachFaceToCheckin...');
  try {
    const graphQlResp = await fetchGraphQl({
      query: `
      mutation UpdateIdentifiedPerson {
        updateCheckin(input: {id: "${checkinId}", identifiedPersonId: "${faceId}", faceIdComplete: true}) {
          createdAt
          id
          identifiedPersonId
          faceIdComplete
          maskId
          name
          phone
          postcode
          updatedAt
          photo {
            bucket
            key
            region
          }
          movements {
            items {
              id
            }
          }
        }
      }
      `,
    });
    console.log('attachFaceToCheckin Response from GraphQL', graphQlResp);
  } catch (error) {
    console.log('Error graphQlResp!', error);
  }
  
  console.log('Finished attachFaceToCheckin...');
};

const isCheckin = (key) => {
  return key.startsWith('public/c-');
};

const getCheckinId = (key) => {
  return key.replace('public/c-', '').replace('.jpg', '');
};

//https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}