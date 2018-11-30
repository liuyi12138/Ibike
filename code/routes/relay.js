//
//  relay.js
//
//  Created by LY on 11/13/2018.
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
 * @function 添加现场接送信息
 * @param json对象 现场接送信息
 * @return code(string) 1 添加成功, -1 账户不存在 -2 车辆不存在
 */
router.post('/relay/add', urlencodedParser, async function (req, res, next) {
    let relay = {
        ownerUid: req.body.ownerUid,
        from: req.body.from,
        to: req.body.to
    }

    console.log(relay);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let bikeCollection = await informationDB.getCollection("BIKE");
    let relayCollection = await informationDB.getCollection("RELAYLIST");

    accountCollection.findOne({ uid: relay.ownerUid }, function (err, accountData) {
        if (!accountData) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {
            bikeCollection.findOne({ ownerUid: relay.ownerUid }, function (err, bikeData) {
                if (!bikeData) {
                    res.status(200).json({ "code": "-2" ,"msg" : "车辆不存在"})
                }
                else {
                    let fromRegion = findRegion(appointment.from);
                    let toRegion = findRegion(appointment.to);
                    appointment.from.region = fromRegion;
                    appointment.to.region = toRegion;

                    relayCollection.insertOne({
                        ownerUid: relay.ownerUid,
                        bike: bikeData,
                        from: relay.from,
                        to: relay.to,
                        createTime: getDate(),
                        status: 1,
        
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "添加成功"})
                    })
                }
            })
        }
    })
});

/*
 * @function 确认行程
 * @param  id(string) id
 * @return code 1
 */
router.get('/sell/confirm', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let collection = await informationDB.getCollection("RELAYLIST");
    collection.update({ _id: ObjectID(params.id)},{$set: {status: 0}});
    res.status(200).json({ "code": "1" ,"msg" : "确认成功"})

});


/*
 * @function 修改现场接送信息
 * @param json对象 现场接送信息
 * @return code(string) 1 修改成功, -1 账户不存在 ，-2 账单不存在 
 */
router.post('/relay/change', urlencodedParser, async function (req, res, next) {
    let relay = {
        ownerUid: req.body.ownerUid,
        from: req.body.from,
        to: req.body.to,
        status: parseInt(req.body.status),
        id: req.body.id,
    }

    console.log(relay);

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let relayCollection = await informationDB.getCollection("RELAYLIST");

    accountCollection.findOne({ uid: relay.ownerUid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户不存在"})
        }
        else {

            relayCollection.findOne({ _id: ObjectID(relay.id) }, function (err, relayData) {
                if (!relayData) {
                    res.status(200).json({ "code": "-2" ,"msg" : "账单不存在"})
                }
                else {
                    let fromRegion = findRegion(relay.from);
                    let toRegion = findRegion(relay.to);
                    relay.from.region = fromRegion;
                    relay.to.region = toRegion;
                    
                    relayCollection.save({
                        _id: ObjectID(relayData._id),
                        ownerUid: relay.ownerUid,
                        bike: relayData.bike,
                        from: relay.from,
                        to: relay.to,
                        createTime: relayData.createTime,
                        status: relay.status,
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "修改成功"})
                    })
                }

            })
        }
    })
});

/*
 * @function 条件查找现场接送信息
 * @param  condition 查询条件
 * @return relay(json对象) 现场接送信息
 */
router.get('/relay/find', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let condition = JSON.parse(params.condition);
    console.log(condition);
    let collection = await informationDB.getCollection("RELAYLIST");
    collection.find(condition).toArray(function (err, allData) {
        res.status(200).json({
            relay: allData
        });
    })

});

/*
 * @function 根据现场接送信息id查看现场接送信息
 * @param id(string) 现场接送信息id
 * @return relay(json对象) 现场接送信息
 */
router.get('/relay/findById', urlencodedParser, async function (req, res, next) {
	let params = req.query;
    console.log(params);
                                                                                                                                         
    let relayCollection = await informationDB.getCollection("RELAYLIST");

    relayCollection.findOne({ _id: ObjectID(params.id) }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "现场接送不存在"})
        }
        else {
            res.status(200).json({
                relay: data
            })
        }
    })

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