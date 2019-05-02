const db = require('../../config/db');
const jwt = require('jwt-simple');
let err400 = new Error('400');
let err401 = new Error('401');
let err403 = new Error('403');
let err404 = new Error('404');
let err500 = new Error('500');
const fs = require('fs');
var currentdate = new Date().toLocaleString();


exports.insert = function (values,done) {
    if(Number.isInteger(parseInt(values[0][1])) == false || Number.isInteger(parseInt(values[0][7])) == false) {
        return done(err400,null);
    }
    db.get_pool().query("SELECT user_token FROM auction_user WHERE user_id = ?",values[0][7],function (err,token) {
        if(token[0]["user_token"] == null) {
            return done(err401, null);
        }else if(err){
            return done(err500,null);

        } else {
            db.get_pool().query('INSERT INTO auction (auction_title,auction_categoryid,auction_description,auction_startingdate,auction_endingdate,auction_reserveprice,auction_startingprice,auction_userid,auction_creationdate) VALUES (?)',values,function (err,result) {
                if(err) {
                    return done(err500,null);
                } else {
                    return done(null,result);
                }

            });

        }

    })


};

function get_seller(user_id,result,done) {
    db.get_pool().query("SELECT * FROM auction_user WHERE user_id = ?",user_id,function (err,sales) {
        if(err) return done(err500,null);
        let salesvalue = {
            "id":sales[0]["user_id"],
            "username":sales[0]["user_username"]
        };
        getcate(salesvalue,result,result[0].auction_categoryid,done);

    });

}


function getcate(sales,result,cid,done) {
    db.get_pool().query("SELECT * FROM category WHERE category_id = ?",cid,function (err,cate) {
        if(err) return done(err500,null);
        else {
            let catevalue = {
                "id": cate[0]["category_id"],
                "title": cate[0]["category_title"]
            };

            getbid(catevalue,sales,result,done)


        }

    });
    
}



function getbid(cate,sales,result,done) {
    db.get_pool().query("SELECT * FROM bid WHERE bid_auctionid = ?",result[0].auction_id,function (err,bid) {
        if(err) return done(err500,null);
        else {
            let bids = {
                "amount":bid[0].bid_amount,
                "datetime":bid[0].bid_datetime,
                "buyid":bid[0].bid_userid,
                "bid":bid[0].bid_id
            };
            console.log(bids["buyid"]);

            getbuyer(cate,sales,result,bids,done);

        }
    });


}

function getbuyer(cate,sales,result,bids,done) {
    db.get_pool().query("SELECT * FROM auction_user WHERE user_id = ?;",bids["buyid"],function (err,buy){
        if(err) return done(err500,null);
        else {
            let title = result[0].auction_title;
            let description = result[0].auction_description;
            let reserveprice = result[0].auction_reserveprice;
            let createdate = result[0].auction_creationdate;
            let startdate = result[0].auction_startingdate;
            let enddate = result[0].auction_endingdate;
            let currentbid = bids["bid"];
            bids.buy_username = buy[0].user_username;


            let values = {
                "categoryId":cate["id"],
                "categoryTitle":cate["title"],
                "currentBid":currentbid,
                "title":title,
                "reservePrice":reserveprice,
                "startDateTime": startdate,
                "endDateTime": enddate,
                "description":description,
                "creationDateTime":createdate,
                "seller":sales,
                "bid":bids


            };

            return done(null, values);

        }

    });
}

exports.getOne = function (auction_id,done) {
    if(Number.isInteger(parseInt(auction_id)) == false){
        return done(err400,null);
    }
    db.get_pool().query("SELECT * FROM auction WHERE auction_id = ? ",auction_id,function (err,result) {
        if(err) {
            return done(err500,null);
        } else if(result[0] == undefined){
            return done(err404,null);
        }
        else {
            db.get_pool().query("SELECT user_token FROM auction_user WHERE user_id = ?",result[0]["auction_userid"],function (err,token) {
                if(token[0]["user_token"] == null) {
                    return done(err401,null);
                } else {
                    get_seller(auction_id,result,done);
                }

            })


        }

    });

};


exports.postbid = function (auction_id,amount,token,done) {
    let id = jwt.decode(token,'87654321');
    if(Number.isInteger(parseInt(amount)) == false) {
        return done(err400,null);
    }
    console.log(auction_id);
    db.get_pool().query("SELECT * FROM auction WHERE auction_id = ?",auction_id,function (err,auction) {
        if(auction[0] == undefined) {
            return done(err404,null);
        } else if(err) {
            return done(err500,null);
        }
        else {
            db.get_pool().query("INSERT INTO bid(bid_amount,bid_datetime,bid_auctionid,bid_userid) VALUES (?,?,?,?)",[amount,(currentdate),auction_id,id["iss"]],function (err,result) {
                if(err){
                    return done(err500,null);
                } else {

                    return done(null,result);
                }
            });
        }
    })
};

exports.getAllbid = function (auction_id,done) {
    if(Number.isInteger(parseInt(auction_id)) == false) {
        return done(err400,null);
    }
    db.get_pool().query("Select * from bid where bid_auctionid = ?",auction_id,function (err,result) {
        if(err) {
            return done(500,null);
        } else if(result[0] == undefined) {
            return done(err404,null);
        }else {

           return done(null,result);
        }

    });

};

exports.getOnephoto = function(auction_id,done){

    if(Number.isInteger(parseInt(auction_id)) == false) {
        return done(err400,null);
    }
    db.get_pool().query("SELECT * FROM auction WHERE auction_userid = ?",auction_id,function (err,result) {
        if(result[0]==undefined) {
            return done(err404,null);
        } else {
            let path = ".."+"/"+auction_id.toString()+".jpeg";
            return done(null,path);

        }

    });
};


function findseller(auction_id) {
    db.get_pool().query("SELECT user_token FROM auction_user WHERE user_id = ?",auction_id,function (err,result) {
        if(!err){
            return result;
        }

    });

};

exports.createphoto = function (id,done) {
    if(Number.isInteger(parseInt(id)) == false) {
        return done(err400,null);
    }
    db.get_pool().query("SELECT * FROM auction WHERE auction_userid = ?",id,function (err,result) {
        if(result[0] == undefined) {
            return done(err404,null);
        } else {
            let path = ".."+"/"+id.toString()+".jpeg";
            return done(null,path);
        }

    })

};



exports.deletep = function (aid,done) {
    if(Number.isInteger(parseInt(aid)) == false) {
        return done(err400,null);
    }
    let path = ".."+"/"+aid.toString()+".jpeg";
    fs.stat(path,function (err,stats) {
        if(err) {
            return done(err404,null);
        } else {
            fs.unlink(path,function (err,result) {
                if(err) {
                    return done(err500,null);
                } else {
                    return done(null,result);
                }

            })
        }

    })

};


exports.alterauction = function (id,data,done) {
    let cateid = data["categoryId"];
    let title = data["title"];
    let description = data["description"];
    let startDateTime = data["startDateTime"];
    let endDateTime = data["endDateTime"];
    let reservePrice = data["reservePrice"];
    let startingBid = data["startingBid"];

    db.get_pool().query("SELECT * FROM auction where auction_id = ?",id,function (err,userid) {
       if(err) {
           console.log(err);
           return done(err500, null);
       } else if(userid[0] == undefined) {
           return done(err404, null);
       } else if(Date.parse(userid[0]["auction_startingdate"].toString()) <= Date.parse(currentdate)) {
           return done(err403,null);
       } else {

           db.get_pool().query("SELECT user_token FROM auction_user where user_id = ?",userid[0]["auction_userid"],function (err,token) {
               if(err) {
                   console.log(err);
                   return done(err404, null);
               } else if (token[0]["user_token"] == null) {
                   return done(err401, null);
               } else {
                   if(cateid != null) {
                       db.get_pool().query("UPDATE auction SET auction_categoryid = ? where auction_id = ?",[cateid,id],function (err,result) {
                           if(err) {
                               return done(err,null);
                           } else {
                               console.log(result);
                           }

                       });
                   }
                   if(title != null) {
                       db.get_pool().query("UPDATE auction SET auction_title = ? where auction_id = ?",[title,id],function (err,result) {
                           if(err) {
                               return done(err,null);
                           } else {
                               console.log(result);
                           }
                       });
                   }

                   if(description != null) {
                       db.get_pool().query("UPDATE auction SET auction_description = ? where auction_id = ?",[description,id],function (err,result) {
                           if(err) {
                               return done(err,null);
                           } else {
                               console.log(result);
                           }

                       });
                   }
                   if(startDateTime != null) {
                       db.get_pool().query("UPDATE auction SET auction_startingdate = ? where auction_id = ?",[startDateTime,id],function (err,result) {
                           if(err) {
                               return done(err,null);
                           } else {
                               console.log(result);
                           }

                       });
                   }

                   if(endDateTime != null) {
                       db.get_pool().query("UPDATE auction SET auction_endingdate = ? where auction_id = ?",[endDateTime,id],function (err,result) {
                           if(err) {
                               return done(err,null);
                           } else {
                               console.log(result);
                           }

                       });
                   }
                   if(reservePrice != null) {
                       db.get_pool().query("UPDATE auction SET auction_reserveprice = ? where auction_id = ?",[reservePrice,id],function (err,result) {
                           if(err) {
                               return done(err,null);
                           } else {
                               console.log(result);
                           }

                       });
                   }
                   if(startingBid != null) {
                       db.get_pool().query("UPDATE auction SET auction_startingprice = ?",[startingBid,id],function (err,result) {
                           if(err) {
                               return done(err,null);
                           } else {
                               console.log(result);
                           }

                       });
                   }
               }

           })
           return done(null,null);
       }

    });


};

function clearWrongauction() {
    db.get_pool().query("UPDATE auction SET auction_deactivated = 1 WHERE auction_endingdate < ?",currentdate,function (err,result) {
        if(err) {
            console.log(err);
        }
        else {
            return result;
        }

    })

}


exports.getfinal = function (type,kipindex,count,q,cid,seller,bidder,winner,done) {
    clearWrongauction();
    if(type == 'startindex') {
        db.get_pool().query("SELECT * FROM auction Where auction_deactivated is NULL and auction_id > ?",kipindex,function(err,result){
            if(Number.isInteger(parseInt(kipindex)) == false) {
                return done(err400,null);
            }

            if(err) {
                return done(err500,null);
            } else {
                console.log(result);
                return done(null,result);
            }
        })
    }
    if(type == 'count'){
        db.get_pool().query("SELECT * FROM auction where auction_deactivated is NULL LIMIT ?",[parseInt(count)],function (err,result) {
            if(Number.isInteger(parseInt(count)) == false) {
                return done(err400,null);
            }
            if(err) {
                return done(err500,null);
            } else {
                console.log(result);
                return done(null,result);
            }

        })
    }

    if(type == "q" ){
        let search = "%";
        search += q;
        search += "%";
        db.get_pool().query("SELECT * FROM auction where auction_deactivated is NULL and auction_title like ?",search,function (err,result) {
            if(err) {
                return done(err500,null);
            } else {
                console.log(result);
                return done(null,result);
            }

        });
    }
    if(type == "categoryid") {
        if(Number.isInteger(parseInt(cid)) == false) {
            return done(err400,null);
        }
        db.get_pool().query("SELECT * FROM auction where auction_deactivated is NULL and auction_categoryid = ?",cid,function (err,result) {
            if(err) {
                return done(err500,null);
            } else {
                console.log(result);
                return done(null,result);
            }

        })
    }

    if(type == "seller") {
        if(Number.isInteger(parseInt(seller)) == false) {
            return done(err400,null);
        }
        db.get_pool().query("SELECT * FROM auction where auction_deactivated is NULL and auction_userid = ?",seller,function (err,result) {
            if(err) {
                return done(err500,null);
            } else {
                return done(null,result);
            }

        })
    }

    if(type == "buyer") {
        if(Number.isInteger(parseInt(bidder)) == false) {
            return done(err400,null);
        }
        db.get_pool().query("SELECT DISTINCT bid_auctionid FROM bid where bid_userid = ?",bidder,function (err,aid) {
            if(err){
                console.log(err);
                return done(err500,null);
            } else {
                for(var i = 0;i<aid.length;i++) {
                    db.get_pool().query("SELECT * FROM auction where auction_deactivated is NULL and auction_id = ?",aid[i]["bid_auctionid"],function (err,result) {
                        if(err) {
                            console.log(err);
                            return done(err500,null);
                        } else {
                            console.log(result);
                        }

                    })
                }
            }

        })
        return done(null,null);
    }

    if (type == "winner") {
        db.get_pool().query("SELECT DISTINCT bid_auctionid FROM bid WHERE bid_userid = ?",winner,function (err,aid) {
            if(err) {
                console.log(err);
                return done(err500, null);
            } else if(aid[0] == undefined){
                return done(err404,null);
            } else {
                for(var i = 0; i< aid.length; i++) {
                    db.get_pool().query("SELECT MAX(bid_amount) FROM bid WHERE bid_auctionid = ?",aid[i]["bid_auctionid"],function (err,amount) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log(amount);
                            for (var i = 0; i < amount.length; i++) {
                                db.get_pool().query("SELECT bid_auctionid FROM bid WHERE bid_amount = ? and bid_userid = ?",[amount[i]["MAX(bid_amount)"],winner],function (err,wid) {
                                    if(err) {
                                        console.log(err);
                                        return done(err,null);
                                    } else {
                                        console.log(wid);
                                        for (var i = 0;i<wid.length;i++){
                                            db.get_pool().query("SELECT * FROM auction WHERE auction_id = ?",wid[0]["bid_auctionid"],function (err,result) {
                                                if(err) {
                                                    console.log(err);
                                                    return done(err,null);
                                                } else {
                                                    console.log(result);
                                                }

                                            })
                                        }
                                    }

                                });
                            }
                        }

                    })
                }
            }
            return done(null,null);

        })

    }





};
