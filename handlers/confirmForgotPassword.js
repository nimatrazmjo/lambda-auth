const {
  CongnitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const cognitoClient = new CongnitoIdentityProviderClient({
  region: "us-east-1",
});

exports.confirmForgotPassword = async (event) => {
  try {
    const { email, confirmationCode, newPassword } = JSON.parse(event.body);
    if (!email || !confirmationCode || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const params = {
      ClientId: process.env.CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    };

    const command = new ConfirmForgotPasswordCommand(params);
    await cognitoClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Password has been reset successfully" }),
    };
  } catch (error) {
    console.error("Error confirming forgot password:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
