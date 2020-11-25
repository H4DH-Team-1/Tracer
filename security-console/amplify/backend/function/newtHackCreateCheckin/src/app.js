/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

//NOTE: you need to copy the contents of "aws-exports.js" from root SRC
//into an environment variable in Lambda.
//WARNING: There must be a better way to share this!  Just a hackathon quick fix...
const config = JSON.parse(process.env.AMPLIFYCFG)

const { createApolloFetch } = require('apollo-fetch')
const AWS = require('aws-sdk')

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.post('/checkin', async function(req, res) {
  const resp = {success: false}
  try {
    const data = req.body;
    if (!data.name || !data.phone || !data.postcode || !data.maskId || !data.image)
    {
      resp.error = "Required Field Missing"
      console.log('INVALID ADD: ' + JSON.stringify(data))
    }
    else
    {
      const fileName = `c-${data.maskId}.jpg`
      const base64Data = new Buffer.from(data.image.replace(/^data:image\/\w+;base64,/, ""), 'base64')

      var params = {
        Bucket: config.aws_user_files_s3_bucket,
        Key: `public/${fileName}`,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg'
      };
      const s3 = new AWS.S3({region: config.aws_user_files_s3_bucket_region})
      const s3Res = await s3.putObject(params).promise()
      console.log('Response from S3', s3Res)
      
      const fetch = createApolloFetch({
        uri: config.aws_appsync_graphqlEndpoint,
      });

      fetch.use(({ request, options }, next) => {
        if (!options.headers) {
          options.headers = {};
        }
        options.headers['x-api-key'] = config.aws_appsync_apiKey;
      
        next();
      });

      //LEARNING: Fixed Dis!! Talk about the return items
      const graphQlResp = await fetch({
        query: `
        mutation CreateBasicCheckin {
          createCheckin(input: {
            id: "${data.maskId}", 
            maskId: "${data.maskId}", 
            name: "${data.name}", 
            phone: "${data.phone}", 
            postcode: "${data.postcode}", 
            photo: {
              bucket: "${config.aws_user_files_s3_bucket}", 
              region: "${config.aws_user_files_s3_bucket_region}", 
              key: "${fileName}"
            }
          }) {
            id
            name
            phone
            postcode
            maskId
            photo {
              bucket
              region
              key
            }
            identifiedPersonId
            movements {
              items {
                id
                location
                identifiedPersonId
                checkinID
                createdAt
                updatedAt
              }
              nextToken
            }
            createdAt
            updatedAt
          }
        }
        `,
      });
      
      console.log('Response from GraphQL', graphQlResp)
      resp.success = true
    }
  } catch (err) {
    console.log('error creating checkin:', err)
    resp.error = 'error creating checkin:' + err
  }
  res.json({response: resp})
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
