// Import the required AWS Cognitor SDK Classes
// CognitoIndefi use to communicate
//SignupCOmmand: used to send sign-up rquest to cognitor to create user

const {
  SignUpCommand,
  CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");

const UserModel = require("../models/userModel");

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

// specify the cognitor app client id
// the app client id tells congnitor which app is making the request

const COGNITO_CLIENT_ID = process.env.CLIENT_ID;

exports.signUp = async (event) => {
  const { email, fullName, password } = JSON.parse(event.body);

  // Prepare parameter required by Cognito's SignupCommand
  const params = {
    ClientId: COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: fullName },
    ],
  };

  try {
    const command = new SignUpCommand(params);
    await client.send(command);

    const newUser = new UserModel(email, fullName);
    await newUser.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ msg: "User successfully signed up!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unexpected error", error: error.message }),
    };
  }
};
