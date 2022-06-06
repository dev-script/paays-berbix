const {
    PORT,
    ENV,
    SECRET,
    MONGO_URI,
    BERBIX_API_SECRET,
    BERBIX_TEMPLATE_KEY,
    BERBIX_CUSTOMER_UID,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME,
    MAXMIND_REPORT_API,
    HRFA_REPORT_API,
} = process.env;

const constants = {
    PORT,
    ENV,
    SECRET,
    MONGO_URI,
    BERBIX_API_SECRET,
    BERBIX_TEMPLATE_KEY,
    BERBIX_CUSTOMER_UID,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME,
    MAXMIND_REPORT_API,
    HRFA_REPORT_API,
    SUCCESS: {
        CODE: 200,
    },
    ERROR: {
        BAD_REQUEST: {
            TYPE: 'BAD_REQUEST',
            CODE: 400,
        },
        NOT_FOUND: {
            TYPE: 'NOT_FOUND',
            CODE: 404,
        },
        INTERNAL_SERVER_ERROR: {
            TYPE: 'INTERNAL_SERVER_ERROR',
            CODE: 500,
        },
        UNAUTHORIZED: {
            TYPE: 'UNAUTHORIZED',
            CODE: 403,
        },
        UNAUTHENTICATED: {
            TYPE: 'UNAUTHENTICATED',
            CODE: 401,
        },
    },
    LOGGER_LEVELS : {
    	ERROR: "Error",
    	WARN: "Warning",
    	INFO: "Info",
    	DEBUG: "Debug",
    	MARK: "Mark",
    	FATAL: "Fatal",
    	TRACE: "Trace"
	},
    REGEX_EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    REGEX_IP_ADDRESS: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
};

module.exports = {
    constants,
};
