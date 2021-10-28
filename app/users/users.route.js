const { authenticateUserWithToken } = require('../middlewares/authentication');
const usersRequest = require('./users.request');

module.exports = function (app) {
    app.route('/api/v1/user/:userId')
        .get(
            authenticateUserWithToken,
            usersRequest.validate('check-user'),
            app.getUser
        )
        .put(
            authenticateUserWithToken,
            usersRequest.validate('check-user'),
            app.updateUser
        )
        .delete(
            authenticateUserWithToken,
            usersRequest.validate('check-user'),
            app.deleteUser
        )
    app.route('/api/v1/users')
        .get(
            authenticateUserWithToken,
            app.getUsers
        );
};