//
//  appoint.js
//
//  Created by LY on 11/14/2018.
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
 * @function 添加接送信息
 * @param json对象 接送信息
 * @return code(string) 1 添加成功, -1 账户不存在
 */
router.post('/appointment/add', urlencodedParser, async function (req, res, next) {
    let appointment = {
        uid: req.body.uid,
        from: req.body.from,
        to: req.body.to,
        time: req.body.time,
        price: parseInt(req.body.price),
        content: req.body.content,
    }
    console.log(appointment);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let aptCollection = await informationDB.getCollection("APPOINTMENT");

    accountCollection.findOne({ uid: appointment.uid }, function (err, accountData) {
        if (!accountData) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {
            aptCollection.insertOne({
                uid: appointment.uid,
                from: appointment.from,
                to: appointment.to,
                price: appointment.price,
                time: appointment.time,
                content: appointment.content,
                timeOutOrNot: 0,
                successOrNot: 0,

            }, function () {
                res.status(200).json({ "code": "1" ,"msg" : "添加成功"})
            })
        }
    })
});


/*
 * @function 修改接送信息
 * @param json对象 接送信息
 * @return code(string) 1 修改成功, -1 账户不存在 ，-2 账单不存在 
 */
router.post('/appointment/change', urlencodedParser, async function (req, res, next) {
    let appointment = {
        uid: req.body.uid,
        from: req.body.from,
        to: req.body.to,
        time: req.body.time,
        price: parseInt(req.body.price),
        content: req.body.content,
        timeOutOrNot: parseInt(req.body.timeOutOrNot),
        successOrNot: parseInt(req.body.successOrNot),
        id: req.body.id,
    }

    console.log(appointment);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let aptCollection = await informationDB.getCollection("APPOINTMENT");

    accountCollection.findOne({ uid: appointment.uid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {

            aptCollection.findOne({ _id: ObjectID(appointment.id) }, function (err, aptData) {
                if (!aptData) {
                    res.status(200).json({ "code": "-2" ,"msg" : "账单不存在"})
                }
                else {
                    aptCollection.save({
                        _id: ObjectID(aptData._id),
                        uid: appointment.uid,
                        bike: aptData.bike,
                        from: appointment.from,
                        to: appointment.to,
                        price: appointment.price,
                        time: appointment.time,
                        content: appointment.content,
                        timeOutOrNot: appointment.timeOutOrNot,
                        successOrNot: appointment.successOrNot,
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "修改成功"})
                    })
                }

            })
        }
    })
});

/*
 * @function 条件查找接送信息
 * @param  condition 查询条件
 * @return relay(json对象) 接送信息
 */
router.get('/appointment/find', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let condition = JSON.parse(params.condition);
    console.log(condition);
    let collection = await informationDB.getCollection("APPOINTMENT");
    collection.find(condition).toArray(function (err, allData) {
        res.status(200).json({
            appointment: allData
        });
    })

});

/*
 * @function 根据出租id查看接送信息
 * @param id(string) 接送信息id
 * @return relay(json对象) 接送信息
 */
router.get('/appointment/findById', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let aptCollection = await informationDB.getCollection("APPOINTMENT");

    aptCollection.findOne({ _id: ObjectID(params.id) }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "接送不存在"})
        }
        else {
            res.status(200).json({
                relay: data
            })
        }
    })

});




module.exports = router;