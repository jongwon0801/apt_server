var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var jwt = require("jsonwebtoken");
var pool = mysql.createPool({
  connectionLimit: 3,
  acquireTimeout: 5000,
  //host: '125.209.200.159',
  host: "localhost",
  user: "yellowbox",
  database: "yellowbox",
  password: "dpfshdnqkrtm",
  multipleStatements: true, // 멀티궈리
});
var cors = require("cors");

router.get("/qrcode", function (req, res, next) {
  var QRCode = require("qrcode");

  QRCode.toFileStream(
    res,
    "SMSTO:+01051925220:여기는 한글",
    {
      width: 400,
      color: {
        dark: "#000", // Blue dots
        light: "#fff", // Transparent background
      },
    },
    function (err) {
      if (err) throw err;
      console.log("done");
    }
  );
});
router.get("/ip", function (req, res, next) {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  fs = require("fs");
  fs.appendFile("ip.txt", ip + "\n", "utf-8", function (err) {
    if (err) {
      console.log(err);
      //res.status(500).json({type:'error',code:500, message:err});
    } else {
      //res.json(fileObj);
    }
  });
  //console.log(req.headers);
  //res.render('markdown', { title: 'Express' });
  res.end();
});

router.get("/test", function (req, res, next) {
  console.log(req.headers);
  //res.render('markdown', { title: 'Express' });
  res.end();
});
router.get("/robots.txt", function (req, res) {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: /");
});
/* GET home page. */
router.post("/", function (req, res, next) {
  //res.status(500).json({"code":10,"type":"error","message":"sss"});
  return next(
    new Error("This is an error and it should be logged to the console")
  );
});
router.get("/", function (req, res, next) {
  //res.render('index', { title: 'Express' });
  //var a;
  //a.indexlsjfl();
  console.log(req.headers);
  res.write(
    "helloljsdjllljfsdjlkfdsjlkfsdjlfd하나나하하sdfjjlfdsjldfsljfsjlsdfjlsdfj"
  );
  res.end();

  //console.log(req.headers['user-agent']);
  //lsjfd
  // throw Error('lsjfljsdlf');
  //if(boolean){

  //return next(new Error("This is an error and it should be logged to the console"));
  //}

  //res.status(500).json({"code":10,"type":"error","message":"sss"});
});

router.get("/click", function (req, res, next) {
  //console.log(req.query);
  res.end();
});
router.get("/save", function (req, res, next) {
  console.log(req.query);
  res.end();
});
router.post("/info", function (req, res, next) {
  //res.render('index', { title: 'Express' });
  //var a;
  //a.indexlsjfl();
  console.log(req.headers);
  //console.log('info');
  console.log(new Date());
  res.write(
    new Buffer(
      "no|codem1|http://192.168.0.3:3000:3000/a|5\
  \non|1430,2400|5"
    ).toString("base64")
  );
  res.end();
});
router.get("/bb", function (req, res, next) {
  res.write(req.cookies.cookieName);
  res.end();
});

router.get("/aa", function (req, res, next) {
  var options = {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    //signed: true // Indicates if the cookie should be signed
  };

  // Set cookie
  res.cookie("cookieName", "cookieValue", options);
  res.write(
    "<html>\
  <head>\
  </head>\
  <body style='margin:0px; padding:0px;'>\
  <a href='bb'>aaaaaaaaa</a>\
  </html>\
  "
  );
  if (req.cookies.cookieName) res.write(req.cookies.cookieName);
  res.end();
});

router.get("/a", function (req, res, next) {
  console.log(req.headers);
  res.write(
    "<html>\
  <head>\
  <style>\
  #footer {\
    position: fixed;\
    bottom: 0;\
    right:0;\
    background-color:red;\
    width:200px;\
    height:100px;\
 }\
  </style>\
  <script type='text/javascript'>\
  function printMousePos(event) {\
    HybridApp.onOk(''+event.clientX);\
    HybridApp.onOk(''+event.clientY);\
    newDiv = document.createElement('div');\
    newDiv.setAttribute('style', 'position:absolute;left:'+event.clientX+'px; top:'+event.clientY+'px; width:30px; height:30px;background-color:green;');\
    document.body.appendChild(newDiv);\
  }\
  HybridApp.onOk('aaaaaaa');\
  console.log(window.innerWidth);\
  console.log(window.innerHeight);\
    document.addEventListener('click', printMousePos);\
  </script>\
  </head>\
  <body style='margin:0px; padding:0px;'>\
  <div sty le='position:absolute;left:300px; top:110px; width:100px; height:100px;background-color:gray;'></div>\
     </body>\
  </html>\
  <script>\
  setTimeout(function(){ ele = document.elementFromPoint(100, 100); console.log(ele);}, 10000);\
  </script>\
  "
  );
  res.end();
});

router.get("/page", function (req, res, next) {
  //res.location('/404');
  //res.setHeader('Location', '/404');
  res.redirect("/404");
  //res.end();
  //if( true) return;
  //res.render('index', { title: 'Express' });
  //var a;
  //a.indexlsjfl();
  //console.log(req.headers);
  //console.log('page');
  /*res.writeHead(301,
    {Location: 'http://smart.apple-box.kr/test'}
  );*/
  //<meta name='viewport' content='width=1080'>
  res.write(
    "<html><head></head><body>\
  <a href='/click' style='position:absolute; top:0px; left:0px; width:500px; height:500px;'>sfdd</a>\
  <div style='background-color:red;position: absolute;left:0px; top:100px; width:1260px; height:100px' onClick='console.log(1111)'>ss</div>\
  <div style='background-color:red;position: absolute;left:0px; top:200px; width:1260px; height:100px' onClick='console.log(1111)'>ss</div>\
  <div style='background-color:black;position: absolute;left:400px; top:360px; width:512px; height:100px' onClick='console.log(1111)'>ss</div>\
  <div style='background-color:black;position: absolute;left:400px; top:360px; width:512px; height:100px' onClick='console.log(1111)'>ss</div>\
  <body><html>\
  <script>\
  console.log(1111);\
  </script>\
  "
  );
  res.end();
});

///user/#/present/giftticketlist/281

//var crypt = require('../common/crypto');
//console.log(crypt.encrypt('01085481970'));
//console.log(encodeURIComponent('2018-02-22T02:58:10.286Z'));
//console.log(encodeURIComponent(crypt.encrypt('01085481970')));
//console.log(crypt.decrypt('NLUoG R19LPgipfpJhtmoA=='));
function des(req, res, next) {
  var crypt = require("../common/crypto");
  //console.log(req.params);
  //console.log(req.params);
  //res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    var toHp = crypt.decrypt(req.query.hp);
    var saveDate = req.query.saveDate;
    //console.log(giftSq);
    //res.redirect('user/#/join?sjdf');
    //req.giftSq = giftSq;
    pool.getConnection(function (err, connection) {
      if (err) {
        res.status(500).json({ type: "error", code: 500, message: err });
      } else {
        var query = connection.query(
          "select * from saveLog  WHERE toHp = ? and saveDate=?",
          [toHp, saveDate],
          function (err, results) {
            // ...
            if (err) {
              res.status(500).json({ type: "error", code: 501, message: err });
              connection.release();
            } else {
              if (results.length == 0) {
                res
                  .status(403)
                  .json({ type: "error", code: 403, message: "no data" });
                connection.release();
              } else {
                //console.log(results[0]);
                //req.memberSq = results[0].toSq;
                //next();
                //res.render('santa',{ giftList:results });
                //res.render('parcel', results[0]);
                var query = connection.query(
                  "select * from applebox  WHERE yid=?",
                  [results[0].yid],
                  function (err, rs) {
                    // ...
                    if (err) {
                      res
                        .status(500)
                        .json({ type: "error", code: 501, message: err });
                    } else {
                      var rsdata = results[0];
                      rsdata.qrcodeFlag = rs[0].qrcodeFlag;
                      res.json(rsdata);
                      //console.log(rsdata);
                      //console.log(results[0].yid);
                    }
                    connection.release();
                  }
                );
              }
            }
          }
        );
        //console.log(query);
      }
    });
  } catch (E) {
    console.log(E);
    res.status(500).json({ type: "error", code: 500, message: E });
  }
}
/*
function test(req,res,next){
	console.log(req.params);
	res.send('sss');
	res.end();
}
*/

//router.get('/:giftSq', test);
router.get("/parcel1", cors(), des);
module.exports = router;
