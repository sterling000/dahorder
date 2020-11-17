"use strict";
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

module.exports.login = async (event, context) => {
  const body = JSON.parse(event.body);

  const queryUserParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": body.phone,
    },
  };

  let userResult = {};
  try {
    console.log(queryUserParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    userResult = await dynamodb.query(queryUserParams).promise();
  } catch (queryError) {
    console.log("There was an error attempting to retrieve the user.");
    console.log("queryError", queryError);
    console.log("queryUserParams", queryUserParams);
    return new Error("There was an error retrieving the user");
  }

  if (
    typeof userResult.Items !== "undefined" &&
    userResult.Items.length === 1
  ) {
    const compareResult = bcrypt.compareSync(
      body.password,
      userResult.Items[0].password
    );
    if (compareResult) {
      let token = jwt.sign(
        {
          phone: userResult.Items[0].pk,
        },
        process.env.JWT_SECRET
      );
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Headers": "Authorization",
        },
        body: JSON.stringify({
          token: token,
        }),
      };
    }
  } else {
    console.log(
      "typeof userResult.Items was undefined or didn't have a length of 1."
    );
  }

  return {
    statusCode: 404,
  };
};
