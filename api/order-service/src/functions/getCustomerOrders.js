"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
module.exports.handler = async (event, context) => {
  console.log(event);
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const queryParams = {
    TableName: process.env.DYNAMODB_ORDER_TABLE,
    IndexName: "customerIndex",
    ExpressionAttributeNames: {
      "#customerId": "customerId",
    },
    ExpressionAttributeValues: {
      ":customerId": decodedJwt.phone,
    },
    KeyConditionExpression: "#customerId = :customerId",
  };

  let queryResult = {};
  try {
    console.log(queryParams);
    queryResult = await dynamodb.query(queryParams).promise();
  } catch (err) {
    console.error("There was an error attempting to query the orders.", err);
    console.log("queryParams", queryParams);
    return new Error(err);
  }

  let shopIds = queryResult.Items.map((result) => {
    return {
      shop: result.shopId,
      owner: result.owner,
    };
  });
  console.log(JSON.stringify(shopIds));
  let requestItems = {};

  requestItems[process.env.DYNAMODB_SHOP_TABLE] = {
    Keys: [],
  };

  let keys = [];

  shopIds.forEach((shopOwner) => {
    if (keys.find((key) => key.id == shopOwner.shop) === undefined) {
      keys[shopOwner.shop] = { pk: shopOwner.owner, id: shopOwner.shop };
    }
  });
  requestItems[process.env.DYNAMODB_SHOP_TABLE].Keys = keys;

  console.log("requestItems", JSON.stringify(requestItems));

  var batchGetParams = {
    RequestItems: requestItems,
    ReturnConsumedCapacity: "NONE",
  };
  let batchGetResult;
  try {
    console.log("batchGetParams", JSON.stringify(batchGetParams));
    batchGetResult = await dynamodb.batchGet(batchGetParams).promise();
  } catch (error) {
    console.error("There was an error trying to batchGet the shops.");
    console.log("batchGetParams", batchGetParams);
    console.log("error", error);
    return new Error(
      "Something went wrong looking up shop details for your order."
    );
  }

  console.log("Found the shop details!", JSON.stringify(batchGetResult));
  let shopNames = {};
  batchGetResult.Responses[process.env.DYNAMODB_SHOP_TABLE].forEach((shop) => {
    shopNames[shop.id] = shop.name;
  });
  queryResult.Items.forEach((order) => {
    order["shopName"] = shopNames[order.shopId];
  });
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify(queryResult.Items),
  };
};
