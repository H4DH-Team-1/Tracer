// eslint-disable-next-line
exports.handler = async function(event, context) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2))
  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name //eslint-disable-line
  const key = event.Records[0].s3.object.key //eslint-disable-line
  console.log(`Bucket: ${bucket}`, `Key: ${key}`)

  //NOTE: you need to copy the contents of "aws-exports.js" from root SRC
  //into an environment variable in Lambda.
  //WARNING: There must be a better way to share this!  Just a hackathon quick fix...
  const config = JSON.parse(process.env.AMPLIFYCFG)
  const { createApolloFetch } = require('apollo-fetch')
  const AWS = require('aws-sdk')
  const rekognition = new AWS.Rekognition({region: config.aws_user_files_s3_bucket_region})

  const fetchClient = createApolloFetch({
    uri: config.aws_appsync_graphqlEndpoint,
  });
  fetchClient.use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['x-api-key'] = config.aws_appsync_apiKey;
  
    next();
  });

  const collectionIdForFaces = 'newtHackMaskTrack'


  //Start of the procedural process:
  await ensureCollectionExists(rekognition, collectionIdForFaces)
  const faceIds = await findFaces(rekognition, collectionIdForFaces, bucket, key)
  
  faceIds.forEach(async (faceId) => {
    if (key.startsWith('public/c-'))
    {
      var checkinId = key.replace('public/c-', '').replace('.jpg', '')
      console.log(`Processing checkin '${checkinId}' with face '${faceId}'`);
      attachFaceToCheckin(fetchClient, checkinId, faceId);
      console.log(`Processsed!'`);
    }
  })
  //todo: if 'c' - find the checkin and update it (graphql mutation)
  //otherwise, try create a 'movement', search for faces (graphql filter) and attach the movement

  context.done(null, 'Successfully processed S3 event')
};

const ensureCollectionExists = async (rekognition, collectionIdForFaces) => {
  const collections = await rekognition.listCollections().promise();
  console.log('Got list collection response', collections)
  if (!collections || !collections.CollectionIds || collections.CollectionIds.length === 0
    || collections.CollectionIds.filter((i) => i === collectionIdForFaces).length === 0)
  {
    const createCollection = await rekognition.createCollection({ CollectionId: collectionIdForFaces }).promise()
    console.log('Got create collection response', createCollection)
  }
}

const findFaces = async(rekognition, collectionIdForFaces, bucket, key) => {
  const faces = await rekognition.indexFaces({
    CollectionId: collectionIdForFaces, 
    DetectionAttributes: [], 
    Image: {
      S3Object: {
      Bucket: bucket, 
      Name: key
      }
    }
    }).promise()
    console.log('Got index faces response', faces)

  const faceIds = faces.FaceRecords ? faces.FaceRecords.map(f => f.Face.FaceId) : []
  console.log(`FACES FOUND: ${faceIds.length}`, faceIds)
  return faceIds
}


const attachFaceToCheckin = async (fetchClient, checkinId, faceId) => {
  const graphQlResp = await fetchClient({
    query: `
    mutation UpdateIdentifiedPerson {
      updateCheckin(input: {id: "${checkinId}", identifiedPersonId: "${faceId}"}) {
        createdAt
        id
        identifiedPersonId
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
  
  console.log('attachFaceToCheckin Response from GraphQL', graphQlResp)

}