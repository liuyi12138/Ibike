//
//  bike.js
//
//  Created by LY on 11/11/2018.
//

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

/*
 * @function 添加车辆
 * @param json对象 车辆信息
 * @return code(string) 1 添加成功, -1 账户不存在 -2 车辆已添加
 */
router.post('/bike/add', urlencodedParser, async function (req, res, next) {
    let bike = {
		ownerUid: req.body.ownerUid,
        bikeImg: req.body.bikeImg,
        bikeType: req.body.bikeType,
        bikeOld: req.body.bikeOld,
    }

    console.log(bike);


    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let bikeCollection = await informationDB.getCollection("BIKE");

    accountCollection.findOne({ uid: bike.ownerUid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else if(data.hasBikeOrNot == 1) {
            res.status(200).json({ "code": "-2" ,"msg" : "车辆已添加"})
        }
        else {
            bikeCollection.insertOne({
                ownerUid: bike.ownerUid,
                bikeImg: bike.bikeImg,
                bikeType: bike.bikeType,
                bikeOld: bike.bikeOld,
            }, function () {
                accountCollection.update({uid: bike.ownerUid},{$set: {hasBikeOrNot: 1}});
                res.status(200).json({ "code": "1" ,"msg" : "添加成功"})
            })

        }
    })
});

/*
 * @function 根据ownerUid获取车辆信息
 * @param id(string) 车辆id
 * @return bike(json对象) 车辆信息
 */
router.get('/bike', urlencodedParser, async function (req, res, next) {
	let params = req.query;
	console.log(params);
	let collection = await informationDB.getCollection("BIKE");
	collection.findOne({ ownerUid: params.ownerUid }, function (err, data) {
		if (data) {
			res.status(200).json({
                bike: data
			});
		}
		else {
			res.status(200).json({ "code": "-1" ,"msg": "查无此车"})
		}

	});
});

/*
 * @function 修改车辆信息
 * @param json对象 车辆信息
 * @return code(string) 1 修改成功, -1 账户不存在 -2 车辆不存在
 */
router.post('/bike/change', urlencodedParser, async function (req, res, next) {
    let bike = {
		ownerUid: req.body.ownerUid,
        bikeImg: req.body.bikeImg,
        bikeType: req.body.bikeType,
        bikeOld: req.body.bikeOld,
    }

    console.log(bike);


    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let bikeCollection = await informationDB.getCollection("BIKE");

    accountCollection.findOne({ uid: bike.ownerUid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }

        else {
            bikeCollection.findOne({ ownerUid: bike.ownerUid }, function (err, bikeData) {
                if (!bikeData) {
                    res.status(200).json({ "code": "-2" ,"msg" : "车辆不存在"})
                }
                else {
                    bikeCollection.save({
                        _id: ObjectID(bikeData._id),
                        ownerUid: bike.ownerUid,
                        bikeImg: bike.bikeImg,
                        bikeType: bike.bikeType,
                        bikeOld: bike.bikeOld,
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "修改成功"})
                    })
                }

            })
        }
    })
});


/*
 * @function 删除车辆
 * @param id(string) 车辆id
 * @return code(string) 1 删除成功, -1 车辆不存在
 */
router.post('/bike/remove', urlencodedParser, async function (req, res, next) {
    let Id  =  req.body.ownerUid;

    console.log(req.body);

    let collection = await informationDB.getCollection("BIKE");
    let accountCollection = await informationDB.getCollection("ACCOUNT");
    
    collection.findOne({ ownerUid: Id}, function (err, data) {
        if (!data) {
            res.status(200).json({"code":"-1", "msg": "车辆不存在" })
        } else {
            collection.remove({ownerUid: Id},function () {
                accountCollection.update({uid: bike.ownerUid},{$set: {hasBikeOrNot: 0}});
                res.status(200).json({ "code":"1" , "msg": "删除成功" });
                });
        }
    });

});

module.exports = router;