const berbix = require('berbix');
const axios = require('axios');
const randomWords = require('random-words');
const { constants } = require('../../config');

const { BERBIX_API_SECRET, BERBIX_TEMPLATE_KEY, ID_COUNTRY, ID_TYPE } = constants;

const client = new berbix.Client({
    apiSecret: BERBIX_API_SECRET,
    // apiHost: process.env.BERBIX_DEMO_API_HOST,
})

const createTransaction = async (phone, email) => {
    try {
        const customerUid = randomWords(3).join('-');
        const transaction = await client.createHostedTransaction({
            customerUid, // ID for the user in internal database
            templateKey: BERBIX_TEMPLATE_KEY, // Template key for this transaction
            hostedOptions: {
                completionEmail: 'engineering@paays.com'
            },
            phone,
            email,
        });
        return {
            customer_uid: customerUid,
            ...transaction.tokens.response,
        };
    } catch (createTransactionError) {
        throw new Error(createTransactionError);
    }
}

const createApiOnlyTransaction = async (phone, email) => {
    try {
        const customerUid = randomWords(3).join('-');
        const transaction = await client.createApiOnlyTransaction({
            customerUid, // ID for the user in internal database
            templateKey: BERBIX_TEMPLATE_KEY, // Template key for this transaction
            phone,
            email,
            apiOnlyOptions: {
                idCountry: ID_COUNTRY,
                idType: ID_TYPE
            },
        });
        return {
            customer_uid: customerUid,
            ...transaction.response,
        };
    } catch (createTransactionError) {
        throw new Error(createTransactionError.message || createTransactionError);
    }
}

const regenerateTokens = (refreshToken) => {
    try {
        // can also pick refresh_token from database
        // Load refresh token from database into a Token object
        const transactionTokens = berbix.Tokens.fromRefresh(refreshToken);
        const { access_token, client_token } = transactionTokens;
        return {
            access_token,
            client_token,
        }
    } catch (regenerateTokensError) {
        throw new Error(regenerateTokensError.message);
    }
}

const getTransactionData = async(refreshToken) => {
    try {
        const transactionTokens = berbix.Tokens.fromRefresh(refreshToken);
        const transactionData = await client.fetchTransaction(transactionTokens)
        return transactionData;
    } catch (getTransactionDataError) {
        throw new Error(getTransactionDataError.message);

    }
}

// const ImageUpload = async (clientToken, data, imageSubject, format) => {
//     try {
//         const response = await client.uploadImages( { clientToken }, {
//             images: [
//               new berbix.EncodedImage(data, imageSubject, format)
//             ]
//         })
//         console.log("response :", response);
//         return response;
//     } catch (ImageUploadError) {
//         console.log("ImageUploadError :", ImageUploadError)
//         throw new Error(ImageUploadError.message || ImageUploadError);
//     }
// }

const ImageUpload = async (authtoken, requestPayload) => {

    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`
            },
        };
        axios.post(
            'https://api.berbix.com/v0/images/upload',
            JSON.stringify({ images: requestPayload }),
            options,
        ).then((response) => {
            console.log("image upload response :", response?.data);
            resolve(response?.data);
        }, (error) => {
            console.log("image upload error :", error);
            reject(error?.response?.data);
        });
    })
}

module.exports = {
    createTransaction,
    regenerateTokens,
    getTransactionData,
    ImageUpload,
    createApiOnlyTransaction,
}