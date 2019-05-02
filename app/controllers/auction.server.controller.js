const User = require('../models/auction.server.model');
var currentdate = new Date().toLocaleString();
const fs = require('fs');
const jwt = require('jwt-simple');
const http = require("http"),URL = require('url').URL;
exports.create = function (req,res) {
    let token = req.get('X-Authorization');
    let id = jwt.decode(token,'87654321');
    let userid = id["iss"];
    let values = [
        [
        req.body.title,
        req.body.categoryId,
        req.body.description,
        req.body.startDateTime,
        req.body.endDateTime,
        req.body.reservePrice,
        req.body.startingBid,
            userid,
            currentdate
            ]
    ];

    User.insert(values,function (err,result) {
        if(err == null) {
            res.status(201).send("OK");
        } else {
            if(err.message == 400) {
                res.status(400).send("Bad request.");
            } else if (err.message == 401){
                res.status(401).send("Unauthorized");
            } else {
                res.status(500).send("Internal server error");
            }

        }

    });

};


exports.read = function(req,res) {
    let auctions_id = req.params.id;


    User.getOne(auctions_id,function (err,result) {
        if(err == null) {
            console.log(result);
            res.status(200).send("OK");
        } else{
            if(err.message == 404) {
                res.status(404).send("Not Found");
            } else if(err.message == 400) {
                res.status(400).send("Bad request.");
            } else if(err.message == 401) {
                res.status(401).send("Unauthorized");
            } else if(err.message == 500) {
                res.status(500).send("Internal server error");
            }

        }
    });
};


exports.makebid = function (req,res) {
    let parameters = new URL(req.url,'http://localhost').searchParams;
    let auction_id = req.params.id;
    let amount = parameters.get("amount");
    let token = req.get('X-Authorization');

    
    User.postbid(auction_id,amount,token,function (err,result) {
        if(err == null) {
            res.status(201).send("OK");
        }
        else {
            if(err.message == 404) {
                res.status(404).send("Not Found");
            } else if (err.message == 400) {
                res.status(400).send("Bad Request");
            } else if(err.message == 500) {
                res.status(500).send("Internal server error.");
            }
        }
        
    })
    
    
};

exports.getbid = function (req,res) {
    let auction_id = req.params.id;

    User.getAllbid(auction_id,function (err,result) {
        if(err) {
            console.log(err);
            res.status(404).send("Not Found");
        } else {
            console.log(result);
            res.status(201).send("OK");
        }

    })

}


exports.getphoto = function (req,res) {
    let auction_id = req.params.id;
    User.getOnephoto(auction_id,function (err,result) {
        if(!err) {
            fileToLoad = fs.readFileSync(result);
            res.end(fileToLoad, 'binary');
        } else {
            if(err.message == 400) {
                res.status(400).send("Bad request");
            } else if(err.message == 404) {
                res.status(404).send("Not Found");
            }
        }
    });


};


exports.postphoto = function (req,res) {
    let id = req.params.id;
    User.createphoto(id,function (err,path) {
        if(!err) {
            req.pipe(fs.createWriteStream(path));
            res.status(200).send("OK");
        } else {
            if(err.message == 400) {
                res.status(400).send("Bad Request");
            } else if(err.message == 404) {
                res.status(404).send("Not Found");
            }
        }

    });


};



exports.deletephoto = function (req,res) {
    let auction_id = req.params.id;

    User.deletep(auction_id,function (err,result) {
        if(err == null) {
            res.status(201).send("OK");

        } else {
            if (err.message == 500) {
                res.status(500).send("Internal server error");


            } else if(err.message == 404){
                res.status(201).send("Not Found");
            }
        }

    });
    
};


exports.alterauc = function (req,res) {
    let auction_id = req.params.id;
    let data = {
        "categoryId":req.body.categoryId,
        "title":req.body.title,
        "description":req.body.description,
        "startDateTime":req.body.startdate,
        "endDateTime":req.body.enddate,
        "reservePrice":req.body.reserveprice,
        "startingBid":req.body.startbid

    };

    User.alterauction(auction_id,data,function (err,result) {
        if(err == null) {
            res.status(201).send("OK");
        } else {
            if (err.message == 401) {
                res.status(401).send("Unauthorized.");
            } else if (err.message == 403) {
                res.status(403).send("Forbidden - bidding has begun on the auction.");
            } else if (err.message == 404) {
                res.status(404).send("Not Found");
            } else if (err.message == 400) {

                res.status(400).send("Bad request.");
            } else if(err.message == 500) {
                res.status(500).send("Internal server error");
            }
        }

    })

};

exports.getaut = function (req,res) {
    let type = '';
    let parameters = new URL(req.url,'http://localhost').searchParams;
    let kipindex = parameters.get('startindex');
    let count = parameters.get("count");
    let q = parameters.get("q");
    let cid = parameters.get("categoryid");
    let seller = parameters.get("seller");
    let bidder = parameters.get("buyer");
    let winner = parameters.get("winner");
    for(var key of parameters.keys()) {
        type = key;
        console.log(type);
    }

    User.getfinal(type,kipindex,count,q,cid,seller,bidder,winner,function (err,result) {
        if(err == null) {
            res.status(200).json(result);
        } else {
            if(err.message == 400) {
                res.status(400).send("Bad request.");
            } else if(err.message == 500) {
                res.status(500).send("Internal server error");
            }

        }

    })

};


