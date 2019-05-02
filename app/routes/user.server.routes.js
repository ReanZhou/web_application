const users = require('../controllers/user.server.controller');
const jwt = require('jwt-simple');

const isValidToken = function (token, done) {

    if (token !== null){
        let decode = jwt.decode(token, '87654321');
        let login = decode.iss;
        db.get().query('SELECT token FROM Token WHERE user_id = ?', login, function (err, result) {
            if (err) return done(null, false);

            else if (result[0]['token'] === token){
                return done(null, true);
            }
            else {
                return done(null, false);
            }

        });
    }
    else {
        return done(null, false);
    }
};

const myMiddleware = (req, res, next) => {
    isValidToken(req.get('X-Authorization'), function (err, result) {
        if (result) {
            next();
        }
        else {
            res.status(401);
        }

    });
};


module.exports = function (app) {
    app.route('/api/v1/users')
        .post(users.create);

    app.route('/api/v1/users/login')
        .post(users.login);

    app.route('/api/v1/users/logout')
        .post(users.logout);

    app.route('/api/v1/users/:id')
        .get(users.read)
        .patch(users.alter);

};