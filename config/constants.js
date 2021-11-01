const {
    PORT,
    ENV,
    SECRET,
    MONGO_URI,
    BERBIX_API_SECRET,
    BERBIX_TEMPLATE_KEY,
    BERBIX_CUSTOMER_UID,
} = process.env;

const constants = {
    PORT,
    ENV,
    SECRET,
    MONGO_URI,
    BERBIX_API_SECRET,
    BERBIX_TEMPLATE_KEY,
    BERBIX_CUSTOMER_UID,
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
};

module.exports = {
    constants,
};
