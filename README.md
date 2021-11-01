## Steps to run the app

1. Rename the [.env.sample](.env.sample) file to `.env` and fill in the required configuration values
1. Add project's signed certificates(`server-key.pem`/`server-cert.pem`) in keys folder
1. Install the dependencies with `npm install`
1. Start the server `npm start`
1. Deploy backend - npm run deploy
1. Visit `https://localhost:8443` (set port value 8443 in .env)

## Production using pm2
1. create file .pm2.json in root directory
1. paste .pm2.json.sample file content into .pm2.json file or can edit pm2 configs 
1. pm2:deploy - install all dependencies and deploy app
1. pm2:stop - stop pm2 instance
1. pm2:restart - restart running pm2 instance