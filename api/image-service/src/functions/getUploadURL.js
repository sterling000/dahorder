'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
module.exports.handler = async (event, context) => {
  const result = await getUploadURL();
  console.log('Result: ', result);
  return result;
};

const getUploadURL = async function() {
  const randomId = Date.now();

  const s3Params = {
    Bucket: process.env.UPLOAD_BUCKET,
    Key: randomId + '.jpg',
    ContentType: 'image/jpeg',
    ACL: 'public-read',
    CacheControl: 'max-age=31104000'
  }

  console.log('getUploadURL: ', s3Params);
  
  return new Promise((resolve, reject) => {
    //Get signed URL
    resolve({
      "statusCode": 200,
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      "body": JSON.stringify({
        "uploadURL": s3.getSignedUrl('putObject', s3Params),
        "photoFilename": `${randomId}.jpg`
      })
    });
  })
}
