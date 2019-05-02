const auctions = require('../controllers/auction.server.controller');

module.exports = function (app) {
    app.route('/api/v1/auctions')
        .post(auctions.create)
        .get(auctions.getaut);

    app.route('/api/v1/auctions/:id')
        .get(auctions.read)
        .patch(auctions.alterauc);


    app.route('/api/v1/auctions/:id/bids')
        .post(auctions.makebid)
        .get(auctions.getbid);

    app.route('/api/v1/auctions/:id/photos')
        .get(auctions.getphoto)
        .post(auctions.postphoto)
        .delete(auctions.deletephoto);


};