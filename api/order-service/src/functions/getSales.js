"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
// const { Parser } = require("json2csv");
module.exports.handler = async (event, context) => {
  console.log(event);
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
  const pk = decodedJwt.phone;

  const queryParams = {
    TableName: process.env.DYNAMODB_SHOP_TABLE,
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": pk,
    },
    KeyConditionExpression: "#pk = :pk",
  };

  let shops;
  try {
    console.log("Fetching Shops owned by user...", pk);
    shops = await dynamodb.query(queryParams).promise();
  } catch (err) {
    console.log("Couldn't find your user's shops");
    return new Error("Couldn't find your user's shops", err);
  }

  let orders = [];
  const orderPromises = [];
  const shopIds = shops.Items.map((shop) => shop.id);
  shopIds.forEach((shopId) => {
    console.log("shopId:", shopId);
    orderPromises.push(
      dynamodb
        .query({
          TableName: process.env.DYNAMODB_ORDER_TABLE,
          ExpressionAttributeNames: {
            "#shopId": "shopId",
          },
          ExpressionAttributeValues: {
            ":shopId": shopId,
          },
          KeyConditionExpression: "#shopId = :shopId",
        })
        .promise()
    );
  });
  let allOrderResponses;
  try {
    console.log("Fetching orders...");
    allOrderResponses = await Promise.all(orderPromises);
  } catch (err) {
    console.log(err);
    return new Error("Couldn't find your orders", err);
  }

  console.log("Responses:", allOrderResponses);
  allOrderResponses.map((res) => {
    if (res.Items !== undefined && res.Items.length > 0) {
      orders = [...orders, res.Items];
    }
  });
  console.log("orders:", orders);
  if (orders.length > 0) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment;filename="testing.csv"',
      },
      body: JSON.stringify(orders),
      statusCode: 200,
    };
  } else {
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: "There were no orders.",
    };
  }
};
