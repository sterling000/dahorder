"use strict";
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const parsePhoneNumber = require("libphonenumber-js");
const jwt = require("jsonwebtoken");
module.exports.createUser = async (event) => {
  const body = JSON.parse(event.body);
  const email = body.email;
  const condo = body.condo;
  const password = body.password;
  const name = body.name;
  const apartment = body.apartment;
  const phone = body.phone;
  const phoneNumber = parsePhoneNumber(phone);
  if (!phoneNumber.isValid()) {
    return {
      statusCode: 203,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: "Did not give a valid phone number.",
    };
  }
  const role = body.role;
  const newUserParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    Item: {
      pk: phone,
      password: bcrypt.hashSync(password, 10),
      name: name,
      condo: condo,
      apartment: apartment,
      email: email,
      role: role,
    },
    ConditionExpression: "attribute_not_exists(pk)",
  };

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    await dynamodb.put(newUserParams).promise();
  } catch (putError) {
    console.log("typeof(putError)", typeof putError);
    if (putError.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 202,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Headers": "Authorization",
        },
        body: "A user already exists with that phone number.",
      };
    }
    console.log("There was an error putting a new user");
    console.error("putError", putError);
    console.log("newUserParams", newUserParams);
    return new Error("There was an error putting the new user");
  }

  try {
    const snsParams = {
      Message: `User Created - name: ${name} - phone: ${phone} - condo: ${condo} - apartment: ${apartment} email: ${email} - role: ${role}`,
      TopicArn: `arn:aws:sns:${process.env.REGION}:503089823451:userRegistered-${process.env.STAGE}`,
      Subject: "Dah Order - User Created",
    };
    console.log("snsParams", snsParams);
    await new AWS.SNS().publish(snsParams).promise();
  } catch (err) {
    console.log("Couldn't send userRegistered notification to azrin.");
    console.error(err);
    throw new Error("Couldn't send userRegistered notification.");
  }
  let token = jwt.sign(
    {
      phone: phone,
    },
    process.env.JWT_SECRET
  );
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify({
      token: token,
    }),
  };
};
