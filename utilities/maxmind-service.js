const axios = require('axios');
const { constants } = require('../config');

const { MAXMIND_REPORT_API } = constants;

const maxMindService = async (requestPayload) => {

    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        axios.post(
            MAXMIND_REPORT_API,
            requestPayload,
            options,
        ).then((response) => {
            resolve(response?.data?.data);
        }, (error) => {
            reject(error);
        });
    })
}

module.exports = {
    maxMindService,
}