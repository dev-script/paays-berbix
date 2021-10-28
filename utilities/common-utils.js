const { constants, message } = require('../config');

const { ERROR } = constants;

const ObjectId = require('mongoose').Types.ObjectId;

const getError = (error) => {
    let result = error;
    if (error && error.message) {
        result = error.message;
    }
    return result;
}

const catchFunction = (_args) => {
    const { res, requestId, fileName, methodName, error } = _args;
    const loggerObject = {
        requestId,
        fileName,
        methodName,
        type: constants.LOGGER_LEVELS.ERROR,
        error,
    };
    global.logger(loggerObject);
    return res.status(ERROR.INTERNAL_SERVER_ERROR.CODE).send({
        status: 0,
        message: message.INTERNAL_SERVER_ERROR,
    });
}

/**
 * True if provided object ID valid
 * @param {string} id 
 */
const isObjectIdValid = (id) => {
    return ObjectId.isValid(id) && new ObjectId(id) == id;
};

module.exports = {
    isObjectIdValid,
    getError,
    catchFunction,
};
