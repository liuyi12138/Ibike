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
        time: parseInt(req.body.time),
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
            let fromRegion = findRegion(appointment.from);
            let toRegion = findRegion(appointment.to);
            appointment.from.region = fromRegion;
            appointment.to.region = toRegion;

            aptCollection.insertOne({
                uid: appointment.uid,
                from: appointment.from,
                to: appointment.to,
                price: appointment.price,
                time: appointment.time,
                content: appointment.content,
                createTime: getDate(),
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
        time: parseInt(req.body.time),
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
                    let fromRegion = findRegion(appointment.from);
                    let toRegion = findRegion(appointment.to);
                    appointment.from.region = fromRegion;
                    appointment.to.region = toRegion;
                    
                    aptCollection.save({
                        _id: ObjectID(aptData._id),
                        uid: appointment.uid,
                        bike: aptData.bike,
                        from: appointment.from,
                        to: appointment.to,
                        price: appointment.price,
                        time: appointment.time,
                        content: appointment.content,
                        createTime: aptData.createTime,
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
 * @function 我的接送信息
 * @param  uid(string) 我的uid
 * @return relay(json对象) 接送信息
 */
router.get('/schedule/find', urlencodedParser, async function (req, res, next) {
    let params = req.query;
    console.log(params);
    let aptCollection = await informationDB.getCollection("APPOINTMENT");
    let relayCollection = await informationDB.getCollection("RELAYLIST");

    aptCollection.find({uid: params.uid}).toArray(function (err, aptData) {
        relayCollection.find({ownerUid: params.uid}).toArray(function (err, relayData) {
            res.status(200).json({
                appointment: aptData,
                relay: relayData,
            });
        })
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

/*
 * @function 确认行程
 * @param  id(string) id
 * @return code 1
 */
router.get('/appointment/confirm', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let collection = await informationDB.getCollection("APPOINTMENT");
    collection.update({ _id: ObjectID(params.id)},{$set: {successOrNot: 1}});
    res.status(200).json({ "code": "1" ,"msg" : "确认成功"})

});

/*
 * @function 删除行程
 * @param  id(string) id
 * @return code 1
 */
router.get('/appointment/remove', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let collection = await informationDB.getCollection("APPOINTMENT");
    collection.remove({_id: ObjectID(params.id)},function () {
            res.status(200).json({ "code":"1" , "msg": "删除成功" });
        });

});


function findRegion(myRegion) {
    let yun = [{latitude:30.5051511231,longitude:114.4374990463},{latitude:30.5181655062,longitude:114.4390869141},{latitude:30.5187015727,longitude:114.4275856018},{latitude:30.5064082702,longitude:114.4235515594}];
    let qin = [{latitude:30.5187015727,longitude:114.4275856018},{latitude:30.5192006664,longitude:114.4115138054},{latitude:30.5075544784,longitude:114.4102048874},{latitude:30.5064082702,longitude:114.4235515594}];
    let zi = [{latitude:30.5192006664,longitude:114.4115138054},{latitude:30.5205315705,longitude:114.4019222260},{latitude:30.5065191942,longitude:114.3993902206},{latitude:30.5075544784,longitude:114.4102048874}];

    if (PointInPoly(myRegion,yun)) return "韵苑";
    else if (PointInPoly(myRegion,qin)) return "沁苑";
    else if (PointInPoly(myRegion,zi)) return "紫崧";
    else return "其他"
}

function PointInPoly(pt, poly) { 
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].longitude <= pt.longitude && pt.longitude < poly[j].longitude) || (poly[j].longitude <= pt.longitude && pt.longitude < poly[i].longitude))
        && (pt.latitude < (poly[j].latitude - poly[i].latitude) * (pt.longitude - poly[i].longitude) / (poly[j].longitude - poly[i].longitude) + poly[i].latitude)
        && (c = !c); 
    return c; 
}

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