const { param } = require('express-validator');
const { Users } = require('../../db/models');
const { getDocument } = require("../../db/controllers");
const { isObjectIdValid } = require("../../utilities/common-utils");
const { message } = require('../../config');

const validate = (method) => {
    if (method === "check-user"){
        return [
            param("userId")
                .exists().withMessage(message.ID_NOT_FOUND)
                .custom(value => {
                    const isValid = isObjectIdValid(value);
                    if(!isValid){
                        return Promise.reject(message.INVALID_REQUEST_ID);
                    }
                    return true;
                })
                .custom(value => {
                    return getDocument( Users, {_id: value}).then((user) => {
                        if(!user){
                            return Promise.reject(message.USER_DOES_NOT_EXIST);
                        }
                        return true;
                    })
                }),
        ]
    }
}

module.exports = { validate }