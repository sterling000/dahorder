'use strict';
const AWS = require('aws-sdk')

module.exports.handler = async event => {
  const params = {
    TableName: process.env.DYNAMODB_SHOP_TABLE,
  };

  let scanResults = [];
  let items;
  
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  do{
      items =  await dynamodb.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey  = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != "undefined");

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Authorization'
    },
    body: JSON.stringify(scanResults)
  }
};