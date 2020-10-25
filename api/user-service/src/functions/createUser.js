'use strict';
const AWS = require('aws-sdk')
const bcrypt = require('bcryptjs')

module.exports.createUser = async event => {
  const body = JSON.parse(event.body);
  const email = body.email;
  const condo = body.condo;
  const password = body.password;
  const name = body.name;
  const apartment = body.apartment;
  const phone = body.phone;
  const role = body.role;
  const newUserParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    Item: {
      pk: email,
      password: bcrypt.hashSync(password, 10),
      name: name,
      condo: condo,
      apartment: apartment,
      phone: phone,
      role: role
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  }

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const putResult = await dynamodb.put(newUserParams).promise();
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Authorization'
      }
    };
  } catch(putError) {
    console.log('typeof(putError)', typeof(putError));
    if(putError.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 202,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Headers': 'Authorization'
        }
      }
    }
    console.log('There was an error putting a new user');
    console.log('putError', putError);
    console.log('newUserParams', newUserParams);
    return new Error('There was an error putting the new user');
  }
};
