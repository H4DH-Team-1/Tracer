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

  const collectionIdForFaces = 'newtHackMaskTrack'

  const collections = await rekognition.listCollections().promise();
  console.log('Got list collection response', collections)
  if (!collections || !collections.CollectionIds || collections.CollectionIds.length === 0
    || collections.CollectionIds.filter((i) => i === collectionIdForFaces).length === 0)
  {
    const createCollection = await rekognition.createCollection({ CollectionId: collectionIdForFaces }).promise()
    console.log('Got create collection response', createCollection)
  }

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

   

  context.done(null, 'Successfully processed S3 event') // SUCCESS with message
};
