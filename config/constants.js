const {
    PORT,
    ENV,
    SECRET,
    MONGO_URI,
} = process.env;

const constants = {
    PORT,
    ENV,
    SECRET,
    MONGO_URI,
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
    REGEX_PATTERN : {
        PASSWORD: new RegExp(/^(?=.*?[A-Z])[A-Za-z\d@$!%*?&]{8,}$/),
        DATE: new RegExp(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
    },
};

module.exports = {
    constants,
};
