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
  } catch (err) {
    console.error("There was an error attempting to get the shop.");
    console.log("shopParams", shopParams);
    return new Error(err);
  }

  console.log(shopResult);

  if (shopResult.Item.pk !== decodedJwt.phone) {
    return {
      statusCode: 408,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: "You are not the owner of the shop, you can not see their orders.",
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
  } catch (err) {
    console.error("There was an error attempting to scan the orders.");
    console.log("queryParams", queryParams);
    return new Error(err);
  }

  // get customer details for the order
  console.log(
    "Getting customer details for orders",
    JSON.stringify(queryResult)
  );
  if (queryResult.Items !== undefined && queryResult.Items.length > 0) {
    let customerIds = [
      ...new Set(queryResult.Items.map((order) => order.customerId)),
    ];
    let requestItems = {};
    requestItems[process.env.DYNAMODB_USER_TABLE] = {
      Keys: [],
    };

    let keys = [];
    console.log("customerIds", JSON.stringify(customerIds));
    customerIds.forEach((customerId) => {
      if (keys.find((key) => key == customerId) === undefined) {
        keys.push({ pk: customerId });
      }
    });
    requestItems[process.env.DYNAMODB_USER_TABLE].Keys = keys;
    const batchGetParams = {
      RequestItems: requestItems,
      ReturnConsumedCapacity: "NONE",
    };

    let batchGetResult;
    try {
      console.log("batchGetParams", batchGetParams);
      batchGetResult = await dynamodb.batchGet(batchGetParams).promise();
    } catch (error) {
      console.error("There was an error getting the customer info.", error);
      console.log("batchGetParams", batchGetParams);
      console.log("error", error);
      return new Error(
        "There was an error getting the customer info for your order."
      );
    }

    console.log("Found the user details!", JSON.stringify(batchGetResult));
    let userNames = {};
    batchGetResult.Responses[process.env.DYNAMODB_USER_TABLE].forEach(
      (user) => {
        userNames[user.pk] = { name: user.name, apartment: user.apartment };
      }
    );
    queryResult.Items.forEach((order) => {
      order["userName"] = userNames[order.customerId];
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
  } else {
    console.log("No user Items found");
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: JSON.stringify({
        successful: false,
        message: "Could not find the customer info for your order.",
      }),
    };
  }
};
