let express = require('express');
let informationDB = require('../models/information_db');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
var ObjectID = require('mongodb').ObjectID;


// 跨域header设定
router.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});
const request = require("request");
class Ut {

    /**
     * promise化request
     * @param {object} opts 
     * @return {Promise<[]>}
     */
    static promiseReq(opts = {}) {
	return new Promise((resolve, reject) => {
	    request(opts, (e, r, d) => {
		if (e) {
		    return reject(e);
		}
	        if (r.statusCode != 200) {
		    return reject(`back statusCode：${r.statusCode}`);
		}
		return resolve(d);
	    });
	})
    };

};  

module.exports = Ut;