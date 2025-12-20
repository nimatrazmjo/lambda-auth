const {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

// specify the cognitor app client id
// the app client id tells congnitor which app is making the request

const COGNITO_CLIENT_ID = process.env.CLIENT_ID;

exports.signin = async (event) => {
  const { email, password } = JSON.parse(event.body);

  console.log(email, password);
  const params = {
    ClientId: COGNITO_CLIENT_ID,
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);
    console.log(response, "login response");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User successfully signed in!",
        token: response.AuthenticationResult,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "sign-in failed",
        error: error.message,
      }),
    };
  }
};
