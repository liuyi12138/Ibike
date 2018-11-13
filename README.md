# Ibike
**华科电动车租借平台的后台**

## How to use
* 配置数据库文件　`mongod -f mongo.conf`
* 启动数据库 `mongo --port=27001`
* 配置后台 `npm install`
* 启动后台　`npm start`


## How to Modify

- 开启端口请在/bin/www中修改,将"xxxx"修改所需端口即可.

```js
var port = normalizePort(process.env.PORT || 'xxxx');
app.set('port', port);
```

- 数据库端口和相关设定位于/configs/config_set.json

```json
{
    "DATABASE_URL": "mongodb://localhost:27001",
    "DATABASE_NAME": "Ibike",
}
```

- 数据库配置在mongo.conf文件配置


