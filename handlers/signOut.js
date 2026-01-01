const {
  GlobalSignOutCommand,
  CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

// specify the cognitor app client id
// the app client id tells congnitor which app is making the request

const COGNITO_CLIENT_ID = process.env.CLIENT_ID;

exports.signOut = async (event) => {
  const { token } = JSON.parse(event.body);

  const params = {
    AccessToken: token,
  };

  try {
    const command = new GlobalSignOutCommand(params);

    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User successfully signed Out!",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "sign-out failed",
        error: error.message,
      }),
    };
  }
};
