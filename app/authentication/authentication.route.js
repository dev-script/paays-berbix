const authenticationRequest = require('./authentication.request');

module.exports = function (app) {
    app.route('/api/v1/login').post(
        authenticationRequest.validate('login'),
        app.login
    );
    app.route('/api/v1/sign-up').post(
        authenticationRequest.validate('sign-up'),
        app.signUp
    );
};