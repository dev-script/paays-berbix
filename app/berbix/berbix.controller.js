const { phone } = require('phone');
const { Users } = require('../../db/models');
const {
    getDocumentById,
    getAllDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    createDocument,
} = require("../../db/controllers");
const { createTransaction, getTransactionData } = require('./berbix.service');
const { formatTransactionData } = require('./berbix.utils');
const { constants, message } = require('../../config');
const { catchFunction } = require('../../utilities/common-utils');

const { SUCCESS, ERROR } = constants;

module.exports = function (app) {
    app.saveTransaction = async (req, res) => {
        try {
            const {
                phoneNumber,
                dealerEmail,
                countryCode,
            } = req.query;
            const country_code = countryCode ? countryCode : 'CA';
            if (phoneNumber && dealerEmail && country_code) {
                const result = phone(phoneNumber, {
                    country: country_code,
                });
                const { isValid } = result;
                const re = constants.REGEX_EMAIL;
                const isValidEmail = re.test(dealerEmail.toLowerCase());
                if (!isValidEmail) throw new Error('Invalid email');
                if (!isValid) throw new Error('Invalid phone number');
                else {
                    const transaction = await createTransaction(phoneNumber, dealerEmail);
                    const {
                        customer_uid,
                        transaction_id,
                        refresh_token,
                        hosted_url,
                    } = transaction;

                    // check if same phone number exists in database
                    const userData = await getDocument(Users, { phoneNumber });

                    // remove user data if exists with same phone number
                    if (userData) {
                        // remove user data from db
                        await deleteDocument(Users, userData._id)
                    }

                    // save data in db
                    await createDocument(Users, {
                        customerUid: customer_uid,
                        transactionId: transaction_id,
                        refreshToken: refresh_token,
                        phoneNumber,
                        dealerEmail,
                        countryCode: country_code,
                    });
                    return res.redirect(hosted_url);
                }
            } else throw new Error('missing request params phone number/email');
        } catch (saveTransactionError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'berbix.controller.js',
                methodName: 'saveTransaction',
                error: saveTransactionError,
            });
        }
    }

    app.getUserData = async(req,res) => {
        try {
            const { phoneNumber } = req.params;
            if (!phoneNumber) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    message: message.PLEASE_PROVIDE_PHONE_NUMBER,
                });
            }
            const userData = await getDocument(Users, { phoneNumber }, {}, { sort: { createdAt: -1 } });
            if (!userData) {
                return res.status(SUCCESS.CODE).send({
                    message: message.USER_NOT_FOUND,
                });
            }
            const { _id: userId, refreshToken } = userData;
            const fetchResponse = await getTransactionData(refreshToken);
            //format transaction meta data
            const formattedResponse = formatTransactionData(fetchResponse);
            await updateDocument(Users, {
                _id: userId
            }, {
                data: formattedResponse
            })
            return res.status(SUCCESS.CODE).send({ data : fetchResponse });
        } catch (getUserDataError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'berbix.controller.js',
                methodName: 'getUserData',
                error: getUserDataError,
            });
        }
    }

    app.getUser = async (req, res) => {
        try {
            // get user data from db
            let data;
            if (req.params && req.params.id) {
                const { id } = req.params;
                data = await getDocumentById(Users, id);
            } else {
                // add pagination
                const { dealerEmail } = req.query;
                const page = parseInt(req.query.page, 10);
                const limit = parseInt(req.query.limit, 10);
                const skip = (page - 1) * limit;
                if (dealerEmail) {
                    const re = constants.REGEX_EMAIL;
                    const isValidEmail = re.test(dealerEmail.toLowerCase());
                    if (!isValidEmail) {
                        return res.status(ERROR.BAD_REQUEST.CODE).send({
                            message: messages.INVALID_EMAIL,
                        });
                    }
                    data = await getAllDocuments(Users, { dealerEmail }, {}, { sort: { createdAt: -1 }, skip, limit });
                } else {
                    data = await getAllDocuments(Users, {}, {}, { sort: { createdAt: -1 }, skip, limit });
                }
            }
            // let renameObjectKeys = (object) => {
            //     object.phoneNumber = object.phone;
            //     object.dealerEmail = object.email;
            //     delete object.phone;
            //     delete object.email;
            // };
            // data.map(item => renameObjectKeys(item));
            return res.status(SUCCESS.CODE).send({ data });
        } catch (getUserError) {
            return catchFunction({
                res,
                requestId: req._id,
                fileName: 'berbix.controller.js',
                methodName: 'getUser',
                error: getUserError,
            });
        }
    };
};