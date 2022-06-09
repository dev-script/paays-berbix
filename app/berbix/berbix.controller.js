const { phone } = require('phone');
const axios = require('axios');
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
const s3 = require('../../utilities/s3');
const { catchFunction } = require('../../utilities/common-utils');
const { maxMindService } = require('../../utilities/maxmind-service');
const { hrfaService } = require('../../utilities/hrfa-service');

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
                const requestedIP = '103.59.75.111' //(req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
                const validIp = constants.REGEX_IP_ADDRESS.test(requestedIP);
                if (!validIp) {
                    throw new Error('invalid user ip address');
                }
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

                    let maxmindReport = null;
                    // maxmind service
                    maxMindService({ ipAddress: requestedIP }).then(response => {
                        maxmindReport = response;
                    }).catch(error => {
                        catchFunction({
                            res,
                            requestId: req._id,
                            fileName: 'berbix.controller.js',
                            methodName: 'maxMindService',
                            error,
                            onlyLog: true,
                        });
                    })

                    // save data in db
                    await createDocument(Users, {
                        customerUid: customer_uid,
                        transactionId: transaction_id,
                        refreshToken: refresh_token,
                        phoneNumber,
                        dealerEmail,
                        userIpAddress: requestedIP,
                        maxmindReport,
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
            const { _id: userId, refreshToken, transactionId, userIpAddress } = userData;

            let { maxmindReport=null } = userData;
            let hrfaReport = null;

            const fetchResponse = await getTransactionData(refreshToken);
            //format transaction meta data
            let formattedResponse = {};
            if (fetchResponse && Object.keys(fetchResponse).length) formattedResponse = formatTransactionData(fetchResponse);
            if (formattedResponse && Object.keys(formattedResponse).length) {
                const { images={} } = formattedResponse;

                if (images && Object.keys(images.front).length > 0 && images.front['cropped_image']){
                    // upload user images in s3 bucket
                    const frontImageResponse = await axios.get(images.front['cropped_image'],  { responseType: 'arraybuffer' });
                    const frontImageBuffer = Buffer.from(frontImageResponse.data, "utf-8");
                    await s3.uploadContent(frontImageBuffer, transactionId, `front-${transactionId}`);
                }

                if (images && Object.keys(images.front).length > 0 && images.front['face_image']){
                    const faceImageResponse = await axios.get(images.front['face_image'],  { responseType: 'arraybuffer' });
                    const faceImageBuffer = Buffer.from(faceImageResponse.data, "utf-8");
                    await s3.uploadContent(faceImageBuffer, transactionId, `face-${transactionId}`);
                }

                if (images && Object.keys(images.back).length > 0 && images.back['cropped_image']){
                    const backImageResponse = await axios.get(images.back['cropped_image'],  { responseType: 'arraybuffer' });
                    const backImageBuffer = Buffer.from(backImageResponse.data, "utf-8");
                    await s3.uploadContent(backImageBuffer, transactionId, `back-${transactionId}`);
                }

                if (images && Object.keys(images.selfie).length > 0 && images.selfie['face_image']){
                    const selfieImageResponse = await axios.get(images.selfie['face_image'],  { responseType: 'arraybuffer' });
                    const selfieImageBuffer = Buffer.from(selfieImageResponse.data, "utf-8");
                    await s3.uploadContent(selfieImageBuffer, transactionId, `selfie-${transactionId}`);
                }
                
                const isUser = Object.keys(formattedResponse?.user).length;
                if (isUser) {
                    try {
                        hrfaReport = await hrfaService(formattedResponse.user);
                        const { message } = hrfaReport;
                        if (message && message.idv_response === 'Failed') {
                            message.checkType = 'Fraud Check';
                            message.checkValue = 'Failed';
                        } else if (message && message.idv_response === 'Verified') {
                            message.checkType = 'Fraud Check';
                            message.checkValue = 'Verified';
                        }else {
                            message.checkType = 'Fraud Check';
                            message.checkValue = 'Inconclusive';
                        }
                        formattedResponse.checks.push({
                            type: "FRAUD_CHECK",
                            report: message,
                        })
                    } catch (error) {
                        formattedResponse.checks.push({
                            type: "FRAUD_CHECK",
                            report: {
                                checkType:"Fraud Check",
                                checkValue:"N / A",
                            },
                        })
                        catchFunction({
                            res,
                            requestId: req._id,
                            fileName: 'berbix.controller.js',
                            methodName: 'getUserData-hrfaReport',
                            error,
                            onlyLog: true,
                        });
                    }
                    if (!maxmindReport && userIpAddress) {
                        // maxmind service
                        maxMindService({ ipAddress: userIpAddress }).then(response => {
                            maxmindReport = response;
                        }).catch(error => {
                            catchFunction({
                                res,
                                requestId: req._id,
                                fileName: 'berbix.controller.js',
                                methodName: 'maxMindService',
                                error,
                                onlyLog: true,
                            });
                        })
                    }
                }
            }
            await updateDocument(Users, {
                _id: userId
            }, {
                maxmindReport,
                hrfaReport,
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
            let data;
            if (req.params && req.params.id) {
                const { id } = req.params;
                data = await getDocumentById(Users, id);
            } else {
                // add pagination
                const { dealerEmail, phoneNumber } = req.query;
                const page = parseInt(req.query.page, 10);
                const limit = parseInt(req.query.limit, 10);
                const skip = (page - 1) * limit;
                if (dealerEmail && phoneNumber) {
                    data = await getDocument(Users, { dealerEmail, phoneNumber });
                    if (!data) {
                        return res.status(SUCCESS.CODE).send({
                            status: 0,
                            message: message.USER_NOT_FOUND,
                        });
                    }
                }
                if (dealerEmail && !phoneNumber) {
                    const re = constants.REGEX_EMAIL;
                    const isValidEmail = re.test(dealerEmail.toLowerCase());
                    if (!isValidEmail) {
                        return res.status(ERROR.BAD_REQUEST.CODE).send({
                            status: 0,
                            message: message.INVALID_EMAIL,
                        });
                    }
                    data = await getAllDocuments(Users, { dealerEmail }, {}, { sort: { created_at: -1 }, skip, limit });
                }
                if (!dealerEmail && !phoneNumber) {
                    data = await getAllDocuments(Users, {}, {}, { sort: { created_at: -1 }, skip, limit });
                }
            }

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

    app.s3ImageData = async (req, res) => {
        try {
            const { transactionId } = req.query;
            if (!transactionId) {
                return res.status(ERROR.BAD_REQUEST.CODE).send({
                    status: 0,
                    message: messages.TRANSACTION_ID_REQUIRED,
                });
            }
            
            // read front and back image data
            const documentMediaList = [];
            const frontImageBuffer = await s3.readContent(transactionId, `front-${transactionId}`);
            documentMediaList.push({base64Content: frontImageBuffer});
            const backImageBuffer = await s3.readContent(transactionId, `back-${transactionId}`);
            documentMediaList.push({base64Content: backImageBuffer});
    
            return res.status(SUCCESS.CODE).send({ status:1, data: documentMediaList });
        } catch (s3ImageDataError) {
            catchFunction({
                res,
                requestId: req._id,
                fileName: 'berbix.controller.js',
                methodName: 's3ImageData',
                error: s3ImageDataError,
            });
        }
    };
};