const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const crypto = require("crypto");

const TABLE_NAME = "Users";

const dynamoClient = new DynamoDBClient({
  region: process.env.REGION,
});

class UserMode {
  constructor(email, fullName) {
    this.userId = crypto.randomUUID();
    this.email = email;
    this.fullName = fullName;
    this.state = "";
    this.city = "";
    this.locality = "";
    this.createdAt = new Date().toISOString();
  }

  async save() {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        userId: { S: this.userId },
        email: { S: this.email },
        fullName: { S: this.fullName },
        state: { S: this.state },
        city: { S: this.city },
        locality: { S: this.locality },
        createdAt: { S: this.createdAt },
      },
    };

    try {
      const user = new PutItemCommand(params);
      await dynamoClient.send(user);
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = UserMode;
