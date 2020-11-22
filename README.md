# Tracer
THIS IS A HACKATHON PROJECT - DO NOT USE AS PRODUCTION CODE!
https://telstrahealth.com/H4DH - 2020, Team 1.

## security-console
This is a sample web app to demo what a central management app might look like.

### Prereqs
Follow this tutorial: https://docs.amplify.aws/start/getting-started/setup/q/integration/react

### Deploying

Some general Amplify commands for reference:
"amplify status" will show you what you've added already and if it's locally configured or deployed
"amplify add <category>" will allow you to add features like user login or a backend API
"amplify push" will build all your local backend resources and provision it in the cloud
"amplify console" to open the Amplify Console and view your project status
"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud

## identify-face
This is a dotnet core console app to test the Azure Cognitive Services functionality

### Prereqs
Install dotnet core https://dotnet.microsoft.com/download

Set up an Azure subscription

Create a Face resource in the Azure portal to get your key and endpoint (https://portal.azure.com/#create/Microsoft.CognitiveServicesFace)
You can use the free pricing tier (F0) to try the service, and upgrade later to a paid tier for production.

Put a key and endpoint from the Face resorce into Environment Variables:
AZURE_COGNITIVE_SUBSCRIPTION_KEY
AZURE_COGNITIVE_ENDPOINT

Create an Azure storage account with the default options.
Create a private container within there for "unknown-images" and set the URL for Environment Variable:
AZURE_COGNITIVE_IMAGE_BASE_URL

