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

const Amplify = require('aws-amplify')
Amplify.default.configure(JSON.parse(process.env.AMPLIFYCFG));

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

app.post('/checkin', function(req, res) {
  const resp = {success: false}
  // try {
  //   const data = req.body;
  //   if (!data.name || !data.phone || !data.postcode || !data.maskId)
  //   {
  //     resp.error = "Required Field Missing"
  //     console.log('INVALID ADD: ' + JSON.stringify(data))
  //   }
  //   else
  //   {
  //     await API.graphql(graphqlOperation(createCheckin, {input: data}))
  //     resp.success = true
  //   }
  // } catch (err) {
  //   console.log('error creating checkin:', err)
  //   resp.error = 'error creating checkin:' + err
  // }
  //resp.bucket = awsExports.aws_user_files_s3_bucket
  res.json({success: 'post call succeed!', url: req.url, request: req.body, response: resp})
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
