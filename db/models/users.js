/**
 * @file users.js
 * @summary Defines user schema
 * */

const { Schema, model } = require('mongoose');
const { message } = require('../../config');

const userSchema = new Schema({
    transaction_id: {
        type: String,
        trim: true,
        required: true,
    },
    refresh_token: {
        type: String,
        trim: true,
        required: true,
    },
    customer_uid: {
        type: String,
        trim: true,
        required: true,
    },
    phone: {
        type: String,
        trim: true,
        required: true,
    },
    country_code: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    data: {
        type: Object,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = {
    Users: model('Users', userSchema),
};
