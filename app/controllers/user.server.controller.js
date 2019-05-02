const User = require('../models/user.server.model');
const jwt = require('jwt-simple');
const crypto = require('crypto');
const http = require("http"),URL = require('url').URL;


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

exports.create = function (req,res) {
    let passwordtotal = saltHashPassword(req.body.password);
    let password = passwordtotal['passwordHash'];
    let salt = passwordtotal['salt'];
    let user_data = {
        "user_username" :req.body.username,
        "user_familyname":req.body.familyName,
        "user_givenname":req.body.givenName,
        "user_email":req.body.email,
        "user_salt":salt,
        "user_password":password

    };

    let values = [
        [req.body.username,req.body.familyName,req.body.givenName,req.body.email,salt,password]
    ];

    User.insert(values, function (result) {
        res.status(201).send("OK");

    });
};

exports.login = function(req,res) {
    let parameters = new URL(req.url,'http://localhost').searchParams;
    let username = parameters.get('username');
    let password = parameters.get('password');
    let email = parameters.get('email');


    User.loginin(username,password,email,function (err,result) {
        if(!err) {
            console.log(result["user_token"]);
            res.status(200).json(result["user_token"]);
        }
        else {
            if(err.message == 400) {
                res.status(400).send("Invalid username/email/password supplied");
            }

        }


    });

};

exports.logout = function (req,res) {
    let token = req.get('X-Authorization');
    console.log(token);
    User.logoutout(token,function (err,result) {
        if(err) {
            res.status(401).send("Unauthorized");
        }
        else {
            res.status(200).send("ok");
        }


    });

};

exports.read = function(req,res) {
    let user_id = req.params.id;

    User.getOne(user_id,function (err,result) {
        if(err) {
            res.status(404).send("Not Found");
        } else{
            console.log(result);
            res.status(200).send("OK");
        }
    });
};

exports.alter = function (req,res) {
    let user_id = req.params.id;

    let data = {
        "username":req.body.user_username,
        "user_givenname":req.body.user_givenname,
        "user_familyname":req.body.user_familyname,
        "user_email":req.body.user_email

    };

    User.edit(user_id,data,function (err,result) {
        if(err == null) {
            res.status(200).send("OK");
        } else {
            res.status(401).send("Unauthorized");
        }

    });


};