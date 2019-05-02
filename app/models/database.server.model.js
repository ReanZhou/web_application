const db = require('../../config/db');
let err400 = new Error('400');
let err401 = new Error('401');
let err404 = new Error('404');
let err201 = new Error('201');

const fs = require('fs');
const crypto = require('crypto');


exports.deletedata = function (done) {
    var sql = fs.readFileSync('../config/createtable.sql').toString();
    console.log(sql);
    db.get_pool().query(sql,function (err,result) {
        if(err) {
            console.log(err);
            return done(err400,null);
        } else {
            return done(null,result);
        }

    })

};

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
    console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('nSalt = '+passwordData.salt);
    return passwordData;
}

exports.inputdata = function (done) {
    var datasql = fs.readFileSync('../config/inputdata.sql').toString();
    var i = 0;
    db.get_pool().query(datasql,function (err,result) {
        if(err) {
            return done(err201,null);
        } else {
            db.get_pool().query("SELECT count(*) FROM auction_user", function (err,result) {
                let len = result[0]["count(*)"];
                for(var i = 1; i < len + 1; i++) {
                    encrpt(i,len,done);
                }

            })
        }


    })

};


function encrpt(ind,len,done) {
    let pass = "";
    const sql2 = "UPDATE auction_user SET user_password = ?,user_salt = ? WHERE user_id = ?";
    db.get_pool().query("SELECT user_password FROM auction_user WHERE user_id = ?",ind ,function(err,results) {
        if(err) {
            return done(err400,null);
        } else {
            pass = results[0].user_password;
            let saltedPassword = saltHashPassword(pass);
            db.get_pool().query(sql2,[saltedPassword.passwordHash,saltedPassword.salt,ind],function(err,results){
                if(err) {
                    return done(err400,null);
                } else if(ind == len){
                    return done(null, results);
                }
            })

        }

    })

}



