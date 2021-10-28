/**
 * @file users.js
 * @summary Defines user schema
 * */

const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { message, constants } = require('../../config');

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


userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
})

module.exports = {
    Users: model('Users', userSchema),
};
