/**
 * @file auth.js
 * @summary User authentication and verification middleware
 * @description This file contains utility methods for authentication and verification of user.
 * */

const { sign, verify } = require('jsonwebtoken');
const { constants, message } = require('../../config');

const { ERROR } = constants;

const { SECRET } = constants;

/**
 * Method to extract and verify JWT token from HTTP headers
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next HTTP next callback method
 * */
const authenticateUserWithToken = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(ERROR.UNAUTHENTICATED.CODE).send({
                status: 0,
                message: message.ACCESS_DENIED,
            });
        }
        const authParts = auth.split(" ");
        if (authParts.length !== 2) {
            return res.status(ERROR.UNAUTHENTICATED.CODE).send({
                status: 0,
                message: 'Format is: Bearer <token>',
            });
        }
        const [scheme, token] = authParts;
        if (new RegExp("^Bearer$").test(scheme)) {
            try {
                const user = await verify(token, SECRET);
                req.user = user;
                next();
            } catch (error) {
                const loggerObject = {
                    requestId: req._id,
                    fileName: "authentication.js",
                    methodName: "authenticateUserWithToken",
                    type: constants.LOGGER_LEVELS.ERROR,
                    error,
                };
                global.logger(loggerObject);
                return res.status(ERROR.UNAUTHENTICATED.CODE).send({
                    status: 0,
                    message: error.message,
                });
            }
        } else {
            return res.status(ERROR.UNAUTHENTICATED.CODE).send({
                status: 0,
                message: 'Format is: Bearer <token>',
            });
        }
    } catch (authenticationError) {
        const loggerObject = {
            requestId: req._id,
            fileName: "authentication.js",
            methodName: "authenticateUserWithToken",
            type: constants.LOGGER_LEVELS.ERROR,
            error: authenticationError,
        };
        global.logger(loggerObject);
        return res.status(authenticationError.code).send({ 
            status: 0,
            message: authenticationError.message
        });
    }
};

/**
 * Method to generate token from a given payload
 * @param {object} payload Payload to be injected in token
 * */
const createToken = payload => {
    const tokenPayload = Object.assign({ time: new Date().getTime() }, payload);
    return sign(tokenPayload, SECRET, { expiresIn: "7 days" });
};

module.exports = {
    createToken,
    authenticateUserWithToken
};