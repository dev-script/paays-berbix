const { body } = require('express-validator');
const { phone } = require('phone');
const { Users } = require('../../db/models');
const { 
    getDocument,
} = require("../../db/controllers");
const { message, constants } = require('../../config');

const { REGEX_PATTERN } = constants;

const validate = (method) => {
    if (method === 'login') {
        return [
            body('username').exists().withMessage(message.USERNAME_REQUIRED)
                .custom(value => value.length >= 1 && value.length <= 255).withMessage(message.PLEASE_CHECK_INPUT_LENGTH),
            body('password').exists().withMessage(message.EMAIL_REQUIRED)
                .matches(REGEX_PATTERN.PASSWORD, "i").withMessage(message.INVALID_USERNAME_PASSWORD)
                .custom(value => value.length >= 1 && value.length <= 255).withMessage(message.PLEASE_CHECK_INPUT_LENGTH)
        ]
    }
    if (method === 'sign-up') {
        return [
            body('name').exists().withMessage(message.NAME_REQUIRED)
                .custom(value => value.length >= 1 && value.length <= 255).withMessage(message.PLEASE_CHECK_INPUT_LENGTH),
            body('username').exists().withMessage(message.USERNAME_REQUIRED)
                .custom(value => value.length >= 1 && value.length <= 255).withMessage(message.PLEASE_CHECK_INPUT_LENGTH)
                .custom(value => {
                    return getDocument(Users, {username: value}).then((user) => {
                        if(user){
                            return Promise.reject(message.USER_ALREADY_EXISTS);
                        }
                        return true;
                    })
                }),
            body('password').exists().withMessage(message.USER_PASSWORD_REQUIRED)
                .matches(REGEX_PATTERN.PASSWORD, "i").withMessage(message.INVALID_PASSWORD_PATTERN)
                .custom(value => value.length >= 1 && value.length <= 255).withMessage(message.PLEASE_CHECK_INPUT_LENGTH),
            body('phonenumber').exists().withMessage(message.PHONE_NUMBER_REQUIRED)
                .custom( value => {
                    const { isValid } = phone(value);
                    if(!isValid){
                        return Promise.reject(message.INVALID_PHONE_NUMBER);
                    }
                    return true;
                }),
            body('subscription_start').exists().withMessage(message.SUBSCRIPTION_START_DATE_REQUIRED)
                .matches(REGEX_PATTERN.DATE, "i").withMessage(message.INVALID_SUBCRIPTION_START_DATE),
            body('subscription_end').exists().withMessage(message.SUBSCRIPTION_END_DATE_REQUIRED)
                .matches(REGEX_PATTERN.DATE, "i").withMessage(message.INVALID_SUBCRIPTION_END_DATE),
        ]
    }
}

module.exports = { validate }