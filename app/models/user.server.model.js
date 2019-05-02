const db = require('../../config/db');
const jwt = require('jwt-simple');
const crypto = require('crypto');

let err400 = new Error('400');
let err401 = new Error('401');
let err404 = new Error('404');

let genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0,length);
};

let sha256 = function(password, salt){
    var hash = crypto.createHmac('sha256', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userpassword) {
    let salt = genRandomString(16); /** Gives us salt of length 16 */
    let passwordData = sha256(userpassword, salt);
    return passwordData;
}

function encrypt(user,err,done) {
    let user_id = user.user_id;
    let token = jwt.encode({
        iss: user_id
    }, '87654321', null);
    logincheck(null, user_id, token,done);
}

function logincheck(err, user_id, token,done) {
    if(err) return done(err, null);
    else {
        db.get_pool().query('UPDATE auction_user SET user_token = ? where user_id = ?', [token, user_id], function (err, result) {
            if(err) console.log(err);
            else {
                let values = {
                    "user_id": user_id,
                    "user_token": token
                };
                return done(null, values);
            }
        });
    }
}


exports.insert = function (values,done) {
    db.get_pool().query('INSERT INTO auction_user (user_username,user_familyname,user_givenname,user_email,user_salt,user_password) VALUES (?)',values,function (err,result) {
        if(err) {
            return done(err400);
        } else {
            return done(result);
        }

    });

};

exports.loginin = function (username,password,email,done) {
    db.get_pool().query('SELECT * FROM auction_user WHERE user_username = ?', username, function (err, result) {
        let passwordmix = sha256(password,result[0].user_salt)['passwordHash'];
        if(err) {
            db.get_pool().query('SELECT * FROM auction_user WHERE user_email = ?', email, function (err, result){
                if(err) {
                    console.log(err);
                }
                else {
                    if(result[0] == undefined) {
                        done(err400);

                    }
                    else if(result[0].user_password != passwordmix) {
                        done(err400);
                    }

                    else{
                        encrypt(result[0],null,done);

                    }

                }
            });

        } else {
            if(result[0] == undefined) {
                done(err400);

            }
            else if(result[0].user_password != passwordmix) {
                done(err400);
            }

            else{
                encrypt(result[0],null,done);

            }
        }

    });


};


exports.logoutout = function (token,done) {
    let id = jwt.decode(token,'87654321');

    db.get_pool().query("UPDATE auction_user SET user_token = null where user_id = ?",id['iss'],function (err,result) {
        if(err) {
            return done(err401,null);
        } else {
            return done(null,result);
        }

    })

};


exports.getOne = function (user_id,done) {
    db.get_pool().query("SELECT * FROM auction_user WHERE user_id = ? ",user_id,function (err,result) {

        if(err) {
            return done(err,null);
        } else if(result[0] == undefined){
            return done(err404,null);
        }
        else {
            let username = result[0].user_username;
            let givenname = result[0].user_givenname;
            let familyname = result[0].user_familyname;
            let email = result[0].user_email;
            let account = result[0].user_accountbalance;
            let values = {
                "username": username,
                "givenname": givenname,
                "familyname": familyname,
                "email": email,
                "accountbalance":account
            };
            return done(null, values);
        }

    });

};



exports.edit = function (user_id,data,done) {
    let username = data["username"];
    let givenname = data["user_givenname"];
    let familyname = data["user_familyname"];
    let email = data["user_email"];


    db.get_pool().query("SELECT * FROM auction_user WHERE user_id = ?",user_id,function (err,result) {
        if(err) {
            return done(err,null);

        } else if(result[0] == undefined){
            return done(err404, null);

        } else if (result[0].user_token == undefined){
            return done(err401,null);
        }
        else {
            if(username != null) {
                db.get_pool().query("UPDATE auction_user SET user_username = ? where user_id = ?;",[username,result[0]['user_id']],function (err,result) {
                    if(err) {

                        return done(err,null);
                    } else {
                        console.log(result);
                    }

                });

            }
            if(givenname != null) {
                db.get_pool().query("UPDATE auction_user SET user_givenname = ?;",[givenname,result[0]['user_id']],function (err,result) {
                    if(err) {
                        return done(err,null);
                    } else {
                        console.log(result);
                    }
                });

            }
            if(familyname != null) {
                db.get_pool().query("UPDATE auction_user SET user_familyname = ?;",[familyname,result[0]['user_id']],function (err,result) {
                    if(err) {
                        return done(err,null);
                    } else {
                        console.log(result);
                    }

                });

            }

            if( email != null) {
                db.get_pool().query("UPDATE auction_user SET user_email = ?;",[email,result[0]['user_id']],function (err,result) {
                    if(err) {
                        console.log(err);
                        return done(err,null);
                    } else {
                        console.log(result);
                    }
                });

            }



        }

    });
    return done(null,null);

};