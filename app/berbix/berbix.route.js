module.exports = function (app) {
    app.route('/berbix/token').post(app.saveTransaction);
    app.route('/get-user-data/:phoneNumber').get(app.getUserData);
    app.route('/user/:id').get(app.getUser);
    app.route('/users').get(app.getUser);
    app.route('/get-image').get(app.s3ImageData);
    app.route('/privacy-policy').get(async (req, res) => res.render('pages/privacy-policy'));
    app.route('/success').get(async (req, res) => res.render('pages/success'));
    app.route('/web-hook/verification-finished').post(app.berbixVerificationFinished);
    app.route('/web-hook/verification-status').post(app.berbixVerificationStatus);
};