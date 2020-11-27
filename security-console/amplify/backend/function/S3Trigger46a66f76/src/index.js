//NOTE: you need to copy the contents of "aws-exports.js" from root SRC
//into an environment variable in Lambda.
//WARNING: There must be a better way to share this!  Just a hackathon quick fix...
const config = JSON.parse(process.env.AMPLIFYCFG);
const AWS = require('aws-sdk');
const { createApolloFetch } = require('apollo-fetch');
const rekognition = new AWS.Rekognition({
  region: config.aws_user_files_s3_bucket_region,
});
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
exports.handler = async function (event, context) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));
  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name; //eslint-disable-line
  const key = event.Records[0].s3.object.key; //eslint-disable-line
  console.log(`Bucket: ${bucket}`, `Key: ${key}`);

  if (key.indexOf('DELETE') > 0) {
    console.log('DELETING ALL FACES!');
    await deleteCollection();
    context.done(null, 'FINISHED DELETE MODE');
    return;
  }

  //Start of the procedural process that should really be split into separate trigger functions :P
  await ensureCollectionExists();
  if (isCheckin(key)) 
  {
    const faceIds = await indexFacesOnCheckin(bucket, key);
    if (faceIds.length <= 0) {
      const checkinId = getCheckinId(key);
      console.log(`Processing checkin '${checkinId}' - NO FACES DETECTED!`);
      await attachFaceToCheckin(checkinId, ''); //clear out the faceid
    } else {
      await asyncForEach(faceIds, async (faceId) => {
        const checkinId = getCheckinId(key);
        console.log(`Processing checkin '${checkinId}' with face '${faceId}'`);
        await attachFaceToCheckin(checkinId, faceId);
        console.log("Processsed!'");
      });
    }
  }
  else
  {
    //This is a movement, not a checkin, let's try find faces!
    const location = getMovementLocation(key);
    console.log(`Processing Movement in location ${location}`);
    const faceId = await getFaceOnMovement(bucket, key);
    if (faceId)
    {
      const checkinIdForFace = await findCheckinForFace(faceId);
      let faceMaskConfidence = await getPpeConfidence(bucket, key);
      if (faceMaskConfidence == null){
        faceMaskConfidence = 0.01;
      }
      await attachMovementForCheckin(checkinIdForFace, faceId, location, bucket, key, faceMaskConfidence);
    }

  }

  context.done(null, 'Successfully processed S3 event');
};

const ensureCollectionExists = async () => {
  const collections = await rekognition.listCollections().promise();
  console.log('Got list collection response', collections);
  if (
    !collections ||
    !collections.CollectionIds ||
    collections.CollectionIds.length === 0 ||
    collections.CollectionIds.filter((i) => i === collectionIdForFaces)
      .length === 0
  ) {
    const createCollection = await rekognition
      .createCollection({ CollectionId: collectionIdForFaces })
      .promise();
    console.log('Got create collection response', createCollection);
  }
};

const deleteCollection = async () => {
  const delCollection = await rekognition
    .deleteCollection({ CollectionId: collectionIdForFaces })
    .promise();
  console.log('Got delete collection response', delCollection);
};

const indexFacesOnCheckin = async (bucket, key) => {
  console.log('Starting indexFacesOnCheckin...');
  const faces = await rekognition
    .indexFaces({
      CollectionId: collectionIdForFaces,
      DetectionAttributes: ['DEFAULT'],
      QualityFilter: 'LOW',
      MaxFaces: 1,
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
    })
    .promise();
  console.log('Got index faces response', JSON.stringify(faces));

  const faceIds = faces.FaceRecords
    ? faces.FaceRecords.map((f) => f.Face.FaceId)
    : [];
  console.log(`FACES FOUND: ${faceIds.length}`, faceIds);
  return faceIds;
};

const getFaceOnMovement = async (bucket, key) => {
  console.log('Starting searchFacesOnMovement...');
  const faces = await rekognition
    .searchFacesByImage({
      CollectionId: collectionIdForFaces,
      FaceMatchThreshold: 70,
      MaxFaces: 1,
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
    })
    .promise();
  console.log('Got search faces response', JSON.stringify(faces));

  const faceIds = faces.FaceMatches
    ? faces.FaceMatches.map((f) => f.Face.FaceId)
    : [];
  console.log(`FACES FOUND: ${faceIds.length}`, faceIds);
  return faceIds.length > 0 ? faceIds[0] : null;
};

const getPpeConfidence = async (bucket, key) => {
  console.log('Starting getPpeConfidence...');
  const ppe = await rekognition
    .detectProtectiveEquipment({
      SummarizationAttributes: {
        MinConfidence: 70,
        RequiredEquipmentTypes: [ 
          "FACE_COVER"
        ]
      },
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
    })
    .promise();
  console.log('Got PPE response', JSON.stringify(ppe));
  let confidence = 0.01;
  if (ppe.Persons && ppe.Persons.length > 0){
    if (ppe.Persons[0].BodyParts && ppe.Persons[0].BodyParts.length > 0)
    {
      ppe.Persons[0].BodyParts.forEach(p => {
        if (p.Name === "FACE") {
          p.EquipmentDetections.forEach(d => {
            if (d.Type === "FACE_COVER"){
              console.log(`Found face cover confidence`, d.Confidence);
              confidence = d.Confidence;
            }
          });
          
        }
      });
    }
  }
  return confidence;
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
    console.log('attachFaceToCheckin Response from GraphQL', JSON.stringify(graphQlResp));
  } catch (error) {
    console.log('Error graphQlResp!', error);
  }

  console.log('Finished attachFaceToCheckin...');
};

const findCheckinForFace = async (faceId) => {
  console.log('Starting findCheckinForFace...');
  try {
    const graphQlResp = await fetchGraphQl({
      query: `
      query FindCheckinByFace {
        listCheckins(filter: {identifiedPersonId: {eq: "${faceId}"}}) {
          items {
            id
          }
        }
      }
      `,
    });
    console.log('findCheckinForFace Response from GraphQL', JSON.stringify(graphQlResp));

    if (
      graphQlResp &&
      graphQlResp.data &&
      graphQlResp.data.listCheckins &&
      graphQlResp.data.listCheckins.items &&
      graphQlResp.data.listCheckins.items.length > 0
    ) {
      return graphQlResp.data.listCheckins.items[0].id;
    }
    return null;
  } catch (error) {
    console.log('Error graphQlResp!', error);
  }

  console.log('Finished findCheckinForFace...');
};

const attachMovementForCheckin = async (checkinId, faceId, location, bucket, key, faceMaskConfidence) => {
  console.log('Starting attachFaceToCheckin...');
  try {
    const graphQlResp = await fetchGraphQl({
      query: `
      mutation CreateMovementForCheckin {
        createMovement(input: {checkinID: "${checkinId}", identifiedPersonId: "${faceId}", location: "${location}", faceMaskConfidence: ${faceMaskConfidence}, photo: {bucket: "${bucket}", key: "${key}", region: "${config.aws_user_files_s3_bucket_region}"}}) {
          id
        }
      }
      `,
    });
    console.log('attachMovementForCheckin Response from GraphQL', JSON.stringify(graphQlResp));
  } catch (error) {
    console.log('Error graphQlResp!', error);
  }

  console.log('Finished attachMovementForCheckin...');
};

const isCheckin = (key) => {
  return key.startsWith('public/c-');
};

const getCheckinId = (key) => {
  return key.replace('public/c-', '').replace('.jpg', '');
};

const getMovementLocation = (key) => {
  return key.substring(0, key.indexOf('_')).replace('public/m-', '');
};

//https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
