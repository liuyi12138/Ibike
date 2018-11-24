//
//  sell.js
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
 * @function 添加出售车辆
 * @param json对象 出售信息
 * @return code(string) 1 添加成功, -1 账户不存在 
 */
router.post('/sell/add', urlencodedParser, async function (req, res, next) {
    let sell = {
		ownerUid: req.body.ownerUid,
        bikeImg: req.body.bikeImg,
        bikeType: req.body.bikeType,
        bikeOld: req.body.bikeOld,
        bikePrice: parseInt(req.body.bikePrice),
        battery: req.body.battery,
        content: req.body.content,
    }

    console.log(sell);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let sellCollection = await informationDB.getCollection("SELLLIST");

    accountCollection.findOne({ uid: sell.ownerUid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {
            sellCollection.insertOne({
                ownerUid: sell.ownerUid,
                bikeImg: sell.bikeImg,
                bikeType: sell.bikeType,
                bikeOld: sell.bikeOld,
                bikePrice: sell.bikePrice,
                content: sell.content,
                battery: sell.battery,
                status: 1,

            }, function () {
                res.status(200).json({ "code": "1" ,"msg" : "添加成功"})
            })

        }
    })
});

/*
 * @function 修改出售信息
 * @param json对象 出售信息
 * @return code(string) 1 修改成功, -1 账户不存在 ，-2 账单不存在 
 */
router.post('/sell/change', urlencodedParser, async function (req, res, next) {
    let sell = {
		ownerUid: req.body.ownerUid,
        bikeImg: req.body.bikeImg,
        bikeType: req.body.bikeType,
        bikeOld: req.body.bikeOld,
        bikePrice: parseInt(req.body.bikePrice),
        content: req.body.content,
        battery: req.body.battery,
        status: parseInt(req.body.status),
        id: req.body.id,
    }

    console.log(sell);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let sellCollection = await informationDB.getCollection("SELLLIST");

    accountCollection.findOne({ uid: sell.ownerUid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {

            sellCollection.findOne({ _id: ObjectID(sell.id) }, function (err, sellData) {
                if (!sellData) {
                    res.status(200).json({ "code": "-2" ,"msg" : "账单不存在"})
                }
                else {
                    sellCollection.save({
                        _id: ObjectID(sellData._id),
                        ownerUid: sell.ownerUid,
                        bikeImg: sell.bikeImg,
                        bikeType: sell.bikeType,
                        bikeOld: sell.bikeOld,
                        bikePrice: sell.bikePrice,
                        content: sell.content,
                        battery: sell.battery,
                        status: sell.status,
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "修改成功"})
                    })
                }

            })
        }
    })
});


/*
 * @function 根据用户uid获取车辆出售信息
 * @param id(string) 用户id
 * @return bike(json对象) 车辆信息
 */
router.get('/sell/mySell', urlencodedParser, async function (req, res, next) {
	let params = req.query;
	console.log(params);
    let collection = await informationDB.getCollection("SELLLIST");
    collection.find({ownerUid: params.ownerUid}).toArray(function (err, data) {
        res.status(200).json({
            sell: data
        });
    })
});

/*
 * @function 条件查找车辆信息
 * @param condition 查询条件
 * @return sell(json对象) 车辆信息
 */
router.get('/sell/find', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let condition = JSON.parse(params.condition);
    console.log(condition);
    let collection = await informationDB.getCollection("SELLLIST");
    collection.find(condition).toArray(function (err, allData) {
        res.status(200).json({
            sell: allData
        });
    })

});

/*
 * @function 添加出售提问
 * @param json对象 提问信息
 * @return code(string) 1 提问成功, -1 账单不存在 
 */
router.post('/sell/question', urlencodedParser, async function (req, res, next) {
    let question = {
        sellId: req.body.sellId,
        question: req.body.question,
    }

    console.log(question);

    let sellCollection = await informationDB.getCollection("SELLLIST");
    let sellDiscussCollection = await informationDB.getCollection("SELLDISCUSS");

    sellCollection.findOne({ _id: ObjectID(question.sellId) }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账单不存在"})
        }
        else {
            sellDiscussCollection.insertOne({
                sellId: question.sellId,
                question: question.question,
                answer: "",
            }, function () {
                res.status(200).json({ "code": "1" ,"msg" : "提问成功"})
            })

        }
    })
});


/*
 * @function 添加出售回答
 * @param json对象 回答信息
 * @return code(string) 1 回答成功, -1 提问不存在 
 */
router.post('/sell/answer', urlencodedParser, async function (req, res, next) {
    let answer = {
        questionId: req.body.questionId,
        answer: req.body.answer,
    }

    console.log(answer);

    let sellDiscussCollection = await informationDB.getCollection("SELLDISCUSS");

    sellDiscussCollection.findOne({ _id: ObjectID(answer.questionId) }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "提问不存在"})
        }
        else {
            sellDiscussCollection.update({ _id: ObjectID(answer.questionId)},{$set: {answer: answer.answer}});
            res.status(200).json({ "code": "1" ,"msg" : "回答成功"})
        }
    })
});

/*
 * @function 根据出售id查看出售信息
 * @param id(string) 出售id
 * @return sell(json对象) 出售信息
 */
router.get('/sell/findById', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let sellCollection = await informationDB.getCollection("SELLLIST");
    let sellDiscussCollection = await informationDB.getCollection("SELLDISCUSS");

    sellCollection.findOne({ _id: ObjectID(params.id) }, function (err, sellData) {
        if (!sellData) {
            res.status(200).json({ "code": "-1" ,"msg" : "出售不存在"})
        }
        else {
            sellDiscussCollection.find({ sellId: params.id }).toArray(function (err, discussData) {
                res.status(200).json({
                    sell: sellData,
                    discuss: discussData,
                });
            })
        }
    })

});

function getDate(){
	nowDate = new Date();
	var nowMonth = nowDate.getMonth()+1;
	nowDateArray = {
		year: nowDate.getFullYear(),
		month: nowMonth>9?nowMonth:"0"+nowMonth,
		day: nowDate.getDate()>9?nowDate.getDate() :"0"+nowDate.getDate(),
		hour: nowDate.getHours()>9?nowDate.getHours() :"0"+nowDate.getHours(),
		minutes: nowDate.getMinutes()>9?nowDate.getMinutes() :"0"+nowDate.getMinutes(),
		second: nowDate.getSeconds()>9?nowDate.getSeconds() :"0"+nowDate.getSeconds()
	}

    return nowDateArray ;
}


module.exports = router;