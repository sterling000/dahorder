# dahorder

This app runs with the serverless framework

Install the Serverless Framework

run npm i -g serverless

The project contains:

- several microservices under the api directory
- main frontend is under the website directory
- admin frontend is under the admin directory
  The two websites are under separate directories so they can be deployed independently, they are also built using serverless components (meaning they were started from basic templates serverless provides to get you started, they require less configuration than building from scratch, they use amazon s3 web hosting and quickly map domains when needed

Before deploying either the website or the admin panel, you will want to configure the api's and deploy them each individually (you can script deploying them all at once or hook up some cicd of your own, but i'll explain manual steps for better understanding)

The order-service has dependencies on many of the other services, so it must be deployed last.

tip: instead of typing out serverless for every command you can just type out sls i.e. instead of serverless deploy, you type sls deploy

you may be prompted to login to the serverless dashboard and create an org and setup provider keys at some steps along the way.

Each service and each component have their own serverless.yml file that contains the configuration for that service. You'll find a serverless.yml file in the root of each microservice's directory and the root of both the website components.

Once you've logged into the dashboard and created an org, you'll want to make sure you go into every serverless.yml file in the project, and replace the org value from the repo with your own org (we don't share an org because serverless orgs with more than one developer cost money).

when you deploy your own services you'll be given your own api gateway endpoints, something like https://0rbglqxm0g.execute-api.ap-southeast-1.amazonaws.com/dev, you'll need to create a .env.dev file in the website directory and the admin directory so that the urls can be loaded by the vuejs code by environment variables. Once you've deployed the user-service, shop-service, product-service, image-service, and admin-service, you can deploy the order-service, and put each of those URL's into your .env files.

Also, don't forget the VUE_APP_IMAGE_S3_BUCKET env variable, it needs to match the value defined in the image service that creates the bucket. Warning: bucket names are global for everyone, not just your account, so it needs to be globally unique, i suggest something that incorporates the project name, stage, and even region to avoid conflicts.

Lastly, until I can figure out how to have your AWS AccountId dynamically put into lambda code (i'll probably use environment variables) each "validator" and "authorizer" lambda has hard coded AccountId's in the policy document statements.

You also need to be running node v14.15.1 (latest breaks some things)
