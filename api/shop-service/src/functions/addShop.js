'use strict';
const AWS = require('aws-sdk')

module.exports.handler = async event => {
  const body = JSON.parse(event.body);
  
  const condo = body.condo;
  const name = body.name;
  const description = body.description;
  const thumbnail = body.thumbnail;

  const newShopParams = {
    TableName: process.env.DYNAMODB_SHOP_TABLE,
    Item: {
      pk: name,
      condo: condo,
      description: description,
      thumbnail: thumbnail
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  }

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const putResult = await dynamodb.put(newShopParams).promise();
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Authorization'
      }
    };
  } catch(putError) {
    console.log('There was an error putting a new shop');
    console.log('putError', putError);
    console.log('newShopParams', newShopParams);
    return new Error('There was an error putting the new shop');
  }
};
