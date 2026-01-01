# Auth Service (AWS Serverless)

This project exposes a lightweight authentication API on AWS Lambda using the Serverless Framework v4. Each HTTP endpoint proxies an AWS Cognito user pool workflow (sign-up, confirmation, sign-in, and global sign-out) and records basic profile metadata inside a DynamoDB `Users` table for auditing purposes.

## Key Features
- **Cognito user flows** – wraps sign-up + confirmation, token-based sign-in, and global sign-out using the AWS SDK for JavaScript (v3).
- **DynamoDB persistence** – stores a generated `userId`, email address, full name, location placeholders, and timestamps whenever a user signs up (`models/userModel.js`).
- **Infrastructure as code** – `serverless.yml` provisions the Lambda functions, HTTP API routes, IAM permissions, and the backing DynamoDB table.
- **Ready for CI/CD** – deploy the entire stack with a single `serverless deploy` and tear it down with `serverless remove`.

## Architecture
| Component | Description |
| --- | --- |
| API Gateway (HTTP API) | Provides REST-style endpoints such as `/sign-up`, `/login`, etc. (`serverless.yml`). |
| AWS Lambda (Node.js 24) | Runs the handlers in `handlers/` and `handler.js`. |
| Amazon Cognito | Manages the user pool, verification codes, and tokens. The Cognito App Client ID is injected via `CLIENT_ID`. |
| Amazon DynamoDB | `Users` table stores metadata per registration via `models/userModel.js`. |
| AWS Systems Manager Parameter Store | Stores `/CLIENT_ID`, keeping secrets out of source control. |

## Prerequisites
- Node.js 18+ and npm (runtime for Serverless CLI and local tooling).
- [Serverless Framework CLI](https://www.serverless.com/framework/docs/getting-started) v4 (`npm install -g serverless`).
- AWS CLI configured with credentials that can manage Cognito, Lambda, API Gateway, DynamoDB, and SSM in the target region.
- An existing Cognito User Pool and App Client whose ID will be provided to this service.

## Installation & Setup
1. **Install dependencies** inside the repo root:
   ```bash
   npm init -y # if package.json does not yet exist
   npm install @aws-sdk/client-cognito-identity-provider @aws-sdk/client-dynamodb serverless
   ```
2. **Set required environment variables** for local commands:
   ```bash
   export AWS_REGION=us-east-1
   export REGION=us-east-1 # picked up by the handlers and DynamoDB client
   ```
3. **Store the Cognito App Client ID** in Parameter Store so `serverless.yml` can inject it at deploy time:
   ```bash
   aws ssm put-parameter \
     --name /CLIENT_ID \
     --value <your_app_client_id> \
     --type SecureString \
     --overwrite
   ```
4. **(Optional) Create the DynamoDB table ahead of time.** The stack already defines `Users`, so manual creation is only needed when testing outside of CloudFormation.

## Local Development
- `serverless dev` – spins up a local development loop that forwards HTTP calls through the deployed Lambda so you can iterate quickly.
- Alternatively, run unit tests or invoke handlers directly with `serverless invoke local -f signup --data '{"email":"","fullName":"","password":""}'`.

Ensure the following environment variables are present when invoking locally:
- `REGION` – the AWS region that holds your Cognito pool and DynamoDB table.
- `CLIENT_ID` – Cognito App Client ID (can be exported manually when running locally).

## Deployment
```bash
serverless deploy --stage dev
```
Deployment will:
- Provision/Update the HTTP API endpoints listed below.
- Create or update the IAM role granting `dynamodb:PutItem` on the `Users` table.
- Create the `Users` DynamoDB table if it does not exist.

Tear down everything with:
```bash
serverless remove --stage dev
```

## API Reference
| Method & Path | Handler | Description |
| --- | --- | --- |
| `GET /` | `handler.hello` | Health-check endpoint returning the default Serverless message. |
| `POST /sign-up` | `handlers/signUp.signUp` | Creates a Cognito user and persists metadata into DynamoDB. |
| `POST /confirm` | `handlers/confirmSignUp.confirmSignUp` | Confirms a user with the verification code emailed by Cognito. |
| `POST /login` | `handlers/signIn.signin` | Initiates the USER_PASSWORD_AUTH flow and returns Cognito tokens. |
| `POST /signout` | `handlers/signOut.signOut` | Performs a global sign-out for the supplied access token. |

### Payloads & Responses
`POST /sign-up`
```json
{
  "email": "me@example.com",
  "fullName": "Jane Doe",
  "password": "Sup3rSecure!"
}
```
Successful response:
```json
{ "msg": "User successfully signed up!" }
```

`POST /confirm`
```json
{
  "email": "me@example.com",
  "code": "123456"
}
```

`POST /login`
```json
{
  "email": "me@example.com",
  "password": "Sup3rSecure!"
}
```
Response contains the raw `AuthenticationResult` from Cognito:
```json
{
  "message": "User successfully signed in!",
  "token": {
    "AccessToken": "...",
    "IdToken": "...",
    "RefreshToken": "...",
    "ExpiresIn": 3600,
    "TokenType": "Bearer"
  }
}
```

`POST /signout`
```json
{
  "token": "<AccessToken from /login>"
}
```

## Data Model
The `Users` DynamoDB table (`models/userModel.js`) stores:
- `userId` *(PK, string)* – generated via `crypto.randomUUID()`.
- `email` *(string)* – Cognito username.
- `fullName` *(string)*.
- `state`, `city`, `locality` *(string placeholders)* – reserved for future profile enrichment.
- `createdAt` *(ISO string)* – server timestamp at sign-up.

## Troubleshooting
- **`CLIENT_ID` not set** – ensure the SSM parameter exists in the same region and that your deploy IAM role can read it.
- **`NotAuthorizedException` during `/login`** – confirm the user is verified and credentials are correct.
- **`ResourceNotFoundException` for DynamoDB** – run `serverless deploy` so CloudFormation can create the `Users` table, or create it manually with the same primary key (`userId` as HASH).
- **Different regions** – all resources (Cognito, DynamoDB, SSM) must live in `REGION`; mismatched regions manifest as `UserPool does not exist` errors.

## Next Steps
- Add validation/authorization (API keys, Cognito authorizers, etc.).
- Extend `UserModel` to persist user attributes beyond name/email.
- Add automated tests for each handler.

