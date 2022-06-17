const berbix = require('berbix');
const randomWords = require('random-words');
const { v4: uuidv4 } = require('uuid');
const { constants } = require('../../config');

const { BERBIX_API_SECRET, BERBIX_TEMPLATE_KEY } = constants;

const client = new berbix.Client({
    apiSecret: BERBIX_API_SECRET,
    // apiHost: process.env.BERBIX_DEMO_API_HOST,
})

const createTransaction = async (phone, email) => {
    try {
        const customerUid = randomWords(2).join('-');
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
        throw new Error(createTransactionError.message);
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

module.exports = {
    createTransaction,
    regenerateTokens,
    getTransactionData,
}