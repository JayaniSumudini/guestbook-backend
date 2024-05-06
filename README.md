# guestbook-backend

# Node.js Express TypeScript MongoDB Backend Project

This project is a backend server for guestbook website built with Node.js, Express, TypeScript, and MongoDB. It provides APIs to interact with a MongoDB database.

You can create users by register to the app.
And to test admin features, use below account

email: admin@gmail.com
password: Pass@123


## Features

- **Serverless Architecture**: Utilizes serverless technologies for efficient scaling and cost-effectiveness.
- **Express Framework**: Implements the popular Express framework for handling HTTP requests and routing.
- **TypeScript**: Written in TypeScript for enhanced code maintainability and type safety.
- **MongoDB**: Integrates MongoDB for data storage and management.
- **AWS Lambda**: Deploys to AWS Lambda for serverless execution.
- **API Gateway**: Integrates with API Gateway for managing RESTful APIs.

## Prerequisites

Before running this application locally, ensure you have the following installed:

- Node.js: [Download and install Node.js](https://nodejs.org/)
- yarn
- AWS CLI (for deployment to AWS)
- MongoDB (for local development)

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/JayaniSumudini/guestbook-backend.git
   ```

2. Navigate to the project directory:

   ```bash
   cd guestbook-backend
   ```

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Set up environment variables:

   Create a `config/default.json` file in the root directory and define the following variables:
   (Added this to repo for testing purposes)

   ```
   "mongoURI": "",
   "jwtSecret": "",
   "jwtResetPasswordSecret": "",
   "jwtExpiration": "1h"
   ```

5. Start the server:

   ```bash
   yarn start
   ```

## Deployment

To deploy the backend to AWS Lambda, follow these steps:

1. **Configure AWS CLI**:
   If you haven't configured AWS CLI, run:

   ```bash
   aws configure
   ```

   and provide your AWS access key, secret key, region, and output format.

2. **Build the project**:

   ```bash
   yarn build
   ```

3. **Deploy the application**:

   ```bash
   yarn deploy
   ```

4. **Access the deployed API**:
   After successful deployment, you will receive the API endpoint URL. You can use this URL to access your deployed APIs.
   For this project endpoint url is : https://cc9vqgsdzd.execute-api.ap-southeast-1.amazonaws.com/dev/api

## Project Structure

```
.
├── src/                  # Source files
│   ├── controllers/      # Request handlers/controllers
│   ├── models/           # Data models
│   ├── routes/           # Route definitions
│   ├── services/         # Database connection services
│   ├── types/            # Common data types
│   └── app.ts            # Express application setup
├── dist/                 # Compiled JavaScript files
├── config/               # Example environment variables
├── package.json          # Project dependencies and scripts
├── serverless.yml        # Serverless configuration file
└── tsconfig.json         # TypeScript configuration
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

Feel free to adjust the content according to your specific project requirements.
```
