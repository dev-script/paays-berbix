const { Users } = require('../../db/models');
const { validationResult } = require('express-validator');
const { 
    getDocumentById,
    getAllDocuments,
    updateDocument,
    deleteDocument,
} = require("../../db/controllers");
const { constants, message } = require('../../config');
const { catchFunction } = require('../../utilities/common-utils');

const { SUCCESS, ERROR } = constants;

module.exports = function (app) {
    app.getUser = async function (req, res) {
        try {
            // check request middleware error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: errors.array({ onlyFirstError: true })[0].msg,
                });
            };
            const { userId } = req.params;
            const result = await getDocumentById(Users, userId);
            return res.status(SUCCESS.CODE).send({
                status: 1,
                data: result,
            });
        } catch (getUserError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'users.controller.js',
                methodName: 'getUser',
                error: getUserError,
            });
        }
    };

    /**
     * @api {get} /api/v1/users get all users list
     * @apiName get-users
     * @apiGroup User
     * @apiVersion 0.0.1
     *
     * @apiDescription This API is used to list all user.
     * 
     * @apiHeader (Headers) {String} Authorization Bearer/Token
     * @apiHeader (Headers) {String} Content-Type application/json
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
        {
            "status": 1,
            "data": [
                {
                    "_id": "616aee41a17c8d8f6983e976",
                    "name": "Devendra Singh Shekhawat",
                    "username": "dev762",
                    "phonenumber": "+917976759710",
                    "subscription_start": "2021-10-14T13:02:01.767Z",
                    "subscription_end": "2021-10-14T13:02:01.767Z",
                    "created_at": "2021-10-16T15:22:41.533Z",
                    "updated_at": "2021-10-16T15:22:41.533Z",
                    "__v": 0
                }
            ]
        }
     *
     *  @apiError (Error : Internal Error 500) {String} message Something went wrong.
     *
     *  @apiErrorExample Error-Response: Internal Error
     *     HTTP/1.1 500 Internal Error
     *     {
     *        "message": "Something went wrong"
     *     }
     */

    app.getUsers = async function (req, res) {
        try {
            const result = await getAllDocuments(Users);
            return res.status(SUCCESS.CODE).send({
                status: 1,
                data: result,
            });
        } catch (getUsersError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'users.controller.js',
                methodName: 'getUsers',
                error: getUsersError,
            });
        }
    };

    app.updateUser = async function (req, res) {
        try {
            // check request middleware error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: errors.array({ onlyFirstError: true })[0].msg,
                });
            };
            const { userId } = req.params;
            const data = req.body;

            // can not change username, password & user role
            if (data && data.username) delete data.username;
            if (data && data.password) delete data.password;

            const updateUserResult = await updateDocument( Users, { _id: userId }, data);
            return res.status(SUCCESS.CODE).send({
                message: message.UPDATED_SUCCESSFULLY,
                status: 1,
                data: updateUserResult,
            });
        } catch (updateUserError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'users.controller.js',
                methodName: 'updateUser',
                error: updateUserError,
            });
        }
    };

    app.deleteUser = async function (req, res) {
        try {
            // check request middleware error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: errors.array({ onlyFirstError: true })[0].msg,
                });
            };
            const { userId } = req.params;
            const deleteUserResult = await deleteDocument( Users, userId);
            return res.status(SUCCESS.CODE).send({
                message: message.DELETED_SUCCESSFULLY,
                status: 1,
                data: deleteUserResult,
            });
        } catch (deleteUserError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'users.controller.js',
                methodName: 'deleteUser',
                error: deleteUserError,
            });
        }
    };
};