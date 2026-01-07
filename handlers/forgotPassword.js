const {
  CongnitoIdentityProviderClient,
  ForgotPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CongnitoIdentityProviderClient({
  region: "us-east-1",
});

exports.forgotPassword = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email is required" }),
      };
    }

    const params = {
      ClientId: process.env.CLIENT_ID,
      Username: email,
    };

    const command = new ForgotPasswordCommand(params);
    await cognitoClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message:
          "Password reset initiated. Check your email for further instructions.",
      }),
    };
  } catch (error) {
    console.error("Error initiating forgot password:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
