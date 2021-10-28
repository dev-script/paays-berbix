/**
 * @file users.js
 * @summary Defines user schema
 * */

const { Schema, model } = require('mongoose');
const { message } = require('../../config');

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, message.NAME_REQUIRED],
    },
    username: {
        type: String,
        trim: true,
        required: [true, message.USERNAME_REQUIRED],
    },
    password: {
        type: String,
        trim: true,
        required: [true, message.USER_PASSWORD_REQUIRED],
    },
    phonenumber: {
        type: String,
        trim: true,
        required: true,
    },
    subscription_start: {
        type: Date,
        required: true,
    },
    subscription_end: {
        type: Date,
        required: true,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = {
    Users: model('Users', userSchema),
};
