//
//  account.js
//
//  Created by LY on 11/10/2018.
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
 * @function 注册账户
 * @param json对象 账户信息
 * @return code(string) 1 注册成功, -1 此账户已被注册
 */
router.post('/account', urlencodedParser, async function (req, res, next) {
    // 获取req.body传来的信息，暂存在UserData中
	let UserData = {
		uid: req.body.userRegisterInfo.studentID,
		name: req.body.userRegisterInfo.name,
		tel: req.body.userRegisterInfo.tel,
		class: req.body.userRegisterInfo.class,
        QQ: req.body.userRegisterInfo.qqID,
        wechat: req.body.userRegisterInfo.weChatID,
        introduce: req.body.userRegisterInfo.introduce,
        headImg: req.body.userRegisterInfo.headImg,
        password: req.body.userRegisterInfo.password,
        sex: req.body.userRegisterInfo.gender,
    };
    
    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let passwordCollection = await informationDB.getCollection("PASSWORD");

    accountCollection.findOne({ uid: UserData.uid }, function (err, data) {
        if (data) {
            res.status(200).json({ "code": "-1" ,"msg" : "此账户已被注册"})
        }

        else {
            accountCollection.insertOne({
                uid: UserData.uid,
                name: UserData.name,
                tel: UserData.tel,
                class: UserData.class,
                QQ: UserData.QQ,
                wechat: UserData.wechat,
                introduce: UserData.introduce,
                headImg: UserData.headImg,
                sex: UserData.sex,
                hasBikeOrNot: 0,
            })

            let password = compileStr(UserData.password);

            passwordCollection.insertOne({
                uid: UserData.uid,
                password: password,
            }, function () {
                res.status(200).json({ "code": "1" ,"msg" : "注册成功"})
            })
        }
    })


    
});

/*
 * @function 根据账户uid获取账户信息
 * @param uid(string) 账户uid
 * @return account(json对象) 账户信息
 */
router.get('/account', urlencodedParser, async function (req, res, next) {
	let params = req.query;
	console.log(params);
	let collection = await informationDB.getCollection("ACCOUNT");
	collection.findOne({ uid: params.uid }, function (err, data) {
		if (data) {
			res.status(200).json({
                account: data
			});
		}
		else {
			res.status(200).json({ "code": "-1" ,"msg": "查无此人"})
		}

	});
});

/*
 * @function 修改账户信息
 * @param uid(string) 账户uid
 * @return code(string) 1 修改成功, -1 没有此账户
 */
router.post('/account/change', urlencodedParser, async function (req, res, next) {
    // 获取req.body传来的信息，暂存在UsearData中
	let UserData = {
		uid: req.body.studentID,
		name: req.body.name,
		tel: req.body.tel,
		class: req.body.class,
        QQ: req.body.qqID,
        wechat: req.body.weChatID,
        introduce: req.body.introduce,
        headImg: req.body.headImg,
        password: req.body.password,
        sex: req.body.gender,
        hasBikeOrNot: parseInt(req.body.hasBikeOrNot),
    };
    
    let accountCollection = await informationDB.getCollection("ACCOUNT");

    accountCollection.findOne({ uid: UserData.uid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "没有此账户"})
        }

        else {
            accountCollection.save({
                _id: ObjectID(UserData._id),
                uid: UserData.uid,
                name: UserData.name,
                tel: UserData.tel,
                class: UserData.class,
                QQ: UserData,
                wechat: UserData.wechat,
                introduce: UserData.introduce,
                headImg: UserData.headImg,
                sex: UserData.sex,
                hasBikeOrNot: UserData.hasBikeOrNot,
            }, function () {
                res.status(200).json({ "code": "1" ,"msg" : "修改成功"})
            })
        }
    })
});

/*
 * @function 修改账户密码
 * @param uid(string) 账户uid, oldPassWord(string) 旧密码, newPassword(string) 新密码
 * @return code(string) 1 修改密码成功, -1 没有此账户, -2 密码错误
 */
router.post('/account/changePassword', urlencodedParser, async function (req, res, next) {
    // 获取req.body传来的信息，暂存在UsearData中
	let newData = {
		uid: req.body.uid,
        oldPassWord: req.body.oldPassWord,
        newPassword: req.body.newPassword,
    };
    
    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let passwordCollection = await informationDB.getCollection("PASSWORD");

    accountCollection.findOne({ uid: newData.uid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "没有此账户"})
        }

        else {
            passwordCollection.findOne({ uid: newData.uid }, function (err, passwordData) {
                if (newData.oldPassWord == uncompileStr(passwordData.password)) {
                    let password = compileStr(UserData.password);

                    passwordCollection.save({
                        _id: ObjectID(passwordData._id),
                        uid: newData.uid,
                        password: password,
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "修改密码成功"})
                    })
                }
                else {
                    res.status(200).json({ "code": "-2" ,"msg" : "密码错误"})
                }
            })
        }
    })
});


/*
 * @function 找回密码
 * @param uid(string) 账户uid, name(string) 姓名, newPassword(string) 新密码
 * @return code(string) 1 修改密码成功, -1 没有此账户, -2 用户信息错误
 */
router.post('/account/findPassword', urlencodedParser, async function (req, res, next) {
    // 获取req.body传来的信息，暂存在UsearData中
	let newData = {
		uid: req.body.uid,
        name: req.body.name,
        newPassword: req.body.newPassword,
    };
    
    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let passwordCollection = await informationDB.getCollection("PASSWORD");

    accountCollection.findOne({ uid: newData.uid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "没有此账户"})
        }

        else {
            if (newData.name == data.name) {
                passwordCollection.findOne({ uid: newData.uid }, function (err, passwordData) {
                    let password = compileStr(UserData.password);

                    passwordCollection.save({
                        _id: ObjectID(passwordData._id),
                        uid: newData.uid,
                        password: password,
                    }, function () {
                        res.status(200).json({ "code": "1" ,"msg" : "修改密码成功"})
                    })
                })
            }
            else {
                res.status(200).json({ "code": "-2" ,"msg" : "用户信息错误"})
            }

        }
    })
});

/*
 * @function 登录
 * @param uid(string) 账户uid, password(string) 密码
 * @return code(string) 1 登录成功, -1 账户或密码错误
 */
router.post('/account/login', urlencodedParser, async function (req, res, next) {
    // 获取req.body传来的信息，暂存在UsearData中
    console.log(req.body)
	let loginData = {
		uid: req.body.uid,
        password: req.body.password,
    };

    let accountCollection = await informationDB.getCollection("ACCOUNT");
    let passwordCollection = await informationDB.getCollection("PASSWORD");

    accountCollection.findOne({ uid: loginData.uid }, function (err, data) {
        if (!data) {
            res.status(200).json({ "code": "-1" ,"msg" : "账户或密码错误"})
        }

        else {
            passwordCollection.findOne({ uid: loginData.uid }, function (err, passwordData) {
                if (uncompileStr(passwordData.password) == loginData.password) {
                    accountCollection.findOne({ loginData: params.uid }, function (err, data) {
                        res.status(200).json({ "code": "1" ,"msg" : "登录成功", "account": data})
                    })
                }
                else {
                    res.status(200).json({ "code": "-1" ,"msg" : "账户或密码错误"})
                }
            })

        }
    })
});

//加密算法
function compileStr(code){
    return code;
    // var c=String.fromCharCode(code.charCodeAt(0)+code.length);  
    // for(var i=1;i<code.length;i++){        
    //     c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));  
    // }     
    // return escape(c);
}

//解密算法 
function uncompileStr(code){
    return code;
    // code = unescape(code);        
    // var c=String.fromCharCode(code.charCodeAt(0)-code.length);        
    // for(var i=1;i<code.length;i++){        
    //     c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));        
    // }        
    // return c;
}  

module.exports = router;