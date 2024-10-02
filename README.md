# SSR Editor

Project for DV1677 JSRamverk

## Setup:
```
#from root
npm install dotenv

[!IMPORTANT]
requires the password for mongodb atlas to be set in a .env file in order to connect to the cloud database
#in .env
PORT={port}                             #port = example routes: [8080, 8585, 3000] sets port for application to run on
DB_PASS="{valid password string}"       #password for cloud database
```

## To start application:
```
node app.mjs || npm start app.mjs       #for development purposes 
```


## Selection of front-end framework:
We choose to work with the framework react because it's the most common used js framework in the corporate world.