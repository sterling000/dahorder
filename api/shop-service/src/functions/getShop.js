"use strict";
const AWS = require("aws-sdk");

module.exports.handler = async (event, context) => {
  console.log(event);

  const id = event.queryStringParameters.id;
  const owner = event.queryStringParameters.owner;
  const queryShopParams = {
    TableName: process.env.DYNAMODB_SHOP_TABLE,
    KeyConditionExpression: "#pk = :pk and #id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":id": `${id}`,
      ":pk": `${owner}`,
    },
  };

  let shopResult = {};
  try {
    console.log(queryShopParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    shopResult = await dynamodb.query(queryShopParams).promise();
  } catch (queryError) {
    console.log("There was an error attempting to retrieve the shop.");
    console.log("queryError", queryError);
    console.log("queryShopsParams", queryShopParams);
    return new Error("There was an error retrieving the shop.");
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify(shopResult.Items),
  };
};
