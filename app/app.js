const db = require('../config/db');
const express = require('../config/express');

const app = express();

db.connect(function (err) {
    if(err){
        console.log('Unable to connect to Mysql');
        process.exit(1);

    } else {
        app.listen(3000,function () {
            console.log('Listening on port ' + 3000);

        });
    }

});