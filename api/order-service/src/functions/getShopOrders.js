"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
module.exports.handler = async (event, context) => {
  console.log(event);
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const shop = event.queryStringParameters.shop;

  const shopParams = {
    TableName: process.env.DYNAMODB_SHOP_TABLE,
    Key: {
      pk: decodedJwt.phone,
      id: shop,
    },
  };
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  let shopResult = {};
  try {
    console.log(`looking up shop: ${shop}`);
    shopResult = await dynamodb.get(shopParams).promise();
    console.log(shopResult);
    if (shopResult.Item.pk !== decodedJwt.phone) {
      return {
        statusCode: 403,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Headers": "Authorization",
        },
        body:
          "You are not the owner of the shop, you can not see their orders.",
      };
    }
    const queryParams = {
      TableName: process.env.DYNAMODB_ORDER_TABLE,
      ExpressionAttributeNames: {
        "#shopId": "shopId",
      },
      ExpressionAttributeValues: {
        ":shopId": shop,
      },
      KeyConditionExpression: "#shopId = :shopId",
    };

    let queryResult = {};
    try {
      console.log(queryParams);
      queryResult = await dynamodb.query(queryParams).promise();

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Headers": "Authorization",
        },
        body: JSON.stringify(queryResult.Items),
      };
    } catch (err) {
      console.error("There was an error attempting to scan the orders.");
      console.log("queryParams", queryParams);
      return new Error(err);
    }
  } catch (err) {
    console.error("There was an error attempting to get the shop.");
    console.log("shopParams", shopParams);
    return new Error(err);
  }
};
