const Data = require('../models/database.server.model');

exports.reset = function (err,res) {
    Data.deletedata(function (err,result) {
        if(err == null) {
            res.status(200).send("OK");
        } else {
            if(err.message == 400) {
                res.status(400).send("Bad request.");
            } else {
                res.status(500).send("Internal server error");
            }
        }

    })
    
};

exports.resample = function (err,res) {
    Data.inputdata(function (err,result) {
        if(err == null) {
            res.status(200).send("OK");
        } else {
            if(err.message == 400) {
                res.status(400).send("Bad request.");
            } else if(err.message == 201) {
                res.status(201).send("Sample of data has been reloaded.");
            } else {
                res.status(500).send("Internal server error");
            }
        }

    });

};