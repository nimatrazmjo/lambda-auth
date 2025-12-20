const {
  ConfirmSignUpCommand,
  CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

// specify the cognitor app client id
// the app client id tells congnitor which app is making the request

const COGNITO_CLIENT_ID = process.env.CLIENT_ID;

exports.confirmSignUp = async (event) => {
  const { email, code } = JSON.parse(event.body);

  const params = {
    ClientId: COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  };

  try {
    const command = new ConfirmSignUpCommand(params);

    await client.send(command);
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
