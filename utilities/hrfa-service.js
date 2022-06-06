const axios = require('axios');
const HRFA_CODES = require('./hrfa-codes.json');
const { constants } = require('../config');

const { HRFA_REPORT_API } = constants;

const hrfaService = async (data) => {
    console.log(data)
    const { structured_postal_address, date_of_birth, given_names, family_name } = data;
    const {
        street_address,
        city_address,
        province_name,
        postal_code,
    } = structured_postal_address;

    const requestPayload = {};
    const addressPayload = {};
    if (street_address) addressPayload.streetAddress = street_address;
    if (city_address) addressPayload.city = city_address;
    if (province_name) addressPayload.provinceName = province_name;
    if (postal_code) addressPayload.postalCode = postal_code;
    requestPayload["CurrAddress"] = addressPayload;
    if (date_of_birth && date_of_birth.length) requestPayload["dateOfBirth"] = date_of_birth.split('-').join('');
    if (given_names && given_names.length) requestPayload["firstName"] = given_names;
    if (family_name && family_name.length) requestPayload["lastName"] = family_name;
    console.log(requestPayload)
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        axios.post(
            HRFA_REPORT_API,
            requestPayload,
            options,
        ).then((response) => {
            const xmlResponse = response.data.IFSXML;
            // check is response contains any type of error
            if (xmlResponse && xmlResponse.Errors) {
                return reject(xmlResponse);
            }
            // get HRFA code from response
            let code;
            const codes = xmlResponse.HAWK.Code;
            if (Array.isArray(codes)) {
                codes.sort(function(a, b){return a-b});
                code = codes[0];
            }else code = codes;
            // get code message
            const rule = HRFA_CODES[code];
            const serviceResponse = {};
            serviceResponse.code = code;
            // handle if code message is not declared
            if (rule) serviceResponse.message = rule;
            resolve(serviceResponse);
        }, (error) => {
            reject(error);
        });
    })
}

module.exports = {
    hrfaService,
}