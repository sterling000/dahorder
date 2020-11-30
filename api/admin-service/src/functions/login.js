"use strict";
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

module.exports.handler = async (event, context) => {
  
  const body = JSON.parse(event.body);
  console.log(JSON.stringify(body));
  const getAdminParams = {
    TableName: process.env.DYNAMODB_ADMIN_TABLE,
    Key: {
      pk: body.username, 
    }
  };

  let adminResult = {};
  try {
    console.log(getAdminParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    adminResult = await dynamodb.get(getAdminParams).promise();
  } catch (getError) {
    console.log("There was an error attempting to get the admin.");
    console.log("getError", getError);
    console.log("getAdminParams", getAdminParams);
    return new Error("There was an error getting the admin", getError);
  }
  console.log(JSON.stringify(`Result: ${adminResult.Item}`));
  if (typeof adminResult.Item !== "undefined" ) {
    const compareResult = bcrypt.compareSync(
      body.password,
      adminResult.Item.pw
    );
    if (compareResult) {
      let token = jwt.sign(
        {
          pk: adminResult.Item.pk,
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
      "typeof adminResult.Item was undefined"
    );
  }

  return {
    statusCode: 404,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
  };
};
