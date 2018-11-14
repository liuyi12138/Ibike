//
//  rent.js
//
//  Created by LY on 11/12/2018.
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
 * @function 添加出租车辆
 * @param json对象 出租信息
 * @return code(string) 1 添加成功, -1 账户不存在 -2 车辆不存在
 */
router.post('/rent/add', urlencodedParser, async function (req, res, next) {
    let rent = {
        ownerUid: req.body.ownerUid,
        electric: req.body.electric,
        rentType: req.body.rentType,
        time: req.body.time,
        price: parseInt(req.body.price),
        from: req.body.from,
        to: req.body.to,
        content: req.body.content,
    }

    console.log(rent);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let bikeCollection = await informationDB.getCollection("BIKE");
    let rentCollection = await informationDB.getCollection("RENTLIST");

    accountCollection.findOne({ uid: rent.ownerUid }, function (err, accountData) {
        if (!accountData) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {
            bikeCollection.findOne({ ownerUid: rent.ownerUid }, function (err, bikeData) {
                if (!bikeData) {
                    res.status(200).json({ "code": "-2" ,"msg" : "车辆不存在"})
                }
                else {
                    rentCollection.insertOne({
                        ownerUid: rent.ownerUid,
                        bike: bikeData,
                        electric: rent.electric,
                        rentType: rent.rentType,
                        time: rent.time,
                        price: rent.price,
                        from: rent.from,
                        to: rent.to,
                        content: rent.content,
                        timeOutOrNot: 0,
                        rentedOrNot: 0,
        
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "添加成功"})
                    })
                }
            })
        }
    })
});


/*
 * @function 修改出租信息
 * @param json对象 出租信息
 * @return code(string) 1 修改成功, -1 账户不存在 ，-2 账单不存在 
 */
router.post('/rent/change', urlencodedParser, async function (req, res, next) {
    let rent = {
        ownerUid: req.body.ownerUid,
        electric: req.body.electric,
        rentType: req.body.rentType,
        time: req.body.time,
        price: parseInt(req.body.price),
        from: req.body.from,
        to: req.body.to,
        content: req.body.content,
        timeOutOrNot: parseInt(req.body.timeOutOrNot),
        rentedOrNot: parseInt(req.body.rentedOrNot),
        id: req.body.id,
    }

    console.log(rent);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let rentCollection = await informationDB.getCollection("RENTLIST");

    accountCollection.findOne({ uid: rent.ownerUid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {

            rentCollection.findOne({ _id: ObjectID(rent.id) }, function (err, rentData) {
                if (!rentData) {
                    res.status(200).json({ "code": "-2" ,"msg" : "账单不存在"})
                }
                else {
                    rentCollection.save({
                        _id: ObjectID(rentData._id),
                        ownerUid: rent.ownerUid,
                        bike: rentData.bike,
                        electric: rent.electric,
                        rentType: rent.rentType,
                        time: rent.time,
                        price: rent.price,
                        from: rent.from,
                        to: rent.to,
                        content: rent.content,
                        timeOutOrNot: rent.timeOutOrNot,
                        rentedOrNot: rent.rentedOrNot,
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "修改成功"})
                    })
                }

            })
        }
    })
});

/*
 * @function 条件查找出租车辆信息
 * @param  condition 查询条件
 * @return rent(json对象) 车辆信息
 */
router.get('/rent/find', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let condition = JSON.parse(params.condition);
    console.log(condition);
    let collection = await informationDB.getCollection("RENTLIST");
    collection.find(condition).toArray(function (err, allData) {
        res.status(200).json({
            rent: allData
        });
    })

});

/*
 * @function 根据出租id查看出售信息
 * @param id(string) 出售id
 * @return rent(json对象) 出售信息
 */
router.get('/rent/findById', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let rentCollection = await informationDB.getCollection("RENTLIST");

    rentCollection.findOne({ _id: ObjectID(params.id) }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "出租不存在"})
        }
        else {
            res.status(200).json({
                rent: data
            })
        }
    })

});




module.exports = router;