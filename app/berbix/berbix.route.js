module.exports = function (app) {
    app.route('/').get(app.saveTransaction);
    app.route('/get-user-data/:phoneNumber').get(app.getUserData);
    app.route('/user/:id').get(app.getUser);
    app.route('/users').get(app.getUser);
    app.route('/get-image').get(app.s3ImageData)
};