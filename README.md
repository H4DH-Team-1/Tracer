# Tracer
THIS IS A HACKATHON PROJECT - DO NOT USE AS PRODUCTION CODE!
https://telstrahealth.com/H4DH - 2020, Team 1.


## Prereqs

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

