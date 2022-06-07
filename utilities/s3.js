const AWS = require('aws-sdk');
const path = require('path');
const { constants } = require('../config');

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = constants;

const configAWSConnection = () => {
    AWS.config.update(
        {
            accessKeyId: S3_ACCESS_KEY_ID,
			secretAccessKey: S3_SECRET_ACCESS_KEY,
        }
    );
    const s3 = new AWS.S3();
    return s3;
}

// read file from s3
const readContent = async (transactionId, filename) => {
    // configure aws s3 connection
    const S3 = await configAWSConnection();
    return new Promise(async (resolve, reject) => {
        const options = {
            Bucket: S3_BUCKET_NAME, // required
            Key: path.join(`user-${transactionId}`, filename), // Can be your folder name
        };
        S3.getObject(options, function (err, data) {
            if (err) reject(err);
            else resolve(data.Body);
        });
    });
};

/**
 * Upload image to aws s3 and return image url and other meta deta.
 * @param {buffer} buffer image buffer
 * @param {Object} data Input data required to upload image.
 */
const uploadContent = async (buffer, transactionId, imageName) => {
    try {
		console.log("uploading user images to s3...")
        const S3 = await configAWSConnection();
		const params = {
			Bucket: S3_BUCKET_NAME,
			Key:  `user-${transactionId}/${imageName}`,
			Body: buffer,
			ContentType: "image/png",
			ACL: 'public-read',
			ContentEncoding: 'base64'
		};
		const uploaded = await S3.upload(params).promise();
		if(!uploaded || !uploaded.Location) throw new Error('unable to upload image to s3::');
		console.log("image uploaded successfully in s3::");
		return uploaded;
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = {
	uploadContent,
    readContent,
};
