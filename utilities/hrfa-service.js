const axios = require('axios');
const HRFA_CODES = require('./hrfa-codes.json');
const { constants } = require('../config');

const { HRFA_REPORT_API } = constants;

const hrfaService = async (data) => {
    const { structured_postal_address, date_of_birth, given_names, family_name, phoneNumber } = data;
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
    if (date_of_birth && date_of_birth.length) requestPayload["DateOfBirth"] = date_of_birth.split('-').join('');
    if (given_names && given_names.length) requestPayload["FirstName"] = given_names;
    if (family_name && family_name.length) requestPayload["LastName"] = family_name;
    if (phoneNumber && phoneNumber.length) requestPayload["PhoneNumber"] = phoneNumber;

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
            const xmlResponse = response.data.REL4Report;
            // check is response contains any type of error
            if (xmlResponse && xmlResponse.Errors) {
                return reject(xmlResponse);
            }
            const codes = xmlResponse['TU_FFR_Report']['IFSXMLAML'];
            const codeResult = Object.values(codes);
            const valid = codeResult.some(val => val === 'Y' )
            let serviceResponse = { "idv_response": "Failed" };
            if (valid) serviceResponse = { "idv_response": "Verified" };
            resolve(serviceResponse);
        }, (error) => {
            reject(error);
        });
    })
}

module.exports = {
    hrfaService,
}