require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const log4js = require('log4js');
const bodyParser = require('body-parser');
const compression = require('compression');
const fs = require('fs');
const { appUtility } = require('./utilities/server-utils');
const { constants } = require('./config');
const { connectToMongoDb } = require('./db');
const { logger } = require("./utilities/log-service.js");

const app = express();
const port = constants.PORT || 8443;

global.logger = logger;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static('static'));
app.use(morgan('combined'));
app.use(compression());

// load all controller =========================================================
appUtility.loadControllers(app);

// load all routes and middleware =========================================================
appUtility.loadRoutesAndMiddleware(app);

// configuration loggers and sys log
log4js.configure(path.join(__dirname, './config/log-config.json'));

// Event listener to catch uncaught errors
process.on('unhandledRejection', (error) => {
    const loggerObject = {
      fileName: "server.js",
      methodName: "unhandledRejection",
      type: constants.LOGGER_LEVELS.ERROR,
      error,
    };
    global.logger(loggerObject);
    console.log(`unhandledRejection : ${error}`);
    process.exit(1);
});

// Establish mongodb connection
connectToMongoDb();

http.createServer({
    key: fs.readFileSync(path.join(__dirname, '/keys', 'server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/keys', 'server-cert.pem')),
}, app).listen(port);