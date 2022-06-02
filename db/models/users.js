/**
 * @file users.js
 * @summary Defines user schema
 * */

const { Schema, model } = require('mongoose');
const { message } = require('../../config');

const userSchema = new Schema({
    transactionId: {
        type: String,
        trim: true,
        required: true,
    },
    refreshToken: {
        type: String,
        trim: true,
        required: true,
    },
    customerUid: {
        type: String,
        trim: true,
        required: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
    },
    countryCode: {
        type: String,
        trim: true,
        required: true,
    },
    dealerEmail: {
        type: String,
        trim: true,
        required: true,
    },
    data: {
        type: Object,
    },
},
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
);

module.exports = {
    Users: model('Users', userSchema),
};
