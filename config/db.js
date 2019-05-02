/**
 * Created by yli227 on 7/08/17.
 */
const mysql = require('mysql');
const state = {
    pool: null
};

exports.connect = function (done) {
    state.pool = mysql.createPool({
        host: 'mysql3.csse.canterbury.ac.nz',
        user: 'hzh99',
        password: '74115451',
        database: 'hzh99',
        multipleStatements: true
    });


    let user_table =
        "CREATE TABLE if not exists auction_user (" +
        "  user_id int(10) NOT NULL AUTO_INCREMENT," +
        "  user_username varchar(50) NOT NULL," +
        "  user_givenname varchar(50) NOT NULL," +
        "  user_familyname varchar(50) NOT NULL," +
        "  user_email varchar(320) NOT NULL," +
        "  user_password varchar(64) NOT NULL," +
        "  user_salt varchar(32) DEFAULT NULL," +
        "  user_token varchar(32) DEFAULT NULL," +
        "  user_accountbalance decimal(10,2) NOT NULL DEFAULT '0'," +
        "  user_reputation int(10) NOT NULL DEFAULT '0'," +
        "  PRIMARY KEY (user_id)," +
        "  UNIQUE KEY user_id (user_id)," +
        "  UNIQUE KEY user_token (user_token)," +
        "  UNIQUE KEY user_username (user_username)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";

    let cate_table =
        "CREATE TABLE if not exists category (" +
        "  category_id int(10) NOT NULL AUTO_INCREMENT," +
        "  category_title varchar(50) NOT NULL," +
        "  category_description varchar(256) DEFAULT NULL," +
        "  PRIMARY KEY (category_id)," +
        "  UNIQUE KEY category_id (category_id)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";

    let auction_table =
        "CREATE TABLE if not exists auction (" +
        "  auction_id int(10) NOT NULL AUTO_INCREMENT," +
        "  auction_title varchar(128) NOT NULL," +
        "  auction_categoryid int(10) NOT NULL," +
        "  auction_description varchar(512) DEFAULT NULL," +
        "  auction_reserveprice decimal(10,2) DEFAULT NULL," +
        "  auction_startingprice decimal(10,2) NOT NULL," +
        "  auction_creationdate datetime NOT NULL," +
        "  auction_startingdate datetime NOT NULL," +
        "  auction_endingdate datetime NOT NULL," +
        "  auction_userid int(10) NOT NULL," +
        "  auction_primaryphoto_URI varchar(128) DEFAULT NULL," +
        "  auction_deactivated tinyint(1) DEFAULT NULL," +
        "  PRIMARY KEY (auction_id)," +
        "  KEY fk_auction_category_id (auction_categoryid)," +
        "  KEY fk_auction_userid (auction_userid)," +
        "  CONSTRAINT fk_auction_userid FOREIGN KEY (auction_userid) REFERENCES auction_user (user_id)," +
        "  CONSTRAINT fk_auction_category_id FOREIGN KEY (auction_categoryid) REFERENCES category (category_id)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";

    let photo_table =
        "CREATE TABLE if not exists photo (" +
        "  photo_id int(10) NOT NULL AUTO_INCREMENT," +
        "  photo_auctionid int(10) NOT NULL," +
        "  photo_image_URI varchar(128) NOT NULL," +
        "  photo_displayorder int NULL," +
        "  PRIMARY KEY (photo_id)," +
        "  KEY fk_photo_auctionid (photo_auctionid)," +
        "  CONSTRAINT fk_photo_auctionid FOREIGN KEY (photo_auctionid) REFERENCES auction (auction_id)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";

    let bid_table =
        "CREATE TABLE if not exists bid (" +
        "  bid_id int(10) NOT NULL AUTO_INCREMENT," +
        "  bid_userid int(10) NOT NULL," +
        "  bid_auctionid int(10) NOT NULL," +
        "  bid_amount decimal(10,2) NOT NULL," +
        "  bid_datetime datetime NOT NULL," +
        "  PRIMARY KEY (bid_id)," +
        "  KEY fk_bid_userid (bid_userid)," +
        "  KEY fk_auctionid (bid_auctionid)," +
        "  CONSTRAINT fk_auctionid FOREIGN KEY (bid_auctionid) REFERENCES auction (auction_id)," +
        "  CONSTRAINT fk_bid_userid FOREIGN KEY (bid_userid) REFERENCES auction_user (user_id)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";

    state.pool.query(user_table, function (err, result) {
        if (err){
            console.log(err);
        }
    });
    state.pool.query(cate_table, function (err, result) {
        if (err){
            console.log(err);
        }
    });

    state.pool.query(auction_table, function (err, result) {
        if (err){
            console.log(err);
        }
    });

    state.pool.query(photo_table, function (err, result) {
        if (err){
            console.log(err);
        }
    });

    state.pool.query(bid_table, function (err, result) {
        if (err){
            console.log(err);
        }
    });


    done();
};

exports.get_pool = function () {
    return state.pool;
};

