const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { Users } = require('../../db/models');
const { 
    getDocument,
    createDocument,
} = require("../../db/controllers");
const { constants, message } = require('../../config');
const { createToken } = require('../middlewares/authentication');
const { catchFunction } = require('../../utilities/common-utils');

const { SUCCESS, ERROR } = constants;

module.exports = function (app) {

    /**
     * @api {post} /api/v1/login user login
     * @apiName login
     * @apiGroup Authentication
     * @apiVersion 0.0.1
     *
     * @apiDescription This API is used to login a user.
     * 
     * @apiHeader (Headers) {String} Content-Type application/json
     * 
     * @apiParam {String}   username           user's registered username.
     * @apiParam {String}   password           user's password.
     *
     * @apiParamExample {json} Request-Example:
     * {
	    "username": "dev313",
	    "password": "P@ssword@123",
	}
     * @apiSuccess {String}  message login successfully
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
        {
            "message": "login successfully",
            "status": 1,
            "data": {
                "user": {
                    "_id": "6168701dcc69d74a1eac1442",
                    "subscription_start": "2021-10-14T13:02:01.767Z",
                    "subscription_end": "2021-10-14T13:02:01.767Z",
                    "created_at": "2021-10-14T17:59:57.272Z",
                    "updated_at": "2021-10-14T17:59:57.272Z",
                    "__v": 0
                },
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoxNjM0Mzk3NjQ5OTE0LCJfaWQiOiI2MTY4NzAxZGNjNjlkNzRhMWVhYzE0NDIiLCJzdWJzY3JpcHRpb25fc3RhcnQiOiIyMDIxLTEwLTE0VDEzOjAyOjAxLjc2N1oiLCJzdWJzY3JpcHRpb25fZW5kIjoiMjAyMS0xMC0xNFQxMzowMjowMS43NjdaIiwiY3JlYXRlZF9hdCI6IjIwMjEtMTAtMTRUMTc6NTk6NTcuMjcyWiIsInVwZGF0ZWRfYXQiOiIyMDIxLTEwLTE0VDE3OjU5OjU3LjI3MloiLCJfX3YiOjAsImlhdCI6MTYzNDM5NzY0OSwiZXhwIjoxNjM1MDAyNDQ5fQ.KsVJxkvaeCL-_5-7H0tjIE8ph3BnMbcvyDoKmWznroM"
            }
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

    app.login = async (req, res) => {
        try {
            // check request middleware error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: errors.array({ onlyFirstError: true })[0].msg,
                });
            };

            // convert email to lowercase letters
            req.body.username = (req.body.username).toLowerCase();
            const { username, password } = req.body;

            const userData = await getDocument( Users, { username });

            if (!userData) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: message.INVALID_USERNAME_PASSWORD,
                });
            };

            const isMatch = await bcrypt.compare(password, userData.password);

            if(!isMatch){
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: message.INVALID_USERNAME_PASSWORD,
                });
            };

            // these fields should remove from userData object before token generation
            delete userData.password;
            delete userData.name;
            delete userData.username;

            const token = await createToken(userData);

            return res.status(SUCCESS.CODE).send({
                message: message.USER_LOGIN_SUCCESSFULLY,
                status: 1,
                data: {
                    user: userData,
                    token,
                }, 
            });

        } catch (loginError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'authentication.controller.js',
                methodName: 'login',
                error: loginError,
            });
        }
    };

    /**
     * @api {post} /api/v1/sign-up user sign up
     * @apiName sign up
     * @apiGroup Authentication
     * @apiVersion 0.0.1
     *
     * @apiDescription This API is used to sign up a user.
     * 
     * @apiHeader (Headers) {String} Content-Type application/json
     * 
     * @apiParam {String}   name               user's name
     * @apiParam {String}   username           user's registered username.
     * @apiParam {String}   password           user's password.
     * @apiParam {Date}     subscription_start subscription's start date.
     * @apiParam {Date}     subscription_end   subscription's end date.
     *
     * @apiParamExample {json} Request-Example:
        {
            "name": "Devendra Singh Shekhawat",
            "username": "dev313",
            "password": "Password@123",
            "subscription_start": "2021-10-14 18:32:01.767+05:30",
            "subscription_end": "2021-10-14 18:32:01.767+05:30"
        }
     * @apiSuccess {String}  message signup successfully
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
        {
            "message": "signup successfully",
            "status": 1,
            "data": {
                "_id": "616aee41a17c8d8f6983e976",
                "name": "Devendra Singh Shekhawat",
                "username": "dev313",
                "password": "$2a$10$Dt9JA3Lnu406wn00oa3M8epqpYB0EUjV50pdbhAaVJhXIWqaINt2m",
                "phonenumber": "+917976759710",
                "subscription_start": "2021-10-14T13:02:01.767Z",
                "subscription_end": "2021-10-14T13:02:01.767Z",
                "created_at": "2021-10-16T15:22:41.533Z",
                "updated_at": "2021-10-16T15:22:41.533Z",
                "__v": 0
            }
        }
     *  @apiError (Error : Internal Error 500) {String} message Something went wrong.
     *
     *  @apiErrorExample Error-Response: Internal Error
     *     HTTP/1.1 500 Internal Error
     *     {
     *        "message": "Something went wrong"
     *     }
     */

    app.signUp = async (req,res) => {
        try {
            // check request middleware error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: errors.array({ onlyFirstError: true })[0].msg,
                });
            };
            const userData = req.body;
            const result = await createDocument(Users, userData);
            return res.status(SUCCESS.CODE).send({
                message: message.USER_SIGN_UP_SUCCESSFULLY,
                status: 1,
                data: result,
            });
        } catch (signupError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'authentication.controller.js',
                methodName: 'signUp',
                error: signupError,
            });
        }
    };

    
};