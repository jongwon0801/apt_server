var express = require("express");
var router = express.Router();
var urlencode = require("urlencode");
var jwt = require("jsonwebtoken");
var config = require("../config");
var _ = require("underscore");
var fs = require("fs");
var dateFormat = require("dateformat");

testtoken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJTcSI6MCwiaHAiOiIwMTA5MTIxNjgwNiIsIm5hbWUiOiJ0ZXN0IiwibWVkaWEiOiJBIiwiaWF0IjoxNTE0ODY5MTA5fQ.XBLu7DTPQMJgqt0LrZ8ytSkXalpj2MXR5OOIYRNJYKs";
testtoken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJTcSI6MTE5LCJocCI6IjAxMDY4MTE1MjI4IiwibmFtZSI6Iu2ZjeyEseyyoCIsIm1lZGlhIjoiQSIsImlhdCI6MTQ3MDAzNTM4M30.xNh_2_caz32PZsJp98eYsl93zStOBWXUYldw3PTu09I";
jwt.verify(testtoken, config.secret, function (err, decoded) {
  console.log(decoded);
});

var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 20,
  acquireTimeout: 5000,
  host: "localhost",
  user: "yellowbox",
  database: "yellowbox",
  password: "dpfshdnqkrtm",
  multipleStatements: true, // 멀티궈리
});

router.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,Content-Type, Authorization"
  );
  next();
});
router.get("/swagger.json", function (req, res) {
  try {
    YAML = require("yamljs");
    res.json((nativeObject = YAML.load("public/api/swagger.yaml")));
  } catch (E) {
    console.log(E);
  }
});

router.get("/settings", function (req, res) {
  res.sendFile("settings.json", { root: "./" });
});
function laundryPriceTable(req, res, next) {
  var start = parseInt(req.query.page || "1") - 1;
  var length = parseInt(req.query.display || "10");

  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    }

    var query = connection.query(
      "select * from laundryPrice where shopSq=? group by sortOrder ",
      [req.params.shopSq],
      function (err, results) {
        // ...
        if (err) {
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          res.json(results);
        }
        connection.release();
      }
    );
  });
}
router.get("/LaundryPriceTable/:shopSq", ensureAuthorized, laundryPriceTable);

function configinfo(req, res, next) {
  metaData = {};
  var params = req.query.key;
  if (!params) params = ["version"];
  if (!Array.isArray(params)) {
    params = [params];
  }

  _.each(params, function (what) {
    if (what == "version") {
      if (req.params.os == "ios") {
        metaData.version = 1;
      } else if (req.params.os == "android") {
        metaData.version = 8;
        metaData.marketUrl = "market://details?id=com.wikibox.applebox";
      }
    } else if (what == "contract") {
      var tmp = fs.readFileSync("/opt/node-locker/contract.conf", "utf-8");
      metaData.contract = tmp;
    } else if (what == "privacy") {
      var tmp = fs.readFileSync("/opt/node-locker/privacy.conf", "utf-8");
      metaData.privacy = tmp;
    } else if (what == "parcel_price_table") {
      var pt = require("../parcel_price_table");
      metaData.parcel_price_table = pt;
    } else if (what == "code") {
      metaData.code = {
        "locker.status": [
          { key: "A", name: "보관중" },
          { key: "B", name: "사용가능" },
          { key: "C", name: "사용불가" },
          { key: "D", name: "보관하는중" },
          { key: "E", name: "찾으려염" },
        ],
        "order.status": [
          { key: "A", name: "준비중" },
          { key: "B", name: "배달중" },
          { key: "C", name: "배달완료" },
          { key: "D", name: "취소-사용자" },
          { key: "E", name: "취소-관리자" },
        ],
        "order.status.A": [
          { key: "A", name: "결제완료" },
          { key: "B", name: "보관중" },
          { key: "C", name: "수거" },
          { key: "D", name: "택배완료" },
          { key: "Z", name: "결제취소" },
        ],
        "order.payType": [
          { key: "A", name: "선불" },
          { key: "B", name: "착불" },
        ],
        "parcel.size": [
          { key: "A", name: "소" },
          { key: "B", name: "중" },
          { key: "C", name: "대" },
          { key: "D", name: "특대" },
        ],
      };
    } else if (what == "category") {
      metaData.category = [
        {
          key: "00",
          name: "생필품",
          child: [
            { key: "0000", name: "세제/섬유유연제" },
            { key: "0001", name: "세안도구/면도" },
            { key: "0002", name: "방향/탈취/살충" },
            { key: "0003", name: "화장지/물티슈/위생용품" },
            { key: "0004", name: "주방/욕실 청소용품" },
            { key: "0005", name: "헤어/바디/구강용품" },
            { key: "0006", name: "생활잡화" },
          ],
        },
        {
          key: "01",
          name: "냉장/냉동식품",
          child: [
            { key: "0100", name: "치즈/버터/유제품" },
            { key: "0101", name: "우유/요거트/커피" },
            { key: "0102", name: "만두/돈가스/간식" },
            { key: "0103", name: "김치/반찬/젓갈" },
            { key: "0104", name: "햄/소시지/어묵" },
            { key: "0105", name: "면/똑/간편식품" },
            { key: "0106", name: "볶음밥/죽/국/탕" },
            { key: "0107", name: "베이커리/디저트" },
          ],
        },
        {
          key: "02",
          name: "가공식품",
          child: [
            { key: "0207", name: "참치캔/통조림류" },
            { key: "0200", name: "두유/우유" },
            { key: "0201", name: "즉석/간편식품" },
            { key: "0202", name: "시용유/소스류" },
            { key: "0203", name: "과자/간식" },
            { key: "0204", name: "라면/면류" },
            { key: "0205", name: "밀가루/조미료" },
            { key: "0206", name: "커피/차/생수/음료수" },
          ],
        },
        {
          key: "03",
          name: "신선식품",
          child: [
            { key: "0300", name: "과일" },
            { key: "0301", name: "채소/두부" },
            { key: "0302", name: "계란/견과류/쌀" },
            { key: "0303", name: "소고기" },
            { key: "0304", name: "돼지고기" },
            { key: "0305", name: "닭/오리고기" },
          ],
        },
      ];
    }
  });
  res.json(metaData);
}

router.get("/Config/:os/:version", configinfo);

function configinfo1(req, res, next) {
  metaData = {};
  var params = req.query.key;
  if (!params) params = ["version"];
  if (!Array.isArray(params)) {
    params = [params];
  }
  metaData.LaundryPriceVersion = 1;
  _.each(params, function (what) {
    if (what == "parcel") {
      metaData.parcel = {
        api_key: "wM0uYQz9885cZJgAXeI1KQ",
        company: [
          {
            Code: "04",
            Name: "CJ대한통운",
          },
          {
            Code: "05",
            Name: "한진택배",
          },
          {
            Code: "08",
            Name: "롯데택배",
          },
          {
            Code: "01",
            Name: "우체국택배",
          },
          {
            Code: "06",
            Name: "로젠택배",
          },
          {
            Code: "07",
            Name: "KG로지스택배",
          },
          {
            Code: "09",
            Name: "KG로지스택배(KG옐로우캡)",
          },
          {
            Code: "10",
            Name: "KGB택배",
          },
          {
            Code: "11",
            Name: "일양로지스",
          },
          {
            Code: "12",
            Name: "EMS",
          },
          {
            Code: "13",
            Name: "DHL",
          },
          {
            Code: "20",
            Name: "한덱스",
          },
          {
            Code: "21",
            Name: "FedEx",
          },
          {
            Code: "14",
            Name: "UPS",
          },
          {
            Code: "26",
            Name: "USPS",
          },
          {
            Code: "22",
            Name: "대신택배",
          },
          {
            Code: "23",
            Name: "경동택배",
          },
          {
            Code: "32",
            Name: "합동택배",
          },
          {
            Code: "24",
            Name: "CVSnet 편의점택배",
          },
          {
            Code: "46",
            Name: "CU 편의점택배",
          },
          {
            Code: "25",
            Name: "TNT Express",
          },
          {
            Code: "16",
            Name: "한의사랑택배",
          },
          {
            Code: "15",
            Name: "GTX로지스",
          },
          {
            Code: "17",
            Name: "천일택배",
          },
          {
            Code: "18",
            Name: "건영택배",
          },
          {
            Code: "28",
            Name: "GSMNtoN",
          },
          {
            Code: "29",
            Name: "에어보이익스프레스",
          },
          {
            Code: "30",
            Name: "KGL네트웍스",
          },
          {
            Code: "33",
            Name: "DHL Global Mail",
          },
          {
            Code: "34",
            Name: "i-Parcel",
          },
          {
            Code: "37",
            Name: "범한판토스",
          },
          {
            Code: "38",
            Name: "APEX(ECMS Express)",
          },
          {
            Code: "39",
            Name: "KG로지스택배",
          },
          {
            Code: "40",
            Name: "굿투럭",
          },
          {
            Code: "41",
            Name: "GSI Express",
          },
          {
            Code: "42",
            Name: "CJ대한통운 국제특송",
          },
          {
            Code: "43",
            Name: "애니트랙",
          },
          {
            Code: "44",
            Name: "SLX",
          },
          {
            Code: "45",
            Name: "호남택배",
          },
          {
            Code: "47",
            Name: "우리한방택배",
          },
          {
            Code: "99",
            Name: "롯데택배 해외특송",
          },
        ],
      };
    }
    if (what == "version") {
      if (req.params.os == "ios") {
        metaData.version = 21;
      } else if (req.params.os == "android") {
        if (req.params.package == "com.wikibox.applebox") {
          metaData.version = 20;
          metaData.versionName = "1.20";
          metaData.marketUrl = "market://details?id=" + req.params.package;
        } else if (req.params.package == "com.wikibox.parcel") {
          metaData.version = 1;
          //metaData.versionName='1.0.12';
          metaData.marketUrl = "market://details?id=" + req.params.package;
        } else if (req.params.package == "com.wikibox.laundry") {
          metaData.version = 1;
          //metaData.versionName='1.0.12';
          metaData.marketUrl = "market://details?id=" + req.params.package;
        }
      }
    } else if (what == "contract") {
      var tmp = fs.readFileSync("contract.conf", "utf-8");
      metaData.contract = tmp;
    } else if (what == "privacy") {
      var tmp = fs.readFileSync("privacy.conf", "utf-8");
      metaData.privacy = tmp;
    } else if (what == "parcel_price_table") {
      var pt = require("../parcel_price_table");
      metaData.parcel_price_table = pt;
    } else if (what == "code") {
      metaData.code = {
        "locker.status": [
          { key: "A", name: "보관중" },
          { key: "B", name: "사용가능" },
          { key: "C", name: "사용불가" },
          { key: "D", name: "보관하는중" },
          { key: "E", name: "찾으려염" },
        ],
        "order.status": [
          { key: "A", name: "준비중" },
          { key: "B", name: "배달중" },
          { key: "C", name: "배달완료" },
          { key: "D", name: "취소-사용자" },
          { key: "E", name: "취소-관리자" },
        ],
        "order.status.A": [
          { key: "A", name: "등록" },
          { key: "B", name: "보관중" },
          { key: "C", name: "수거" },
          { key: "D", name: "택배완료" },
          { key: "Z", name: "결제취소" },
        ],
        "order.status.B": [
          { key: "A", name: "등록" },
          { key: "B", name: "보관중" },
          { key: "C", name: "수거" },
          { key: "D", name: "결제대기" },
          { key: "E", name: "세탁중" },
          { key: "F", name: "세탁완료" },
          { key: "G", name: "배달준비" },
          { key: "H", name: "배달완료" },
          { key: "I", name: "세탁수령" },
          { key: "Z", name: "결제취소" },
        ],
        "order.payType": [
          { key: "A", name: "선불" },
          { key: "B", name: "착불" },
        ],
        "parcel.size": [
          { key: "A", name: "소" },
          { key: "B", name: "중" },
          { key: "C", name: "대" },
          { key: "D", name: "특대" },
        ],
        "locker.usage": [
          { key: "A", name: "택배" },
          { key: "B", name: "택배" },
          { key: "C", name: "세탁" },
          { key: "D", name: "세탁" },
          { key: "F", name: "보관" },
          { key: "F", name: "기부" },
        ],
      };
    } else if (what == "category") {
      metaData.category = [
        {
          key: "00",
          name: "생필품",
          child: [
            { key: "0000", name: "세제/섬유유연제" },
            { key: "0001", name: "세안도구/면도" },
            { key: "0002", name: "방향/탈취/살충" },
            { key: "0003", name: "화장지/물티슈/위생용품" },
            { key: "0004", name: "주방/욕실 청소용품" },
            { key: "0005", name: "헤어/바디/구강용품" },
            { key: "0006", name: "생활잡화" },
          ],
        },
        {
          key: "01",
          name: "냉장/냉동식품",
          child: [
            { key: "0100", name: "치즈/버터/유제품" },
            { key: "0101", name: "우유/요거트/커피" },
            { key: "0102", name: "만두/돈가스/간식" },
            { key: "0103", name: "김치/반찬/젓갈" },
            { key: "0104", name: "햄/소시지/어묵" },
            { key: "0105", name: "면/똑/간편식품" },
            { key: "0106", name: "볶음밥/죽/국/탕" },
            { key: "0107", name: "베이커리/디저트" },
          ],
        },
        {
          key: "02",
          name: "가공식품",
          child: [
            { key: "0207", name: "참치캔/통조림류" },
            { key: "0200", name: "두유/우유" },
            { key: "0201", name: "즉석/간편식품" },
            { key: "0202", name: "시용유/소스류" },
            { key: "0203", name: "과자/간식" },
            { key: "0204", name: "라면/면류" },
            { key: "0205", name: "밀가루/조미료" },
            { key: "0206", name: "커피/차/생수/음료수" },
          ],
        },
        {
          key: "03",
          name: "신선식품",
          child: [
            { key: "0300", name: "과일" },
            { key: "0301", name: "채소/두부" },
            { key: "0302", name: "계란/견과류/쌀" },
            { key: "0303", name: "소고기" },
            { key: "0304", name: "돼지고기" },
            { key: "0305", name: "닭/오리고기" },
          ],
        },
      ];
    }
  });
  res.json(metaData);
}

router.get("/Config/:os/:package/:version", configinfo1);

function ensureAdmin(req, res, next) {
  if (req.decoded.memberType === "D") {
    next();
  } else {
    return res.status(401).json({
      type: "error",
      code: 401,
      message: "Failed to authenticate token.",
    });
  }
}
/*
function checkAuthorized(req,res){
	var atoken = req.body.token || req.query.token || req.headers['authorization'];	  
	if (atoken) {
		  var token = atoken.split(' ');
		  if( token.length==2 )
		    jwt.verify(token[1], config.secret, function(err, decoded) {      
		      if (err) return false;    
		      else return true;
		    });
		  else return false;

	 } else return false;
}
*/
function ensureAuthorized(req, res, next) {
  var atoken =
    req.body.token || req.query.token || req.headers["authorization"];

  // decode token
  //console.log(req.headers);
  if (atoken) {
    var token = atoken.split(" ");
    if (token.length == 2) {
      // verifies secret and checks exp
      jwt.verify(token[1], config.secret, function (err, decoded) {
        if (err) {
          return res
            .status(401)
            .json({ code: 401, type: "error", message: "토큰이 인증 실패." });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res
        .status(401)
        .json({ code: 401, type: "error", message: "토큰이 없습니다." });
    }
  } else {
    // if there is no token
    // return an error
    return res
      .status(401)
      .json({ code: 401, type: "error", message: "토큰이 없습니다.1" });
  }
}
function checkAuthorized(req, res, next) {
  var atoken =
    req.body.token || req.query.token || req.headers["authorization"];

  // decode token
  //console.log(req.headers);
  if (atoken) {
    var token = atoken.split(" ");
    if (token.length == 2) {
      // verifies secret and checks exp
      jwt.verify(token[1], config.secret, function (err, decoded) {
        if (err) {
          next();
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      next();
    }
  } else {
    // if there is no token
    // return an error
    next();
  }
}
//유효성 검사합니다.
//jwt.verify(bearerToken, process.env.JWT_SECRET)
/*function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["x-access-token"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next(); // 다음 콜백함수 진행
    } else {
        res.send(403);
    }
}*/

function appleboxSelect(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      var query = connection.query(
        "SELECT * FROM applebox WHERE yid=?",
        [req.params.yid],
        function (err, results) {
          if (err) {
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            if (results.length == 0) {
              res
                .status(404)
                .json({ code: 404, type: "error", message: "no data" });
            } else {
              var abox = results[0];
              abox.addr = JSON.parse(abox.addr);
              res.json({ success: true, data: abox });
            }
          }
          connection.release();
        }
      );
    }
  });
}
router.get("/Applebox/:yid", ensureAuthorized, appleboxSelect);
function appleboxUpdate(req, res, next) {
  pool.getConnection(function (err, connection) {
    var param = {
      name: req.body.name,
      location: req.body.location,
      addr: JSON.stringify(req.body.addr),
      hp: req.body.hp,
      status: req.body.status,
      installed: req.body.installed,
      buyerSq: req.body.buyerSq,
    };

    var query = connection.query(
      "update `applebox` set ? where yid=?",
      [param, req.params.yid],
      function (err, rows) {
        if (err) {
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          res.json({ changedRows: rows.changedRows });
        }
        connection.release();
      }
    );
  });
}
router.put("/Applebox/:yid", ensureAuthorized, ensureAdmin, appleboxUpdate);

function addrNew(req, res, next) {
  //console.log(req.query.toString("utf8"));
  //var utf8 = require('utf8');
  //console.log(new Buffer(req.query.query, 'utf').toString('utf8'));
  try {
    var query = urlencode(req.query.query, "utf8");

    //console.log(query);
    //console.log('<'+req.query.query+'>');
    var request = require("request");

    //console.log(query);
    var confmKey = "U01TX0FVVEgyMDE3MDIxNDEwMzUzMDE4OTg3";
    var currentPage = req.query.currentPage || "1";
    var countPerPage = req.query.countPerPage || "10";
    var queryUrl = `http://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${confmKey}&currentPage=${currentPage}&countPerPage=${countPerPage}&keyword=${query}&resultType=json`;

    //console.log(queryUrl);
    request(queryUrl, function (error, response, body) {
      console.log(response);
      console.log(body);

      /*var parseString = require('xml2js').parseString;
		  parseString(body, {trim: true,explicitArray:false},function (err, result) {
			  
			  res.json(result);
		
		  });*/
      //print(type(body))
      res.set("Content-Type", "application/json");
      res.send(body);
    });
  } catch (E) {
    console.log(E);
    res.send(ㄸ);
  }
}
router.get("/addr_new", addrNew);

function appleboxLive(req, res, next) {
  //console.log(req.body);
  pool.getConnection(function (err, connection) {
    //var param=req.body;

    //var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    var query = connection.query(
      "update applebox set baddr=now() where yid=?",
      [req.params.yid],
      function (err, rows) {
        if (err) {
          res.status(500).json({ code: 10, type: "error", message: err });
        } else {
          if (rows.changedRows == 0) {
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            res.json({ success: true, changedRows: rows.changedRows });
          }
        }
        connection.release();
      }
    );
  });
}
router.get("/AppleboxLive/:yid", appleboxLive);

function getApplebox(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');
  //console.log(req.decoded);
  //console.log('1111');
  var ip = req.header("x-forwarded-for") || req.connection.remoteAddress;

  //console.log(ip);
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      //var wsql='where ownerSq='+req.decoded.memberSq;
      //wsql+=' and  status="A"';
      //if(req.query.giftSq) wsql+=' and giftSq='+req.body.giftSq;
      var query = connection.query(
        "select * from applebox   where yid=?",
        [req.params.yid],
        function (err, yb) {
          if (err) {
            //res.status(500).json({type:'error',message:err,code:500});
            //console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
            connection.release();
          } else {
            var query = connection.query(
              "select * from locker where yid=? order by col,`row`",
              [req.params.yid],
              function (err, results) {
                if (err) {
                  //console.log(err);
                  res
                    .status(500)
                    .json({ type: "error", message: err, code: 500 });
                  connection.release();
                } else {
                  var abox = yb[0];
                  abox.addr = JSON.parse(abox.addr);
                  var result = { applebox: abox, cabinet: [] };
                  //result.applebox=result;
                  var rs = [];
                  //var cabinet = ;
                  var boxes = [];
                  var colLabel = 65;
                  var tcol;
                  _.each(results, function (one) {
                    //var col = one.col;
                    //console.log(tcol,one.col,tcol==one.col);
                    if (tcol == undefined) {
                      tcol = one.col;
                      //console.log('dddd')
                      boxes.push(one);
                    } else if (tcol !== one.col) {
                      result.cabinet.push({
                        label: String.fromCharCode(colLabel),
                        width: 500,
                        box: boxes,
                      });
                      //console.log(boxes.length);
                      boxes = [];
                      boxes.push(one);
                      tcol = one.col;
                      colLabel++;
                    } else {
                      boxes.push(one);
                    }
                  });
                  if (boxes.length > 0) {
                    //console.log(boxes.length);
                    result.cabinet.push({
                      label: String.fromCharCode(colLabel),
                      width: 500,
                      box: boxes,
                    });
                  }
                  //console.log(result);
                  res.json(result);
                  connection.release();
                }
              }
            );
          }
          function errorHandler(err) {
            console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
            connection.release();
          }
          //connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/AppleboxAll/:yid", ensureAuthorized, getApplebox);

function appleboxCreate(req, res, next) {
  var param = req.body.applebox;
  if (param.addr) param.addr = JSON.stringify(param.addr);
  //var customerSq = crypt.decrypt(req.body.k);

  console.log(req.body);
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        //console.log(err);
        //res.status(500).json({type:'error',message:err,code:500});
        throw err;
      }
      connection.query(
        "INSERT INTO applebox SET ?",
        param,
        function (err, result) {
          if (err) {
            console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
            //console.log(err);
            //return connection.rollback(function() { throw err;});
          } else {
            var items = [];
            //var yid = result.insertId;
            var yid = req.body.applebox.yid;
            var totalCount = 0;
            var boxCount = 0; //
            for (i = 0; i < req.body.cabinet.length; i++) {
              var cabinet = req.body.cabinet[i];
              //print(cabinet);

              for (j = 0; j < cabinet.box.length; j++) {
                var item = cabinet.box[j];
                totalCount++;
                if (item.kind != "A") {
                  item.kind = "B";
                }
                if (item.kind == "B") boxCount++;
                /*items.push([
							i,   //column
                    		cabinet.depth, 
                    		item.height, 
							item.kind=='A'?0:parseInt((boxCount-1)/16)+1,  // jumper
							item.kind, 
							item.label,
							j,  //row
							item.kind=='A'?0:(boxCount-1)%16+1, // serial
							item.kind=='A'?'C':'B',  // status
							item.width,
							yid
							
						]);*/
                items.push([
                  item.col, //column
                  item.depth,
                  item.height,
                  item.jumper, // jumper
                  item.kind,
                  item.label,
                  item.row, //row
                  item.serial,
                  item.status,
                  item.width,
                  yid,
                ]);
                /*item.yid= yid;
						item.col = i;
						item.row = j;
						item.depth = cabinet.depth;
						item.jumper = parseInt(totalCount/16);
						item.serial = totalCount%16;
						item.label = cabinet.label+(cabinet.box.length-boxCount);
						item.status='A';
						*/
              }
            }

            /*
		    	req.body.cabinet.forEach(function(cabinet) {
					//console.log(cabinet);
					cabinet.box.forEach(function(item){
						item.yid= yid;
						items.push([
							item.col, 
                    		item.depth, 
                    		item.height, 
							item.jumper, 
							item.kind, 
							item.label, 
							item.row,
							item.serial,
							item.status, 
							item.width,
							item.yid
						]);
					});
				});
				*/
            //console.log(items);
            connection.query(
              "INSERT INTO locker (col,depth,height,jumper,kind,label,`row`,serial,status,width,yid) VALUES ?",
              [items],
              function (err) {
                if (err) {
                  console.log(err);
                  res
                    .status(500)
                    .json({ type: "error", code: 500, message: err });
                  return connection.rollback(function () {
                    //throw err;
                  });
                  //connection.release();
                } else {
                  connection.commit(function (err) {
                    if (err) {
                      res
                        .status(500)
                        .json({ type: "error", message: err, code: 500 });
                      return connection.rollback(function () {
                        //throw err;
                      });
                    } else {
                      res.json({ yid: yid });
                    }
                    connection.release();
                  });
                }
              }
            );
          }
        }
      );
    });
  });
}

router.post("/AppleboxCreate", appleboxCreate);

function appleboxInstall(req, res, next) {
  console.log(req.body);
  var param = req.body.applebox;
  if (param.addr) param.addr = JSON.stringify(param.addr);

  pool.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        //console.log(err);
        //res.status(500).json({type:'error',message:err,code:500});
        throw err;
      }
      connection.query(
        "INSERT INTO applebox SET ?",
        param,
        function (err, result) {
          if (err) {
            //console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
            //console.log(err);
            //return connection.rollback(function() { throw err;});
          } else {
            var items = [];

            for (var i = 0; i < req.body.cabinet.length; i++) {
              //console.log(req.body.cabinet[i]);
              var cabinet = req.body.cabinet[i];
              //print(cabinet);
              //console.log(cabinet);
              for (j = 0; j < cabinet.box.length; j++) {
                var item = cabinet.box[j];
                console.log(item);
                items.push([
                  item.col, //column
                  item.depth,
                  item.height,
                  item.jumper,
                  item.kind,
                  item.label,
                  item.row, //row
                  item.serial,
                  item.status,
                  item.width,
                  item.yid,
                ]);
              }
            }

            connection.query(
              "INSERT INTO locker (col,depth,height,jumper,kind,label,`row`,serial,status,width,yid) VALUES ?",
              [items],
              function (err) {
                //console.log(1);
                if (err) {
                  console.log(err);
                  res
                    .status(500)
                    .json({ type: "error", code: 500, message: err });
                  return connection.rollback(function () {
                    //throw err;
                  });
                  //connection.release();
                } else {
                  //console.log(2);
                  connection.commit(function (err) {
                    if (err) {
                      console.log(err);
                      res
                        .status(500)
                        .json({ type: "error", message: err, code: 500 });
                      return connection.rollback(function () {
                        //throw err;
                      });
                    } else {
                      //console.log(3);

                      res.json({ yid: req.body.applebox.yid });
                    }
                    connection.release();
                  });
                }
              }
            );
          }
        }
      );
    });
  });
}

router.post("/AppleboxInstall", appleboxInstall);

//회원 조회

function me(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var query = connection.query(
        "SELECT * FROM member WHERE memberSq = ?",
        [req.decoded.memberSq],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            if (results.length == 0) {
              res
                .status(404)
                .json({ type: "error", message: "no data", code: 404 });
            } else {
              res.json(results[0]);
            }
          }
          connection.release();
        }
      );
    }
  });
}
router.get("/me", ensureAuthorized, me);

// 회원 조회
function appleboxApprove(req, res, next) {
  console.log(req.body);
  pool.getConnection(function (err, connection) {
    var param = req.body;

    var ip = req.header("x-forwarded-for") || req.connection.remoteAddress;

    var query = connection.query(
      "update applebox set installed=? , ip=? ,regId=?, tel=? where yid=? and installed='N'",
      ["Y", ip, req.body.regId, req.body.tel, req.body.yid],
      function (err, rows) {
        if (err) {
          res.status(500).json({ code: 10, type: "error", message: err });
        } else {
          if (rows.changedRows == 0) {
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            res.json({ ip: ip, changedRows: rows.changedRows });
          }
        }
        connection.release();
      }
    );
  });
}
router.post("/AppleboxApprove", appleboxApprove);

function getOrderNumber() {
  return dateFormat(new Date(), "yymmddHHMMssl") + randomString(4, "N");
}

function randomString(len, an) {
  an = an && an.toLowerCase();
  var str = "",
    i = 0,
    min = an == "a" ? 10 : 0,
    max = an == "n" ? 10 : 62;
  for (; i++ < len; ) {
    var r = (Math.random() * (max - min) + min) << 0;
    str += String.fromCharCode((r += r > 9 ? (r < 36 ? 55 : 61) : 48));
  }
  return str;
}
router.get("/authSmsDeliverer/:hp", authSmsDeliverer);
function authSmsDeliverer(req, res, next) {
  var authNum = randomString(4, "N");
  var smsMsg = "위키박스 인증번호[" + authNum + "]";

  var data = {
    dest_phone: req.params.hp,
    send_phone: config.feedbackPhone,
    msg_body: smsMsg,
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    }
    connection.query(
      "select * from rfid where tagid='" + req.params.hp + "'",
      [],
      function (err, results) {
        if (err) {
          connection.release();
          throw err;
        }
        if (results.length == 0) {
          //res.json({authNum:authNum});
          connection.query(
            "INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",
            data,
            function (err, results) {
              //connection.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", data, function(err,results) {
              //console.log(data)

              if (err) {
                connection.release();
                throw err;
              } else {
                //req.session.authNum= authNum;
                //req.session.cookie.maxAge = 60;
                res.json({ authNum: authNum });
              }
              connection.release();
            }
          );
        } else {
          connection.release();
          res
            .status(422)
            .json({ code: 422, type: "error", message: "duplicate" });
        }
      }
    );

    //console.log(5)
  });
}

router.post("/authSms", authSms);
function authSms(req, res, next) {
  console.log(req.body);
  //console.log(req.session.authNum);
  if (req.session.authNum) {
    res.json({ authNum: req.session.authNum });
    return;
  }

  Promise.all([getCodeTbl("template", "A")]).then(
    function (res1) {
      //console.log(res);

      //console.log(res1);
      var format = require("string-template");
      var authNum = randomString(4, "N");
      //console.log(authNum);
      if (req.body.hp == "01051925220") {
        authNum = "0000";
      }
      var smsMsg = format(res1[0].description, {
        authNum: authNum,
        //saveName: req.body.saveName,
        //boxName:req.body.boxName
      });

      var data = {
        dest_phone: req.body.hp,
        send_phone: config.feedbackPhone,
        msg_body: smsMsg,
      };
      console.log(data);
      pool.getConnection(function (err, connection) {
        if (err) {
          res.status(500).json({ code: 10, type: "error", message: err });
        } else {
          //console.log(4)
          connection.query(
            "INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",
            data,
            function (err, results) {
              //connection.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", data, function(err,results) {
              //console.log(data)

              if (err) {
                //console.log(err);
                //reject();
                res.status(500).json({ code: 10, type: "error", message: err });
              } else {
                req.session.authNum = authNum;
                req.session.cookie.maxAge = 60;
                res.json({ authNum: authNum });
              }
              connection.release();
            }
          );
          console.log(5);
        }
      });
    },
    function (err) {
      console.log(er);
    }
  );
}

router.post("/SmsSend", ensureAuthorized, smsSend);
function smsSend(req, res, next) {
  var data = {
    dest_phone: req.body.hp,
    send_phone: config.feedbackPhone,
    msg_body: req.body.msg,
  };
  //console.log(data);
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      //console.log(4)
      connection.query(
        "INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",
        data,
        function (err, results) {
          if (err) {
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            res.json({ success: true });
          }
          connection.release();
        }
      );
      //console.log(5)
    }
  });
}

function orderTempInsert(req, res, next) {
  var param = {
    orderCd: req.body.orderCd,
    products: JSON.stringify(req.body.products), // 주문상품
    reqItem: req.body.reqItem, //요청내용
    totalPrice: req.body.totalPrice, //총판매가격
    title: req.body.title, //제목(자동생성)
    addr: JSON.stringify(req.body.addr), //주소
    shopSq: req.body.shopSq, //상점아이디
    memberSq: req.decoded.memberSq, //사용자아이디
    kind: req.body.kind,
    payType: req.body.payType,
    //orderTempCd:getOrderNumber()
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      dbInsert(connection, "orderTemp", param).then(
        function (results) {
          param.products = req.body.products;
          param.addr = req.body.addr;
          res.json({ success: true, data: param });
          connection.release();
        },
        function (err) {
          connection.release();
          res.status(500).json({ code: 10, type: "error", message: err });
        }
      );
    }
  });
  //}
}
router.post("/OrderTemp", ensureAuthorized, orderTempInsert);

function gcmRegister(req, res, next) {
  console.log(req.body);
  var param = {
    regId: req.body.regId,
    devType: req.body.devType,
    hp: req.body.hp,
  };

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query("INSERT INTO gcm set ?", param, function (err, rows) {
      if (err) {
        connection.release();
        throw err;
      }

      res.json({ insertId: rows.insertId });
      connection.release();
    });
  });
}
router.post("/GcmRegister", gcmRegister);

function gCodeTblList(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
      connection.release();
    } else {
      var query = connection.query(
        'SELECT * FROM codeTbl WHERE gCode = ? and status="A" order by sortOrder asc',
        [req.params.gCode],
        function (err, results) {
          var rs = [];
          _.each(results, function (one) {
            rs.push(one);
          });
          res.json(rs);
          connection.release();
        }
      );
    }
  });
}

router.get("/CodeTbl/:gCode", gCodeTblList);

function gCodeTbl(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
      connection.release();
    } else {
      var query = connection.query(
        "SELECT * FROM codeTbl WHERE gCode = ? and `key`=? ",
        [req.params.gCode, req.params.key],
        function (err, results) {
          if (err)
            res.status(500).json({ type: "error", message: err, code: 500 });
          else {
            if (results.length == 0) {
              res.json({});
            } else {
              var rs = results[0];
              //rs.thumbnail=JSON.parse(rs.thumbnail);

              res.json(rs);
            }

            //

            // res.json(results[0]);
          }

          connection.release();
        }
      );
    }
  });
}

router.get("/CodeTbl/:gCode/:key", gCodeTbl);

function getCodeList(gCode) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      connection.query(
        "SELECT `key`,name,description FROM codeTbl WHERE gCode = ? and status='A' order by sortOrder asc",
        [gCode],
        function (err, rows) {
          if (err) {
            resolve([]);
          } else {
            if (rows.length == 0) {
              resolve([]);
            } else {
              resolve(rows);
            }
          }
          connection.release();
        }
      );
    });
  });
}

router.get("/CodeTbl", function (req, res, next) {
  //console.log('here');
  //console.log(req.headers);
  var p = req.query.gCode;
  if (!p) {
    res.json({});
  }
  var codes = [];
  if (Array.isArray(p)) {
    codes = p;
  } else {
    codes = [p];
  }
  var promises = [];
  for (var i = 0; i < codes.length; i++) {
    promises.push(getCodeList(codes[i]));
  }
  //console.log(codes);
  Promise.all(promises).then(
    function (results) {
      var rs = {};
      //console.log(results);
      for (var i = 0; i < codes.length; i++) {
        rs[codes[i]] = results[i];
        //console.log(i);
      }

      res.json(rs);
      //console.log(results);
    },
    function (err) {
      res
        .status(401)
        .json({ code: 401, type: "error", message: "오류입니다." });
    }
  );
  //console.log(req.query);
  //res.send('dddd');
});

function memberInsert(req, res, next) {
  var param = {
    hp: req.body.hp,
    name: req.body.name,
    media: "C",
    path: "G",
    status: "A",
  };

  dbQuery("member", { hp: req.body.hp, path: param.path }).then(
    function (results) {
      if (results.length == 0) {
        pool.getConnection(function (err, connection) {
          if (err) {
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            dbInsert(connection, "member", param).then(
              function (results) {
                var token = jwt.sign(
                  {
                    memberSq: results,
                    hp: param.hp,
                    name: param.name,
                    media: param.media,
                  },
                  config.secret,
                  {
                    //expiresInMinutes: 1440 // 분 expires in 24 hours
                  }
                );

                res.json({
                  message: "enjoy!",
                  api_key: token,
                  memberSq: results,
                });

                connection.release();
              },
              function (err) {
                connection.release();
                res.status(500).json({ code: 10, type: "error", message: err });
              }
            );
          }
        });
      } else {
        var token = jwt.sign(
          {
            memberSq: results[0].memberSq,
            hp: param.hp,
            name: results[0].name,
            media: results[0].media,
          },
          config.secret,
          {
            //expiresInMinutes: 1440 // 분 expires in 24 hours
          }
        );

        res.json({
          message: "enjoy!",
          api_key: token,
          memberSq: results[0].memberSq,
        });
      }
    },
    function (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
      //connection.release();
    }
  );
}

//okbox에서 ㅂ
router.post("/Member", ensureAuthorized, memberInsert);

function memberJoin(req, res, next) {
  var param = {
    name: req.body.name,
    hp: req.body.hp,
    media: req.body.media,
    regId: req.body.regId,
    path: req.body.path,
  };

  //console.log(param);
  pool.getConnection(function (err, connection) {
    if (err) {
      //res.status(500).json({"code":10,"type":"error","message":err});
      throw err;
    } else {
      connection.query(
        "select * from member where regId=?",
        [param.regId],
        function (err, results1) {
          if (err) {
            //console.log(err);
            //res.status(500).json({"code":10,"type":"error","message":err});
            connection.release();
            throw err;
          } else {
            if (results1.length == 0) {
              connection.query(
                "INSERT INTO member set hp=?,name=?, regId=?,media=?,path=?",
                [param.hp, param.name, param.regId, param.media, param.path],
                function (err, results) {
                  if (err) {
                    connection.release();
                    throw err;
                  } else {
                    //resolve({memberSq:results.insertId,memberType:'A',media:'A'});
                    //var rs = result[0];
                    var token = jwt.sign(
                      {
                        memberSq: results.insertId,
                        hp: param.hp,
                        name: param.name,
                        media: param.media,
                      },
                      config.secret,
                      {
                        //expiresInMinutes: 1440 // 분 expires in 24 hours
                      }
                    );

                    // return the information including token as JSON
                    res.json({
                      message: "enjoy!",
                      memberSq: results.insertId,
                      api_key: token,
                    });
                  }
                  connection.release();
                  //console.log('scccc');
                }
              );
            } else {
              connection.query(
                "update  member set hp=?,name=?, media=?,path=? where regId=?",
                [param.hp, param.name, param.media, param.path, param.regId],
                function (err, results) {
                  if (err) {
                    connection.release();
                    throw err;
                  }
                  //resolve({memberSq:results.insertId,memberType:'A',media:'A'});
                  //var rs = result[0];
                  var token = jwt.sign(
                    {
                      memberSq: results1[0].memberSq,
                      hp: param.hp,
                      name: param.name,
                      media: param.media,
                    },
                    config.secret,
                    {
                      //expiresInMinutes: 1440 // 분 expires in 24 hours
                    }
                  );

                  // return the information including token as JSON
                  res.json({
                    message: "enjoy2!",
                    memberSq: results1[0].memberSq,
                    api_key: token,
                  });

                  connection.release();
                  //console.log('scccc');
                }
              );
            }
          }
        }
      );
    }
  });
}
router.post("/Join", memberJoin);

function shopLogin(req, res, next) {
  var pass = req.body.password;
  //var salt = Math.round((new Date().valueOf() * Math.random())) + "";

  //console.log(!req.body.userId )
  //console.log(!req.body.password);
  if (!req.body.shopId || !req.body.password) {
    res
      .status(400)
      .json({ code: 400, type: "error", message: "파라미터 오류입니다." });
    return;
  }

  console.log(req.body);
  pool.getConnection(function (err, connection) {
    connection.query(
      "select * FROM shop where shopId=? and kind=?",
      [req.body.shopId, req.body.kind],
      function (err, rows) {
        if (err) {
          throw err;
        }
        if (rows.length == 0) {
          res.status(404).json({
            code: 1000,
            type: "error",
            message: "아이디가 존재하지 않습니다.",
          });
        } else {
          var u = rows[0];

          if (u.status == "B") {
            res.status(401).json({
              code: 1001,
              type: "error",
              message: "중지중인 아이디입니다.",
            });
            connection.release();
          } else {
            if (u.passwd == req.body.password) {
              var token = jwt.sign(
                { memberSq: -1, memberType: "Z", shopSq: u.shopSq },
                config.secret,
                {
                  //expiresInMinutes: 1440 // 분 expires in 24 hours
                }
              );

              res.json({
                message: "enjoy!",
                api_key: token,
                memberSq: -1,
                hp: u.hp,
                name: u.companyName,
                kind: u.kind,
                shopSq: u.shopSq,
              });

              if (u.regId != req.body.regId) {
                Promise.all([
                  dbUpdate(
                    connection,
                    "shop",
                    { regId: req.body.regId },
                    {
                      shopSq: u.shopSq,
                    }
                  ),
                ]).then(
                  function (res2) {
                    //res.json({success:true});
                    connection.release();
                  },
                  function (err) {
                    console.log(err);
                    res
                      .status(500)
                      .json({ code: 10, type: "error", message: err });
                    connection.release();
                    //throw err;
                  }
                );
              } else {
                connection.release();
              }
            } else {
              res.status(405).json({
                code: 1001,
                type: "error",
                message: "중지중인 아이디입니다.",
              });
            }
          }
        }
      }
    );
  });
}
router.post("/ShopLogin", shopLogin);

function authenticate(req, res, next) {
  var pass = req.body.password;
  //var salt = Math.round((new Date().valueOf() * Math.random())) + "";

  //console.log(!req.body.userId )
  //console.log(!req.body.password);
  if (!req.body.media || !req.body.userId) {
    res
      .status(400)
      .json({ code: 400, type: "error", message: "파라미터 오류입니다." });
    return;
  }

  pool.getConnection(function (err, connection) {
    connection.query(
      "select * FROM member where userId=? and media=?",
      [req.body.userId, req.body.media],
      function (err, rows) {
        if (err) {
          res
            .status(500)
            .json({ code: 10, type: "error", message: "내부에러입니다." });
        } else {
          if (rows.length == 0) {
            res.status(404).json({
              code: 1000,
              type: "error",
              message: "아이디가 존재하지 않습니다.",
            });
          } else {
            var u = rows[0];

            if (u.status == "B") {
              res.status(401).json({
                code: 1001,
                type: "error",
                message: "중지중인 아이디입니다.",
              });
            } else {
              var token = jwt.sign(
                {
                  memberSq: u.memberSq,
                  memberType: u.memberType,
                  shopSq: u.shopSq,
                  companyName: u.companyName,
                },
                config.secret,
                {
                  //expiresInMinutes: 1440 // 분 expires in 24 hours
                }
              );

              // return the information including token as JSON
              res.json({
                message: "enjoy!",
                api_key: token,
              });
            }
          }
        }
        connection.release();

        // Don't use the connection here, it has been returned to the pool.
      }
    );
    //res.status(500).json({type:'error',code:500,message:err});
    //connection.release();
  });
}
router.post("/authenticate", authenticate);

function auth(req, res, next) {
  var pass = req.body.password;
  //var salt = Math.round((new Date().valueOf() * Math.random())) + "";

  //console.log(!req.body.userId )
  //console.log(!req.body.password);
  console.log(req.body);
  if (!req.body.media || !req.body.hp || !req.body.name || !req.body.memberSq) {
    res
      .status(400)
      .json({ code: 400, type: "error", message: "파라미터 오류입니다." });
    return;
  }

  pool.getConnection(function (err, connection) {
    connection.query(
      "select * FROM member where memberSq=? and name=? and hp=? and media=?",
      [req.body.memberSq, req.body.name, req.body.hp, req.body.media],
      function (err, rows) {
        if (err) {
          res
            .status(500)
            .json({ code: 10, type: "error", message: "내부에러입니다." });
        } else {
          if (rows.length == 0) {
            res.status(404).json({
              code: 404,
              type: "error",
              message: "아이디가 존재하지 않습니다.",
            });
          } else {
            var u = rows[0];
            var token = jwt.sign(
              {
                memberSq: u.memberSq,
                hp: u.hp,
                name: u.name,
                media: u.media,
                shopSq: u.shopSq,
              },
              config.secret,
              {
                //expiresInMinutes: 1440 // 분 expires in 24 hours
              }
            );
            // return the information including token as JSON
            res.json({
              message: "enjoy!",
              api_key: token,
            });
          }
        }
        connection.release();

        // Don't use the connection here, it has been returned to the pool.
      }
    );
    //res.status(500).json({type:'error',code:500,message:err});
    //connection.release();
  });
}
router.post("/auth", auth);

function dbQuery1(sql) {
  console.log(sql);
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      var query = connection.query(sql, [], function (err, rows) {
        if (err) {
          //console.log(9999);
          console.log(err);
          reject(err);
        } else {
          console.log(rows);
          resolve(rows);
        }
        connection.release();
      });
    });
  });
}

function dbQuery(tableName, where) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      var wherestr = "";
      var keys = Object.keys(where);

      for (var i = 0; i < keys.length; i++) {
        wherestr += "`" + keys[i] + "`=" + connection.escape(where[keys[i]]);
        if (i == keys.length - 1) {
        } else {
          wherestr += " and ";
        }
      }

      var query = connection.query(
        "select * from ?? where " + wherestr,
        [tableName],
        function (err, rows) {
          if (err) {
            //console.log(query);
            //console.log(err);
            reject({});
          } else {
            resolve(rows);
          }
          connection.release();
        }
      );
      console.log(query);
    });
  });
}

function dbSelect(tableName, where) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      var query = connection.query(
        "select * from ?? where ?",
        [tableName, where],
        function (err, rows) {
          if (err) {
            //console.log(9999);
            reject(err);
          } else {
            //console.log(rows);
            if (rows.length == 0) {
              resolve(undefined);
            } else {
              resolve(rows[0]);
            }
          }
          connection.release();
        }
      );

      //console.log(query);
    });
  });
}
function shortUrl(linkurl) {
  return new Promise(function (resolve, reject) {
    resolve({});
    /*var api_url = 'https://openapi.naver.com/v1/util/shorturl';
		var request = require('request');
	var options = {
		url: api_url,
		form: {'url':linkurl},
		headers: {'X-Naver-Client-Id':'UuXZUsKuuDYb8aYJRCMs', 'X-Naver-Client-Secret': '69WqxJ1CAh'}
		};
	request.post(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
		//res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
		//res.end(body);
			resolve(JSON.parse(body).result);
			//console.log(JSON.parse(body).result);
		} else {
		//res.status(response.statusCode).end();
		//console.log('error = ' + response.statusCode);
			reject(error);
		}
	});*/
  });
}

/*


http.get('http://www.google.com/index.html', (res) => {
  console.log(`Got response: ${res.statusCode}`);
  // consume response body
  res.resume();
}).on('error', (e) => {
  console.log(`Got error: ${e.message}`);
});
*/

function getCodeTbl(gCode, key) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      connection.query(
        "select * from codeTbl where status='A' and gCode=? and `key`=?",
        [gCode, key],
        function (err, rows) {
          if (err) {
            reject({});
          } else {
            if (rows.length == 0) {
              reject(err);
            } else {
              resolve(rows[0]);
            }
          }
          connection.release();
        }
      );
    });
  });
}
function dbUpdate(connection, table, data, where) {
  //console.log(table,data,where);
  return new Promise(function (resolve, reject) {
    if (data == null || Object.keys(data).length == 0) {
      var query = connection.query(table, function (err, results, fields) {
        //console.log(data)
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(results.changedRows);
        }
      });
    } else {
      var wherestr = "";
      var keys = Object.keys(where);

      for (var i = 0; i < keys.length; i++) {
        wherestr += "`" + keys[i] + "`=" + connection.escape(where[keys[i]]);
        if (i == keys.length - 1) {
        } else {
          wherestr += " and ";
        }
      }
      //console.log(wherestr);
      /*keys.forEach(function(key,value) {
				if(keys.length>1)
				wherestr+='`'+key+'`='+connection.escape(where[key]);
				/*if (isNaN(i)) {
					//console.log('This is not number');
					var val = where[key];
				}else{
					
				}*/

      //});
      var query = connection.query(
        "UPDATE ?? set ? where " + wherestr,
        [table, data],
        function (err, results) {
          //console.log(data)
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(results.changedRows);
          }
        }
      );
    }
    //console.log(query);
  });
}

function dbInsert(connection, table, data) {
  return new Promise(function (resolve, reject) {
    var query = connection.query(
      "INSERT INTO ?? set ?",
      [table, data],
      function (err, results) {
        //console.log(data)
        if (err) {
          //console.log(err);
          reject(err);
        } else {
          resolve(results.insertId);
        }
      }
    );
    //console.log(query);
  });
}
function smsInsert(connection, data) {
  return new Promise(function (resolve, reject) {
    connection.query(
      "INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",
      data,
      function (err, results) {
        //connection.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(3),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?", data, function(err,results) {
        //console.log(data)
        if (err) {
          //console.log(err);
          reject(err);
        } else {
          resolve(results.insertId);
        }
      }
    );
  });
}

function lockerUpdate(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      //res.status(500).json({"code":10,"type":"error","message":err});
      //connection.release();
      throw err;
    } else {
      var jobs = [];
      for (var i = 0; i < req.body.length; i++) {
        var item = req.body[i];
        var param = {
          status: item.status,
          width: item.width,
          height: item.height,
          depth: item.depth,
          saveHp: item.saveHp,
          saveName: item.saveName,
          saveDate: item.saveDate,
          pwd: item.pwd,
          toHp: item.toHp,
          toName: item.toName,
          usage: item.usage,
          thingsSq: item.thingsSq,
          uuid: item.uuid,
          toDong: item.toDong,
          toHo: item.toHo,
        };
        jobs.push(
          dbUpdate(connection, "locker", param, {
            yid: item.yid,
            jumper: item.jumper,
            serial: item.serial,
          })
        );
      }
      Promise.all(jobs).then(
        function (res2) {
          res.json({ success: true });
          connection.release();
        },
        function (err) {
          //
          connection.release();
          res.status(500).json({ code: 10, type: "error", message: err });
        }
      );
    }
  });
  //},function(err){
  //	console.log(err);
  //});
}
router.put("/Locker", ensureAuthorized, lockerUpdate);

function orderSelect(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var query = connection.query(
        "SELECT * FROM `order` WHERE orderCd = ?",
        [req.params.orderCd],
        function (err, results) {
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
            connection.release();
          } else {
            if (results.length == 0) {
              res.status(404).json({ type: "error", message: "", code: 404 });
              //next(new Error('한글'));
            } else {
              one = results[0];
              one.products = JSON.parse(one.products);
              one.addr = JSON.parse(one.addr);
              one.locker = JSON.parse(one.locker);
              res.json(one);
            }
          }

          connection.release();
        }
      );
    }
  });
}
router.get("/Order/:orderCd", ensureAuthorized, orderSelect);

function mxSelect(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var query = connection.query(
        "SELECT * FROM `mx` WHERE P_TID = ?",
        [req.params.P_TID],
        function (err, results) {
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
            connection.release();
          } else {
            if (results.length == 0) {
              res.status(404).json({ type: "error", message: "", code: 404 });
              //next(new Error('한글'));
            } else {
              one = results[0];
              //one.products = JSON.parse(one.products);
              //one.addr = JSON.parse(one.addr);
              //one.locker = JSON.parse(one.locker);
              res.json(one);
            }
          }

          connection.release();
        }
      );
    }
  });
}
router.get("/Mx/:P_TID", mxSelect);

function thingsSelect(req, res, next) {
  var jobs = [
    dbSelect("things", { thingsSq: req.params.thingsSq }),
    dbQuery("laundry", { thingsSq: req.params.thingsSq }),
  ];
  Promise.all(jobs).then(
    function (results) {
      var one = results[0];
      //console.log(results);

      try {
        one.locker = JSON.parse(one.locker);
        one.things = JSON.parse(one.things);
        one.saveLocker = JSON.parse(one.saveLocker);

        var rs = [];
        _.each(results[1], function (it) {
          it.photos = JSON.parse(it.photos);

          rs.push(it);
        });
        if (one.prices) {
          /*one.prices = JSON.parse(one.prices);
						if(one.prices.length==0){
							
							one.prices = results[1];
						}*/
          one.prices = rs;
        } else {
          one.prices = rs;
        }
        one.photos = JSON.parse(one.photos);

        res.json(one);
      } catch (X) {
        //console.log(X);
        res.status(500).json({ code: 10, type: "error", message: X });
      }
    },
    function (err) {
      console.log(err);
      res.status(404).json({ code: 10, type: "error", message: err });
    }
  );

  /*
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM things WHERE thingsSq = ?', [req.params.thingsSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
		        	 if(results.length==0){
						 res.status(404).json({type:'error',message:'',code:404});
					 }else{
						one = results[0];
						//one.products = JSON.parse(one.products);
						//one.addr = JSON.parse(one.addr);
						
							one.things = JSON.parse(one.things);
							one.locker = JSON.parse(one.locker);
							one.prices = JSON.parse(one.prices);
							one.photos = JSON.parse(one.photos);
							one.saveLocker = JSON.parse(one.saveLocker);
						
						res.json(one);
						console.log(one);
					 }
		            
		         }
				 connection.release();
			});
		}
	});

	*/
}
router.get("/Things/:thingsSq", ensureAuthorized, thingsSelect);

function sendPushTablet(target, data) {
  var apiKey =
    "AAAAGV33Ils:APA91bG4nuYybd-KAY32VNwh8BBi6-076FX-xhhjW9R3A3gPX0HvFjB_pZgGP2mOa0Dx4RfNia_yM6Dg77KNLgX-kGys2liCWZ9ZmZr70VxP6avhK0lyx-licw_9ZFJj1yssooXYNFx6";

  var fcm = new FCM(apiKey);

  var message = {
    //registration_id:'f-5uTQ9snO0:APA91bGHsmsqVnVC49jtuU84kQoDFOebGW4IYgWFKnUOQbHvQR_HLXTozeLOlKqZqgOTfZeNT8VTo_lbYpjwINPEzjTwWwq1fZ2cL8LBxwoLWwzmCiM3iwXaBTjNYu6uuj4_OxGFL78q',
    registration_id: target,
    // apple
    collapse_key: "Collapse key",
    data: JSON.stringify(data),
  };
  fcm.send(message, function (err, messageId) {
    if (err) {
      console.log(err);
    } else {
      console.log("Sent with message ID: ", messageId);
    }
  });
}

// locker & orderTemp
function openToParcel(req, res, next) {
  // 선불 후불
  if (req.body.payType == "A") {
    // 선불
    /*
		
		1. 문열기 (locker.usage='B', thingsSq=orderCd) 문을 닫게 되면 usage =='B' order.status='B' 로변경 
		2. 문안려리면 클라이언트에서 결제 취소함 
		*/
  } else {
    //후불
    /*
		
		1. order 입력 (status='A',payType='B')
		2. 문열기 (locker.usage='B', thingsSq=orderCd) 문을 닫게 되면 usage =='B' order.status='B' 로변경 
		3. 문안려려지면 무시
		
		*/
  }
  var param = {
    products: req.body.products, // 주문상품
    reqItem: req.body.reqItem, //요청내용
    status: req.body.status, //배달준비중\n대발중\n배달완료\n주문취소\n환불
    totalPrice: req.body.status, //총판매가격
    description: req.body.description, //비고
    title: req.body.title, //제목(자동생성)
    addr: JSON.stringify(req.body.addr), //주소
    shopSq: req.body.shopSq, //상점아이디
    memberSq: req.decoded.memberSq, //사용자아이디
    pgCode: req.body.pgCode, //피지코드
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      //connection.release();
      throw err;
    } else {
      var query = connection.query(
        "select * from product where productSq in(?)",
        [req.body.productSqs],
        function (err, results) {
          if (err) {
            console.log(err);
            res.status(500).json({ code: 10, type: "error", message: err });
            connection.release();
          } else {
            param.products = JSON.stringify(results);
            dbInsert(connection, "order", param).then(
              function (rr) {
                res.json({ insertId: rr });
                connection.release();
              },
              function (err) {
                connection.release();
                res.status(500).json({ code: 10, type: "error", message: err });
              }
            );
          }
        }
      );
    }
  });
}
//router.post('/Locker/OpenToParcel', ensureAuthorized,openToParcel);
// 저장을 하면 패스워드를 4 자리수를 만들어랜다.
function openToSave(req, res, next) {
  //console.log(req.body);
  //console.log(req.decoded);
  //var authNum = randomString(4,'N');
  var param = {
    //yid:req.body.yid,
    status: req.body.status,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    pwd: req.body.pwd,
    toName: req.body.toName,
    toHp: req.body.toHp,
    saveDate: req.body.saveDate,
    usage: req.body.usage,
    thingsSq: req.body.thingsSq,
    uuid: req.body.uuid,
  };
  var param1 = {
    yid: req.body.yid,
    col: req.body.col,
    row: req.body.row,
    label: req.body.label,
    jumper: req.body.jumper,
    serial: req.body.serial,
    pwd: req.body.pwd,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    saveDate: req.body.saveDate,
    toName: req.body.toName,
    toHp: req.body.toHp,
    memberSq: req.decoded.memberSq,
    boxName: req.body.boxName,
    regDate: new Date(),
    usage: req.body.usage,
    thingsSq: req.body.thingsSq,
    uuid: req.body.uuid,
    toDong: req.body.toDong,
    toHo: req.body.toHo,
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      //res.status(500).json({"code":10,"type":"error","message":err});
      connection.release();
      throw err;
    } else {
      //Promise.all([dbSelect('shop',{shopSq:1})]).then(function(res1){
      connection.beginTransaction(function (err) {
        //console.log(2);
        if (err) {
          connection.release();
          //res.status(500).json({type:'error',message:err,code:500});
          throw err;
        }

        //console.log(1);
        var jobs = [
          dbUpdate(connection, "locker", param, {
            yid: req.body.yid,
            jumper: req.body.jumper,
            serial: req.body.serial,
          }),
          dbInsert(connection, "saveLog", param1),
        ];
        /*
					var things = req.body.things;
					if (things){
						things.status = 'A';
						things.kind='A'; //세탁
						things.yid=req.body.yid;
						things.jumper=req.body.jumper;
						things.serial=req.body.serial;
						things['shopSq']=1;
						things.toHp='0000000000';
						things.saveHp=req.decoded.hp;
						things.things = JSON.stringify(things.things);
						jobs.push(dbInsert(connection,'things',things));
					}*/
        saveAction(req, res, connection, jobs, param);
      });
    }
  });
}
function saveAction(req, res, connection, jobs, param) {
  Promise.all(jobs).then(
    function (res1) {
      connection.commit(function (err) {
        if (err) {
          res.status(500).json({ type: "error", message: err, code: 500 });
          connection.rollback(function () {
            //throw err;
          });
        } else {
          res.json({ yid: req.body.yid });
        }
        connection.release();
      });
    },
    function (err) {
      //console.log(err);
      connection.rollback(function () {
        //throw err;
      });
      connection.release();
      res.status(500).json({ type: "error", message: err, code: 500 });
    }
  );
}
router.post("/Locker/open_to_save", ensureAuthorized, openToSave);

function openToSaveServer(req, res, next) {
  //console.log(req.body);
  //console.log(req.decoded);
  //var authNum = randomString(4,'N');
  var param = {
    //yid:req.body.yid,
    status: req.body.status,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    pwd: req.body.pwd,
    toName: req.body.toName,
    toHp: req.body.toHp,
    saveDate: req.body.saveDate,
    usage: req.body.usage,
    thingsSq: req.body.thingsSq,
    uuid: req.body.uuid,
  };
  var param1 = {
    yid: req.body.yid,
    col: req.body.col,
    row: req.body.row,
    label: req.body.label,
    jumper: req.body.jumper,
    serial: req.body.serial,
    pwd: req.body.pwd,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    saveDate: req.body.saveDate,
    toName: req.body.toName,
    toHp: req.body.toHp,
    memberSq: req.decoded.memberSq,
    boxName: req.body.boxName,
    regDate: new Date(),
    usage: req.body.usage,
    thingsSq: req.body.thingsSq,
    uuid: req.body.uuid,
    toDong: req.body.toDong,
    toHo: req.body.toHo,
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      //res.status(500).json({"code":10,"type":"error","message":err});
      connection.release();
      throw err;
    } else {
      //Promise.all([dbSelect('shop',{shopSq:1})]).then(function(res1){
      connection.beginTransaction(function (err) {
        //console.log(2);
        if (err) {
          connection.release();
          //res.status(500).json({type:'error',message:err,code:500});
          throw err;
        }

        //console.log(1);
        var jobs = [
          dbUpdate(connection, "locker", param, {
            yid: req.body.yid,
            jumper: req.body.jumper,
            serial: req.body.serial,
          }),
          dbInsert(connection, "saveLog", param1),
        ];
        /*
					var things = req.body.things;
					if (things){
						things.status = 'A';
						things.kind='A'; //세탁
						things.yid=req.body.yid;
						things.jumper=req.body.jumper;
						things.serial=req.body.serial;
						things['shopSq']=1;
						things.toHp='0000000000';
						things.saveHp=req.decoded.hp;
						things.things = JSON.stringify(things.things);
						jobs.push(dbInsert(connection,'things',things));
					}*/
        saveActionServer(req, res, connection, jobs, param);
      });
    }
  });
}
function saveActionServer(req, res, connection, jobs, param) {
  Promise.all(jobs).then(
    function (res1) {
      connection.commit(function (err) {
        if (err) {
          res.status(500).json({ type: "error", message: err, code: 500 });
          connection.rollback(function () {
            //throw err;
          });
        } else {
          res.json({ yid: req.body.yid });
        }
        connection.release();
      });
    },
    function (err) {
      //console.log(err);
      connection.rollback(function () {
        //throw err;
      });
      connection.release();
      res.status(500).json({ type: "error", message: err, code: 500 });
    }
  );
}
router.post("/Server/open_to_save", ensureAuthorized, openToSaveServer);

function closeToSaveOrder(req, res, next) {
  //
  //var jobs = [dbSelect('shop',{shopSq:req.body.shopSq})];
  pool.getConnection(function (err, connection) {
    if (err) {
      // 실패로그 기록
      //connection.release();
      console.log(err);
      throw err;
    }
    var jobs = [
      dbUpdate(
        connection,
        "locker",
        {
          status: "A", // 보관중
          saveHp: req.body.saveHp,
          saveName: req.body.saveName,
          saveDate: req.body.saveDate,
          toHp: req.body.toHp,
          toName: req.body.toName,
          pwd: req.body.pwd,
          uuid: req.body.uuid,
        },
        {
          yid: req.body.yid,
          jumper: req.body.jumper,
          serial: req.body.serial,
        }
      ),
      dbInsert(connection, "saveLog", {
        yid: req.body.yid,
        col: req.body.col,
        row: req.body.row,
        label: req.body.label,
        jumper: req.body.jumper,
        serial: req.body.serial,
        pwd: req.body.pwd,
        saveHp: req.body.saveHp,
        saveName: req.body.saveName,
        saveDate: req.body.saveDate,
        toName: req.body.toName,
        toHp: req.body.toHp,
        memberSq: req.decoded.memberSq,
        boxName: req.body.boxName,
        regDate: new Date(),
        usage: req.body.usage,
        thingsSq: req.body.thingsSq,
        uuid: req.body.uuid,
        toDong: req.body.toDong,
        toHo: req.body.toHo,
      }),
    ];

    if (req.body.usage == "B") {
      // 택배보내기
      jobs.push(
        dbUpdate(
          connection,
          "things",
          {
            status: "C",
            //shippingDate:new Date(),
            locker: JSON.stringify({
              yid: req.body.yid,
              jumper: req.body.jumper,
              serial: req.body.serial,
              status: "A",
              saveHp: req.body.saveHp,
              saveName: req.body.saveName,
              saveDate: req.body.saveDate,
              toHp: req.body.toHp,
              toName: req.body.toName,
              boxName: req.body.boxName,
              pwd: req.body.pwd,
              label: req.body.label,
              uuid: req.body.uuid,
            }),
          },
          {
            thingsSq: req.body.thingsSq,
          }
        )
      );
    } else if (req.body.usage == "C") {
      // 고객이 세탁물 보관 앱으로 이미 things입력됩
      jobs.push(
        dbUpdate(
          connection,
          "things",
          {
            status: "B",
            //shippingDate:new Date(),
            locker: JSON.stringify({
              yid: req.body.yid,
              jumper: req.body.jumper,
              serial: req.body.serial,
              status: "A",
              saveHp: req.body.saveHp,
              saveName: req.body.saveName,
              saveDate: req.body.saveDate,
              toHp: req.body.toHp,
              toName: req.body.toName,
              boxName: req.body.boxName,
              pwd: req.body.pwd,
              label: req.body.label,
              uuid: req.body.uuid,
            }),
          },
          {
            thingsSq: req.body.thingsSq,
          }
        )
      );
    }
    if (req.body.pincodeSq) {
      jobs.push(
        dbUpdate(
          connection,
          "pincode",
          {
            valid: req.body.pincodeSq,
          },
          { pincodeSq: req.body.pincodeSq }
        )
      );
    }

    //console.log('bbb');
    Promise.all(jobs).then(
      function (res2) {
        //console.log('bbb1111');
        var saveHp = req.body.saveHp;
        var uuid = req.body.uuid;
        res.json({ success: true });

        //if(req.query.yid) wsql+=' and shopSq in(select '+req.query.yid[1]+' from buyer where buyerSq in (select buyerSq from applebox where yid='+req.query.yid[0]+'))';
        connection.release();
        //if (req.body.usage!='F') {
        //택배보내기(B), 세탁-앱(C) ,세탁보관-키오스크(H) , 수리수선(I)
        sendFcmMessageShop(req.body.usage, req.body);
        //}

        if (req.body.usage == "H" || req.body.usage == "I") {
          // 키오스크, 수선
          console.log("writeThings");
          writeThings(req.body);

          if (req.body.yid == 11042) {
            sendLaundrySms(saveHp, uuid);
          }
        }
        if (req.body.usage == "A" && req.body.yid == 11042) {
          //세탁소 사장이 보관했을경우
          sendLaundryHostSaveSms(req.body.toHp, uuid, req.body.pwd);
        }
      },
      function (err) {
        connection.release();
        //throw err;
        console.log(err);
        res.status(500).json({ type: "error", message: err, code: 500 });
      }
    );
  });
}
function sendLaundryUser(toHp, uuid) {
  pool.getConnection(function (err, connection) {
    if (err) {
      // 실패로그 기록
      //connection.release();
      //throw err;
    } else {
      var smsData = {
        dest_phone: toHp,
        send_phone: "02-388-9274",
        msg_body:
          "고객님께서 맡기신 세탁물이 정상 접수되었습니다.세탁아재요(문의:388-9274)",
        uuid: uuid,
      };
      connection.query(
        "INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",
        smsData,
        function (err, results) {
          //connection.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(3),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?", smsData, function(err,results) {
          //console.log(data)

          if (err) {
            connection.release();
            //throw err;
          } else {
            //req.session.authNum= authNum;
            //req.session.cookie.maxAge = 60;
            //res.json({authNum:authNum});
          }
          connection.release();
        }
      );
    }
  });
}
function sendLaundryHostSaveSms(toHP, uuid, pwd) {
  pool.getConnection(function (err, connection) {
    if (err) {
      // 실패로그 기록
      //connection.release();
      //throw err;
    } else {
      var smsData = {
        dest_phone: toHp,
        send_phone: "02-388-9274",
        msg_body: "세탁물을 보관함에 보관하였습니다. 패스워드:" + pwd,
        uuid: uuid,
      };
      connection.query(
        "INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",
        smsData,
        function (err, results) {
          //connection.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", smsData, function(err,results) {
          //console.log(data)

          if (err) {
            connection.release();
            //throw err;
          } else {
            //req.session.authNum= authNum;
            //req.session.cookie.maxAge = 60;
            //res.json({authNum:authNum});
          }
          connection.release();
        }
      );
    }
  });
}
function sendLaundrySms(saveHp, uuid) {
  pool.getConnection(function (err, connection) {
    if (err) {
      // 실패로그 기록
      //connection.release();
      //throw err;
    } else {
      var smsData = {
        dest_phone: "01028059274",
        send_phone: "02-388-9274",
        msg_body: saveHp + "님이 보관함에 세탁물을 보관하였습니다.",
        uuid: uuid,
      };
      connection.query(
        "INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",
        smsData,
        function (err, results) {
          //connection.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", smsData, function(err,results) {
          //console.log(data)

          if (err) {
            connection.release();
            //throw err;
          } else {
            //req.session.authNum= authNum;
            //req.session.cookie.maxAge = 60;
            //res.json({authNum:authNum});
          }
          connection.release();
        }
      );
    }
  });
}

// 보관함에서 물건을 찾아갈때 tmshdnxmfl
function sendFcmMessageThings(thingsSq, param) {
  var fcmData = {
    priority: "high",
    //to:toId,
    /*notification:{
				body: '보관함에서 물건을 찾아갔습니다.', 
				title: '위키박스',
				sound:'default'
			},*/
    data: {
      command: "OPEN_TO_TAKE",
      //data:JSON.stringify(param),
      //pushId:param.uuid
    },
    content_available: true,
  };
  var query =
    'select  B.regId from things A , member B where A.memberSq=B.memberSq and A.thingsSq="' +
    thingsSq +
    '"';

  pool.getConnection(function (err, connection) {
    if (err) {
      // 실패로그 기록
      //connection.release();
      //throw err;
    } else {
      connection.query(query, [], function (err, results) {
        if (err) {
          connection.release();
          //throw err;
        } else {
          param.thingsSq = thingsSq;
          _.each(results, function (one) {
            if (one.regId) {
              fcmData.to = one.regId;
              fcmData.data = param;
              sendFcmMessage(fcmData);
            }
          });
          connection.release();
        }
      });
    }
  });
}
function sendFcmMessageShop(usage, param) {
  var fcmData = {
    //to:toId,
    /*notification:{
				body: param.boxName+' 보관함에 물건이 보관되었습니다', 
				title: '위키박스',
				sound:'default'
			},*/
    priority: "high",
    data: {
      command: "CLOSE_TO_SAVE",
      data: JSON.stringify(param),
      pushId: param.uuid,
    },
    content_available: true,
  };
  var query = "";
  if (param.shopSq) {
    query = "select * from shop where shopSq=" + param.shopSq;
  } else {
    if (usage == "B") {
      //고객 택배 보관
      query =
        "select * from shop where shopSq in(select parcelSq from buyer where buyerSq in (select buyerSq from applebox where yid=" +
        param.yid +
        "))";
    } else if (usage == "C" || usage == "H") {
      // 고객 세탁보관
      query =
        "select * from shop where shopSq in(select laundrySq from buyer where buyerSq in (select buyerSq from applebox where yid=" +
        param.yid +
        "))";
    }
  }
  if (query == "") {
    console.log("상점 데이타가 없습니다.");
    return;
  }
  pool.getConnection(function (err, connection) {
    if (err) {
      // 실패로그 기록
      //connection.release();
      //throw err;
    } else {
      connection.query(query, [], function (err, results) {
        if (err) {
          connection.release();
          //throw err;
        } else {
          if (results.length > 0) {
            var shop = results[0];
            if (shop.regId) {
              fcmData.to = shop.regId;
              sendFcmMessage(fcmData);
            }

            if (shop.sms == "Y") {
              var format = require("string-template");

              var smsData = {
                dest_phone: shop.hp,
                send_phone: config.feedbackPhone,
                msg_body: format(shop.smsTemplate, {
                  saveHp: param.saveHp,
                  boxName: param.boxName,
                  pwd: param.pwd,
                }),
                uuid: param.uuid,
              };
              smsInsert(connection, smsData).then(
                function (res) {
                  connection.release();
                },
                function (err) {
                  console.log(err);
                  connection.release();
                }
              );
            } else {
              connection.release();
            }
          } else {
            connection.release();
          }
        }
      });
    }
  });
}
function closeToSave(req, res, next) {
  var param = req.body;
  // usage=='A';
  //console.log(req.body);
  // 택배보내기 세탁-고객(앱), 기부보관  ,세탁보관 (키오스크), 수선
  if (
    param.usage == "B" ||
    param.usage == "C" ||
    param.usage == "G" ||
    param.usage == "H" ||
    param.usage == "I"
  ) {
    closeToSaveOrder(req, res, next);

    return;
  } else if (param.usage == "XX") {
    // 개인물품 보관
    pool.getConnection(function (err, connection) {
      if (err) {
        // 실패로그 기록

        connection.release();
        throw err;
      }
      Promise.all([
        dbUpdate(
          connection,
          "locker",
          {
            status: "A",
            saveHp: req.body.saveHp,
            saveName: req.body.saveName,
            saveDate: req.body.saveDate,
            toHp: req.body.toHp,
            toName: req.body.toName,
            pwd: req.body.pwd,
          },
          {
            yid: req.body.yid,
            jumper: req.body.jumper,
            serial: req.body.serial,
          }
        ),
      ]).then(
        function (res2) {
          //res.json({});
          //connection.release();
          var fcmData = {
            //to:toId,
            /*notification:{
						body: req.body.boxName+' 보관함에 보관되었습니다. 비빌번호는 '+req.body.pwd+ ' 입니다. 택배기사에게 비빌번호를 알려주면 반품이 됩니다.', 
						title: '위키박스-반품',
						sound:'default'
					},*/
            priority: "high",
            data: {
              command: "CLOSE_TO_SAVE",
              data: JSON.stringify(param),
              //pushId:param.uuid
            },
            content_available: true,
          };
          sendFcmHp(connection, fcmData, req.body.saveHp, res);
        },
        function (err) {
          console.log(err);
          res.status(500).json({ code: 10, type: "error", message: err });
          connection.release();
          //throw err;
        }
      );
    });
  } else {
    // 일반택배(A) 세탁소 보관(D), 개인물품보관(F)
    var crypt = require("../common/crypto");
    var jobs = [
      getCodeTbl("template", "B"),
      dbQuery1(
        "SELECT * FROM member WHERE hp='" +
          req.body.toHp +
          "' order by joinDate desc limit 1"
      ),
      shortUrl(
        "http://o2obox.kr/parcel/index.php?hp=" +
          encodeURIComponent(crypt.encrypt(req.body.toHp)) +
          "&saveDate=" +
          encodeURIComponent(req.body.saveDate)
      ),
    ];
    Promise.all(jobs).then(
      function (res1) {
        var format = require("string-template");
        //console.log('ssss');
        if (req.body.yid == "11078") {
          res1[0].description = res1[0].description.substring(
            0,
            res1[0].description.indexOf(",상세확인")
          );
        }
        var smsData = {
          dest_phone: req.body.toHp,
          send_phone: config.feedbackPhone,
          msg_body: format(res1[0].description, {
            saveName: req.body.saveName,
            boxName: req.body.boxName + "-" + req.body.label,
            pwd: req.body.pwd,
            url: res1[2].url,
          }),
          uuid: param.uuid,
          ack_yn: "Y",
          ack_hp: req.body.saveHp,
        };
        //(무인택배보관함알림) 패스워드:12345 상세확인 -> goog.com/skjdfljsl

        var toId = null;
        var fcmData = null;

        if (res1[1].length > 0 && res1[1][0].regId) {
          //

          toId = res1[1][0].regId;

          fcmData = {
            to: toId,
            priority: "high",
            /*notification:{
						body: param.boxName+' 보관함에 물건이 보관되었습니다', 
						title: '위키박스-'+(req.body.usage=='D'?'세탁물':''),
						sound:'default'
					},*/
            data: {
              command: "CLOSE_TO_SAVE",
              data: JSON.stringify(param),
              pushId: param.uuid,
            },
            content_available: true,
          };
        } else {
          fcmData = null;
        }

        pool.getConnection(function (err, connection) {
          if (err) {
            // 실패로그 기록

            connection.release();
            throw err;
          } else {
            connection.beginTransaction(function (err) {
              if (err) {
                connection.release();
                throw err;
              }
              jobs = [
                dbUpdate(
                  connection,
                  "locker",
                  {
                    status: "A",
                    saveHp: req.body.saveHp,
                    saveName: req.body.saveName,
                    saveDate: req.body.saveDate,
                    toHp: req.body.toHp,
                    toName: req.body.toName,
                    pwd: req.body.pwd,
                  },
                  {
                    yid: req.body.yid,
                    jumper: req.body.jumper,
                    serial: req.body.serial,
                  }
                ),
              ];
              if (req.body.yid == "11035" || req.body.yid == "11091") {
              } else if (fcmData == null) {
                jobs.push(smsInsert(connection, smsData));
              } else {
                jobs.push(
                  dbInsert(connection, "fcmPush", {
                    pushId: param.uuid,
                    uuid: param.uuid,
                    receiverId: toId,
                    fcmData: JSON.stringify(fcmData),
                    smsData: JSON.stringify(smsData),
                    senderHp: req.body.saveHp,
                    receiverHp: req.body.toHp,
                    senderType: fcmData == null ? "D" : "B",
                    senderDate: fcmData == null ? null : new Date(),
                  })
                );
              }
              if (req.body.usage == "D") {
                //세탁소 보관
                jobs.push(
                  dbUpdate(
                    connection,
                    "things",
                    {
                      status: "H",
                      shippingDate: new Date(),
                      saveLocker: JSON.stringify({
                        yid: req.body.yid,
                        jumper: req.body.jumper,
                        serial: req.body.serial,
                        status: "A",
                        saveHp: req.body.saveHp,
                        saveName: req.body.saveName,
                        saveDate: req.body.saveDate,
                        toHp: req.body.toHp,
                        toName: req.body.toName,
                        boxName: req.body.boxName,
                        pwd: req.body.pwd,
                      }),
                    },
                    {
                      thingsSq: req.body.thingsSq,
                    }
                  )
                );
              }
              Promise.all(jobs).then(
                function (res2) {
                  connection.commit(function (err) {
                    if (err) {
                      //console.log(err);
                      //res.status(500).json({type:'error',message:err,code:500});
                      connection.rollback(function (err) {
                        console.log(err);
                      });
                      connection.release();
                      throw err;
                    } else {
                      res.json({});
                      if (fcmData != null) sendFcmMessage(fcmData);
                      sendCjHelloMessage(
                        req.body.yid,
                        req.body.boxName,
                        req.body.usage,
                        req.body.toHp,
                        req.body.saveHp,
                        req.body.saveName,
                        req.body.saveDate
                      );
                    }
                    connection.release();
                  });
                },
                function (err) {
                  //res.status(500).json({"code":10,"type":"error","message":err});
                  connection.rollback(function (err) {
                    console.log(err);
                  });
                  connection.release();
                  //throw err;
                  res
                    .status(500)
                    .json({ type: "error", message: err, code: 500 });
                }
              );
            });
          }
        });
      },
      function (err) {
        //console.log(err);
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  }
}

router.post("/Locker/close_to_save", ensureAuthorized, closeToSave);
function openToSaveAll(req, res, next) {
  console.log(req.body);

  var param1 = {
    yid: req.body.yid,
    col: req.body.col,
    row: req.body.row,
    label: req.body.label,
    jumper: req.body.jumper,
    serial: req.body.serial,
    pwd: req.body.pwd,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    saveDate: req.body.saveDate,
    toName: req.body.toName,
    toHp: req.body.toHp,
    memberSq: req.decoded.memberSq,
    boxName: req.body.boxName,
    regDate: new Date(),
    usage: req.body.usage,
    thingsSq: req.body.thingsSq,
    uuid: req.body.uuid,
    toDong: req.body.toDong,
    toHo: req.body.toHo,
  };

  var param = req.body;
  // usage=='A';
  //console.log(req.body);
  //택배보내기(B), 세탁-앱(C) ,세탁보관-키오스크(H) , 수리수선(I)

  //서비스느 여기서 처리
  if (
    param.usage == "B" ||
    param.usage == "C" ||
    param.usage == "H" ||
    param.usage == "I"
  ) {
    //
    closeToSaveOrder(req, res, next);

    return;
  } else if (param.usage == "XX") {
    // 개인물품 보관  안쓰는것
    pool.getConnection(function (err, connection) {
      if (err) {
        // 실패로그 기록

        connection.release();
        throw err;
      }
      Promise.all([
        dbUpdate(
          connection,
          "locker",
          {
            status: "A",
            saveHp: req.body.saveHp,
            saveName: req.body.saveName,
            saveDate: req.body.saveDate,
            toHp: req.body.toHp,
            toName: req.body.toName,
            pwd: req.body.pwd,
            price: req.body.price,
          },
          {
            yid: req.body.yid,
            jumper: req.body.jumper,
            serial: req.body.serial,
          }
        ),
      ]).then(
        function (res2) {
          //res.json({});
          //connection.release();
          var fcmData = {
            //to:toId,
            priority: "high",
            notification: {
              body:
                req.body.boxName +
                " 보관함에 보관되었습니다. 비빌번호는 " +
                req.body.pwd +
                " 입니다. 택배기사에게 비빌번호를 알려주면 반품이 됩니다.",
              title: "위키박스-반품",
              sound: "default",
            },
            data: {
              command: "CLOSE_TO_BACK",
              data: JSON.stringify(param),
              //pushId:param.uuid
            },
            content_available: true,
          };
          sendFcmHp(connection, fcmData, req.body.saveHp, res);
        },
        function (err) {
          console.log(err);
          res.status(500).json({ code: 10, type: "error", message: err });
          connection.release();
          //throw err;
        }
      );
    });
  } else {
    // 일반택배(A) 세탁소 보관(D), 개인물품보관(F)
    var crypt = require("../common/crypto");
    var jobs = [
      getCodeTbl("template", "B"),
      dbQuery1(
        "SELECT * FROM member WHERE hp='" +
          req.body.toHp +
          "' order by joinDate desc limit 1"
      ),
      shortUrl(
        "http://o2obox.kr/parcel/index.php?hp=" +
          encodeURIComponent(crypt.encrypt(req.body.toHp)) +
          "&saveDate=" +
          encodeURIComponent(req.body.saveDate)
      ),
    ];
    Promise.all(jobs).then(
      function (res1) {
        var format = require("string-template");
        //console.log('ssss');

        if (req.body.yid == "11078") {
          res1[0].description = res1[0].description.substring(
            0,
            res1[0].description.indexOf(",상세확인")
          );
        }
        var smsData = {
          dest_phone: req.body.toHp,
          send_phone: config.feedbackPhone,

          msg_body: format(res1[0].description, {
            saveName: req.body.saveName,
            boxName: req.body.boxName + "-" + req.body.label,
            pwd: req.body.pwd,
            url: res1[2].url,
          }),
          uuid: param.uuid,
          ack_yn: param.usage == "F" ? "N" : "Y",
          ack_hp: req.body.saveHp,
        };
        //(무인택배보관함알림) 패스워드:12345 상세확인 -> goog.com/skjdfljsl

        var toId = null;
        var fcmData = null;

        if (res1[1].length > 0 && res1[1][0].regId) {
          //

          toId = res1[1][0].regId;

          fcmData = {
            priority: "high",
            to: toId,
            /*notification:{
						body: param.boxName+' 보관함에 물건이 보관되었습니다', 
						title: '위키박스-'+(req.body.usage=='D'?'세탁물':''),
						sound:'default'
					},*/
            data: {
              command: "CLOSE_TO_SAVE",
              data: JSON.stringify(param),
              pushId: param.uuid,
            },
            content_available: true,
          };
        } else {
          fcmData = null;
        }

        pool.getConnection(function (err, connection) {
          if (err) {
            // 실패로그 기록

            connection.release();
            throw err;
          } else {
            connection.beginTransaction(function (err) {
              if (err) {
                connection.release();
                throw err;
              }
              jobs = [
                dbUpdate(
                  connection,
                  "locker",
                  {
                    status: "A",
                    saveHp: req.body.saveHp,
                    saveName: req.body.saveName,
                    saveDate: req.body.saveDate,
                    toHp: req.body.toHp,
                    toName: req.body.toName,
                    pwd: req.body.pwd,
                    toDong: req.body.toDong,
                    toHo: req.body.toHo,
                    uuid: req.body.uuid,
                    usage: req.body.usage,
                  },
                  {
                    yid: req.body.yid,
                    jumper: req.body.jumper,
                    serial: req.body.serial,
                  }
                ),
                dbInsert(connection, "saveLog", param1),
              ];
              if (fcmData == null) {
                jobs.push(smsInsert(connection, smsData)); // sms를 바로 보내고
              } else {
                // sms 를 나중에 보내라
                jobs.push(
                  dbInsert(connection, "fcmPush", {
                    pushId: param.uuid,
                    uuid: param.uuid,
                    receiverId: toId,
                    fcmData: JSON.stringify(fcmData),
                    smsData: JSON.stringify(smsData),
                    senderHp: req.body.saveHp,
                    receiverHp: req.body.toHp,
                    senderType: fcmData == null ? "D" : "B",
                    senderDate: fcmData == null ? null : new Date(),
                  })
                );
              }
              if (req.body.status == "X") {
                jobs.push(
                  dbUpdate(
                    connection,
                    "locker",
                    {
                      status: req.body.status,
                      saveHp: req.body.saveHp,
                      saveName: req.body.saveName,
                      saveDate: req.body.saveDate,
                      toHp: req.body.toHp,
                      toName: req.body.toName,
                      toDong: req.body.toDong,
                      toHo: req.body.toHo,
                      usage: req.body.usage,
                    },
                    {
                      yid: req.body.yid,
                      jumper: req.body.jumper,
                      serial: req.body.serial + 1,
                    }
                  )
                );
              }
              if (req.body.usage == "D") {
                //세탁소 보관
                jobs.push(
                  dbUpdate(
                    connection,
                    "things",
                    {
                      status: "H",
                      shippingDate: new Date(),
                      saveLocker: JSON.stringify({
                        yid: req.body.yid,
                        jumper: req.body.jumper,
                        serial: req.body.serial,
                        status: "A",
                        saveHp: req.body.saveHp,
                        saveName: req.body.saveName,
                        saveDate: req.body.saveDate,
                        toHp: req.body.toHp,
                        toName: req.body.toName,
                        boxName: req.body.boxName,
                        pwd: req.body.pwd,
                        toDong: req.body.toDong,
                        toHo: req.body.toHo,
                      }),
                    },
                    {
                      thingsSq: req.body.thingsSq,
                    }
                  )
                );
              }
              Promise.all(jobs).then(
                function (res2) {
                  connection.commit(function (err) {
                    if (err) {
                      //console.log(err);
                      //res.status(500).json({type:'error',message:err,code:500});
                      connection.rollback(function (err) {
                        console.log(err);
                      });
                      connection.release();
                      throw err;
                    } else {
                      res.json({});
                      /*sendWallpad(req.body.yid,
										{toDong:req.body.toDong,
										toHo:req.body.toHo},1);*/
                      if (fcmData != null) sendFcmMessage(fcmData);
                      sendCjHelloMessage(
                        req.body.yid,
                        req.body.boxName,
                        req.body.usage,
                        req.body.toHp,
                        req.body.saveHp,
                        req.body.saveName,
                        req.body.saveDate
                      );
                    }
                    connection.release();
                  });
                },
                function (err) {
                  console.log(err);
                  //res.status(500).json({"code":10,"type":"error","message":err});
                  connection.rollback(function (err) {
                    console.log(err);
                  });
                  connection.release();
                  //throw err;
                  res
                    .status(500)
                    .json({ type: "error", message: err, code: 500 });
                }
              );
            });
          }
        });
      },
      function (err) {
        //console.log(err);
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  }
}
router.post("/Locker/open_to_save_all", ensureAuthorized, openToSaveAll);

function formathp(value) {
  if (value) {
    if (value.length == 11) {
      return value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7);
    } else if (hp.length == 12) {
      return value.slice(0, 4) + "-" + value.slice(4, 8) + "-" + value.slice(8);
    }
  }
  return value;
}
function sendCjHelloLaundry(data) {
  console.log("cj hello laundry ", data);
  dbSelect("applebox", { yid: data.yid }).then(
    function (res) {
      console.log(res);
      if (res.buyerSq == 6) {
        // cj 핼노우
        //var msg= '택배를 반송합니다.'

        //console.log('반송을 합니다.');
        //var msg=data.boxName+'에 있는 택배를 반송합니다. 자세한 내용은 휴대폰을 확인하여 주시기 바랍니다.';
        var title = data.boxName + " 에서 고객님의 세탁물을 수령했습니다.";
        var msg =
          data.saveHp.slice(-4) +
          " 고객님의 세탁물을 수령하였습니다. 자세한 내용은 휴대폰을 확인하여 주시기 바랍니다. -" +
          data.toName;
        //var title="신청하신 택배 반송합니다."

        var request = require("request");
        request(
          {
            uri: "http://180.182.47.132:8850/iot/push/notiPackage.json",
            //uri: 'http://113.131.56.17:8850/iot/push/notiPackage.json',
            //headers:headers,
            headers: {
              "Content-Type": "application/json",
            },
            //json: true,
            method: "post",
            json: {
              TEL_NO: formathp(data.saveHp),
              PUSH_TITLE: title,
              PUSH_MSG: msg,
            },
            timeout: 20000,
            followRedirect: true,
            maxRedirects: 2,
          },
          function (error, response, body) {
            if (error) {
              //res.status(600).json({"code":10,"type":"error","message":error.code});
              console.log(error);
            } else {
              //var code=response && response.statusCode;
              console.log("cj success", body);
            }
          }
        );
        request(
          {
            uri: "http://113.131.56.17:8850/iot/push/notiPackage.json",
            //headers:headers,
            headers: {
              "Content-Type": "application/json",
            },
            //json: true,
            method: "post",
            json: {
              TEL_NO: formathp(data.saveHp),
              PUSH_TITLE: title,
              PUSH_MSG: msg,
            },
            timeout: 20000,
            followRedirect: true,
            maxRedirects: 2,
          },
          function (error, response, body) {
            if (error) {
              //res.status(600).json({"code":10,"type":"error","message":error.code});
              console.log(error);
            } else {
              //var code=response && response.statusCode;
              console.log("cj success", body);
            }
          }
        );
      }
    },
    function (err) {
      console.log(err);
    }
  );
}
function houseList(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var wsql = 'where yid="' + req.params.yid + '"';
      //if(req.query.companyName) wsql+=' and companyName like "%'+req.query.companyName+'%"';
      //if(req.query.yid) wsql+=' and yid="'+req.query.yid+'"';
      if (req.query.dong) wsql += ' and dong="' + req.query.dong + '"';
      //if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
      //if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
      //console.log(wsql);
      var query = connection.query(
        "select  * from house " + wsql,
        [],
        function (err, results) {
          // ...
          connection.release();
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json(results);
          }
        }
      );
      //console.log(query);
    }
  });
}
router.get("/House/:yid", ensureAuthorized, houseList);

function sendCjHelloParcel(data) {
  console.log("cj hello parcel ", data);
  dbSelect("applebox", { yid: data.yid }).then(
    function (res) {
      console.log(res);
      if (res.buyerSq == 6) {
        // cj 핼노우
        //var msg= '택배를 반송합니다.'

        //console.log('반송을 합니다.');
        //var msg=data.boxName+'에 있는 택배를 반송합니다. 자세한 내용은 휴대폰을 확인하여 주시기 바랍니다.';
        var msg =
          data.toHp.slice(-4) +
          " 고객님의 택배를 수령하였습니다. 자세한 내용은 휴대폰을 확인하여 주시기 바랍니다. ";
        //var title="신청하신 택배 반송합니다."
        var title = data.boxName + " 에서 고객님의 택배를 수령했습니다.";
        var request = require("request");
        request(
          {
            uri: "http://180.182.47.132:8850/iot/push/notiPackage.json",
            //uri: 'http://113.131.56.17:8850/iot/push/notiPackage.json',
            //headers:headers,
            headers: {
              "Content-Type": "application/json",
            },
            //json: true,
            method: "post",
            json: {
              TEL_NO: formathp(data.saveHp),
              PUSH_TITLE: title,
              PUSH_MSG: msg,
            },
            timeout: 20000,
            followRedirect: true,
            maxRedirects: 2,
          },
          function (error, response, body) {
            if (error) {
              //res.status(600).json({"code":10,"type":"error","message":error.code});
              console.log(error);
            } else {
              //var code=response && response.statusCode;
              console.log("cj success", body);
            }
          }
        );
        request(
          {
            uri: "http://113.131.56.17:8850/iot/push/notiPackage.json",
            //headers:headers,
            headers: {
              "Content-Type": "application/json",
            },
            //json: true,
            method: "post",
            json: {
              TEL_NO: formathp(data.saveHp),
              PUSH_TITLE: title,
              PUSH_MSG: msg,
            },
            timeout: 20000,
            followRedirect: true,
            maxRedirects: 2,
          },
          function (error, response, body) {
            if (error) {
              //res.status(600).json({"code":10,"type":"error","message":error.code});
              console.log(error);
            } else {
              //var code=response && response.statusCode;
              console.log("cj success", body);
            }
          }
        );
      }
    },
    function (err) {
      console.log(err);
    }
  );
}
/*
{
    "TEL_NO":"010-1111-2222"
  , "PUSH_TITLE":"CJ HELLO 무인택배보관함에서 택배가 도착하였습니다."
  , "PUSH_MSG":"2985 고객님의 택배가 삼성 래미안 101동 CJHello 무인택배보관함에 도착하였습니다. 자세한 내용은 휴대폰을 확인하여 주시기 바랍니다. -CJ 대한통운"
}*/
function sendCjHelloMessage(
  yid,
  boxName,
  usage,
  toHp,
  saveHp,
  saveName,
  saveDate
) {
  if (usage == "A" || usage == "D") {
    dbSelect("applebox", { yid: yid }).then(
      function (res) {
        if (res.buyerSq == 6) {
          // cj 핼노우
          var msg = "";
          var title = "";
          if (usage == "A") {
            //msg = saveName +'님이 '+new Date(saveDate).toLocaleString() + '에'+ boxName + '에 택배를 보관하였습니다.'
            //msg = saveName +'님이 '+ boxName + '에 택배를 보관하였습니다.'
            title = boxName + "에 택배가 도착하였습니다.";
            msg =
              toHp.slice(-4) +
              " 고객님의 택배가 도착하였습니다. 자세한 내용은 휴대폰을 확인하여 주시기 바랍니다. -" +
              saveName;
          } else if (usage == "D") {
            //msg = saveName +'님이 '+ boxName + '에 세탁물을 보관하였습니다.'
            title = boxName + "에 세탁물이 도착하였습니다.";
            msg =
              toHp.slice(-4) +
              " 고객님의 세탁물이 도착하였습니다. 자세한 내용은 휴대폰을 확인하여 주시기 바랍니다. -" +
              saveName;
          }
          var request = require("request");
          request(
            {
              uri: "http://180.182.47.132:8850/iot/push/notiPackage.json",
              //uri: 'http://113.131.56.17:8850/iot/push/notiPackage.json',
              //headers:headers,
              headers: {
                "Content-Type": "application/json",
              },
              //json: true,
              method: "post",
              json: {
                TEL_NO: formathp(toHp),
                PUSH_TITLE: title,
                PUSH_MSG: msg,
              },
              timeout: 20000,
              followRedirect: true,
              maxRedirects: 2,
            },
            function (error, response, body) {
              if (error) {
                //res.status(600).json({"code":10,"type":"error","message":error.code});
                console.log(error);
              } else {
                //var code=response && response.statusCode;
                console.log(body);
              }
            }
          );
          request(
            {
              uri: "http://113.131.56.17:8850/iot/push/notiPackage.json",
              //headers:headers,
              headers: {
                "Content-Type": "application/json",
              },
              //json: true,
              method: "post",
              json: {
                TEL_NO: formathp(toHp),
                PUSH_TITLE: title,
                PUSH_MSG: msg,
              },
              timeout: 20000,
              followRedirect: true,
              maxRedirects: 2,
            },
            function (error, response, body) {
              if (error) {
                //res.status(600).json({"code":10,"type":"error","message":error.code});
                console.log(error);
              } else {
                //var code=response && response.statusCode;
                console.log(body);
              }
            }
          );
        }
      },
      function (err) {
        console.log(err);
      }
    );
  }
}
function getSimpleUrl(url) {
  if (url) {
    var idx = url.indexOf("https://");
    if (idx > -1) {
      return url.substring(idx + 8);
    }
    idx = url.indexOf("http://");
    if (idx > -1) {
      return url.substring(idx + 7);
    }
  }
  return url;
}
function openToTake(req, res, next) {
  //console.log(req.body);
  //console.log(req.decoded);
  //var authNum = randomString(4,'N');
  var param = {
    yid: req.body.yid,
    label: req.body.label,
    col: req.body.col,
    row: req.body.row,
    jumper: req.body.jumper,
    serial: req.body.serial,
    pwd: req.body.pwd,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    //saveHp:req.decoded?req.decoded.hp:req.body.saveHp,
    //saveName:req.decoded?req.decoded.name:req.body.saveName,
    saveDate: req.body.saveDate,
    toName: req.body.toName,
    usage: req.body.usage,
    toHp: req.body.toHp,
    boxName: req.body.boxName,
    regDate: new Date(),
    memberSq: req.decoded ? req.decoded.memberSq : 0,
    uuid: req.body.uuid,
    toDong: req.body.toDong,
    toHo: req.body.toHo,
  };
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      connection.query(
        "update locker set status='E' where yid=? and jumper=? and serial=?",
        [req.body.yid, req.body.jumper, req.body.serial],
        function (err, results) {
          // ...
          if (err) {
            connection.release();
            console.log(err);
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            //yid,label,col,row,jumper,serial,kind,hp,regDate,name,pwd
            connection.query(
              "INSERT INTO takeLog set ?",
              param,
              function (err, results) {
                // ...
                if (err) {
                  console.log(err);
                  res
                    .status(500)
                    .json({ code: 10, type: "error", message: err });
                } else {
                  sendFcmMessageThings(req.body.thingsSq, param);

                  var saveHp = req.body.saveHp;
                  var uuid = req.body.uuid;
                  if (req.body.usage == "H" || req.body.usage == "I") {
                    if (req.body.yid == 11042) {
                      sendLaundryUser(saveHp, uuid);
                    }
                  }
                  res.json({ takeSq: results.insertId });
                }
                connection.release();
              }
            );
          }
        }
      );
    }
  });
}
router.post("/Locker/open_to_take", checkAuthorized, openToTake);

function openToTakeServer(req, res, next) {
  //console.log(req.body);
  //console.log(req.decoded);
  //var authNum = randomString(4,'N');
  var param = {
    yid: req.body.yid,
    label: req.body.label,
    col: req.body.col,
    row: req.body.row,
    jumper: req.body.jumper,
    serial: req.body.serial,
    pwd: req.body.pwd,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    //saveHp:req.decoded?req.decoded.hp:req.body.saveHp,
    //saveName:req.decoded?req.decoded.name:req.body.saveName,
    saveDate: req.body.saveDate,
    toName: req.body.toName,
    usage: req.body.usage,
    toHp: req.body.toHp,
    boxName: req.body.boxName,
    regDate: new Date(),
    memberSq: req.decoded ? req.decoded.memberSq : 0,
    uuid: req.body.uuid,
    toDong: req.body.toDong,
    toHo: req.body.toHo,
  };
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      connection.query(
        "update locker set status='E' where yid=? and jumper=? and serial=?",
        [req.body.yid, req.body.jumper, req.body.serial],
        function (err, results) {
          // ...
          if (err) {
            connection.release();
            console.log(err);
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            //yid,label,col,row,jumper,serial,kind,hp,regDate,name,pwd
            connection.query(
              "INSERT INTO takeLog set ?",
              param,
              function (err, results) {
                // ...
                if (err) {
                  console.log(err);
                  res
                    .status(500)
                    .json({ code: 10, type: "error", message: err });
                } else {
                  var saveHp = req.body.saveHp;
                  var uuid = req.body.uuid;

                  if (req.body.usage == "H") {
                    if (req.body.yid == 11042) {
                      sendLaundryUser(saveHp, uuid);
                    }
                  }
                  res.json({ takeSq: results.insertId });
                }
                connection.release();
              }
            );
          }
        }
      );
    }
  });
}
router.post("/Server/open_to_take", checkAuthorized, openToTakeServer);

// 수거목록
function laundryTakeList(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');

  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var topSq = 0;
      //if(req.query.thingsSq) topSq= req.query.thingsSq;
      var wsql;
      wsql =
        ' where  A.yid=B.yid and A.status="A"  and A.toHp = "' +
        req.decoded.hp +
        '"';

      var query = connection.query(
        "select A.*,B.name,B.addr,B.location, (select things from things where A.thingsSq=thingsSq) things from locker A, applebox B " +
          wsql +
          " order by A.saveDate desc  ",
        [],
        function (err, results) {
          // ...
          if (err) {
            console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            var rs = [];
            _.each(results, function (one) {
              try {
                one.addr = JSON.parse(one.addr);
                one.things = JSON.parse(one.things);
              } catch (E) {}
              rs.push(one);
            });

            //console.log({success:true,data:rs});

            console.log(rs);
            res.json({ success: true, data: rs });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/LaundryTakeList", ensureAuthorized, laundryTakeList);

// 수거목록
function laundryDeliveryList(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');

  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var topSq = 0;
      //if(req.query.thingsSq) topSq= req.query.thingsSq;
      var wsql;
      wsql =
        ' where  A.yid=B.yid and A.status="E" and A.kind="A" and A.shopSq = ' +
        req.decoded.shopSq;
      //where+=' and A.status="'+req.query.status+'"';

      var query = connection.query(
        "select A.*,B.name,B.addr,B.location from things A, applebox B " +
          wsql +
          " order by A.thingsSq desc",
        [],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            var rs = [];
            _.each(results, function (one) {
              try {
                one.addr = JSON.parse(one.addr);
                one.things = JSON.parse(one.things);
              } catch (E) {}
              rs.push(one);
            });

            console.log(rs);
            res.json({ success: true, data: rs });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/LaundryDeliveryList", ensureAuthorized, laundryDeliveryList);
function thingsList(req, res, next) {
  var start = parseInt(req.query.page || "1") - 1;
  var length = parseInt(req.query.display || "10");

  pool.getConnection(function (err, connection) {
    if (err) {
      //console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var topSq = 0;
      //if(req.query.thingsSq) topSq= req.query.thingsSq;
      var wsql = " where thingsSq is not null";
      /*if(req.decoded.memberSq==0){ // 세탁소 주인
				wsql=' where toHp="'+req.decoded.hp+'"';
			}else{ // 일반사용자
				wsql=' where saveHp="'+req.decoded.hp+'"';
			}*/
      //console.log(req.decoded);
      if (req.decoded.memberSq > 0) {
        wsql += " and memberSq=" + req.decoded.memberSq;
      } else if (req.decoded.shopSq) {
        wsql += " and shopSq=" + req.decoded.shopSq;
      }
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          wsql += " and status in('" + req.query.status.join("','") + "')";
        } else {
          wsql += " and status='" + req.query.status + "'";
        }
      }
      //console.log('select count(*) cnt from things '+wsql+'; select  * from things '+wsql+' order by regDate desc  limit ? , ? ');

      var query = connection.query(
        "select count(*) cnt from things " +
          wsql +
          "; select  * from things " +
          wsql +
          " order by regDate desc  limit ? , ? ",
        [start * length, length],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            var rs = [];
            _.each(results[1], function (one) {
              one.things = JSON.parse(one.things);
              one.locker = JSON.parse(one.locker);
              one.prices = JSON.parse(one.prices);
              one.photos = JSON.parse(one.photos);
              one.saveLocker = JSON.parse(one.saveLocker);

              rs.push(one);
            });

            res.json({
              draw: parseInt(req.query.draw),
              recordsTotal: results[0][0].cnt,
              recordsFiltered: results[0][0].cnt,
              data: rs,
            });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/Things", ensureAuthorized, thingsList);

function acceptanceSelect(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');

  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var query = connection.query(
        "select * from acceptance where thingsSq=?",
        [req.params.thingsSq],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            if (results.length == 0) {
              res
                .status(404)
                .json({ code: 404, type: "error", message: "no data" });
            } else {
              var one = results[0];
              one.photos = JSON.parse(one.photos);
              one.prices = JSON.parse(one.prices);
              console.log(one);
              res.json(one);
            }
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/Acceptance/:thingsSq", ensureAuthorized, acceptanceSelect);

/*
function openToTakeAtRasp(req, res, next) {
	
	
	pool.getConnection(function (err, connection) {
		if (err) {
			console.log(err)
			res.status(500).json({"code":10,"type":"error","message":err});
		}else{

			
			connection.query("update locker set status='E' where yid=? and jumper=? and serial=?",[req.body.yid,req.body.jumper,req.body.serial], function (err, results) {
			  // ...
				 if (err) {
					 console.log(err)
					 res.status(500).json({"code":10,"type":"error","message":err});
					 
		         }else{

					 
		        	 //yid,label,col,row,jumper,serial,kind,hp,regDate,name,pwd 
					connection.query('INSERT INTO takeLog set ?', param, function(err, results) {
					// ...
						if (err) {
							console.log(err)
							res.status(500).json({"code":10,"type":"error","message":err});
						}else{
							
							
							res.json({takeSq:results.insertId});
							
						}
						connection.release();
					});		
		            
		            
		         }
				 
			});
			
		}
	});
}
router.post('/openToTake', checkAuthorized,openToTakeAtRasp);
*/
function closeToTake(req, res, next) {
  console.log(req.body);
  //var authNum = randomString(4,'N');
  var param = {
    //yid:req.body.yid,
    status: req.body.status,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    pwd: req.body.pwd,
    toHp: req.body.toHp,
    toName: req.body.toName,
    saveDate: req.body.saveDate,
  };
  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    } else {
      var jobs = [
        dbUpdate(
          connection,
          "locker",
          { status: "B" },
          {
            yid: req.body.yid,
            jumper: req.body.jumper,
            serial: req.body.serial,
            status: "E",
          }
        ),
      ];
      if (req.body.usage == "B") {
        // 고객이 보관한  택배를 관리자가 찾음
        jobs.push(
          dbUpdate(
            connection,
            "order",
            { status: "C", shippingDate: new Date() },
            {
              orderCd: req.body.thingsSq,
              //status:'A'
            }
          )
        );
      } else if (
        req.body.usage == "C" ||
        req.body.usage == "H" ||
        req.body.usage == "I"
      ) {
        // 고객이 보관한 물건을 세탁소가 찾아감

        jobs.push(
          dbUpdate(
            connection,
            "things",
            { status: "C", takeDate: new Date() },
            {
              thingsSq: req.body.thingsSq,
            }
          )
        );
      } else if (req.body.usage == "D") {
        //세탁소가 보관한 물건을 사용자가 찾아감
        jobs.push(
          dbUpdate(
            connection,
            "things",
            { status: "I", takeDate: new Date() },
            {
              thingsSq: req.body.thingsSq,
            }
          )
        );
      }
      Promise.all(jobs).then(
        function (results) {
          //if(req.body.usage=='B'){
          //sendFcm(connection,req.decoded,{command:'CLOSE_TO_TAKE',data:param},req.body.saveHp,null,true);
          /*
				if(req.body.usage=='B'){
					var fcmData={      
							//to:toId,
							notification:{
								body: param.toName+'님이 택배물건을 찾아갔습니다.', 
								title: 'O2OBox-택배',
								sound:'default'
							},
							data: {
								command:'CLOSE_TO_TAKE',
								data:JSON.stringify(param)
								//pushId:param.uuid
							},
							content_available:true
					};
					sendFcmHp(connection,fcmData,req.body.saveHp,res);
				}else{
					connection.release();
					res.json({success:true});	
				}*/
          //if(req.body.usage=='H'){ // 세탁 보관함에 키오스크로 보관

          //writeThings(req);

          //}
          connection.release();
          res.json({ success: true });
          if (req.body.usage == "F" || req.body.usage == "B") {
            //택배 반품
            sendCjHelloParcel(req.body);
          } else if (req.body.usage == "C") {
            sendCjHelloLaundry(req.body);
          }
        },
        function (err) {
          res.status(500).json({ code: 10, type: "error", message: err });
          connection.release();
        }
      );
      /*
			connection.query("update locker set status='B' where yid=? and jumper=? and serial=? and status='E'",[req.body.yid,req.body.jumper,req.body.serial], function (err, rows) {
			  // ...
				 if (err) {
					 console.log(err)
					 res.status(500).json({"code":10,"type":"error","message":err});
		         }else{
		    		if(rows.changedRows==1){    	
						//console.log('성공 sms 를 보내야 한다.');	
						res.json({});
			        
		         	}else{
						 //console.log('실패 sms 를 보내야 한다.');
						 res.json({});
					 }
				 }
				 connection.release();
			});*/
    }
  });
}

function closeToTakeServer(req, res, next) {
  console.log(req.body);
  //var authNum = randomString(4,'N');
  var param = {
    //yid:req.body.yid,
    status: req.body.status,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    pwd: req.body.pwd,
    toHp: req.body.toHp,
    toName: req.body.toName,
    toDong: req.body.toDong,
    toHo: req.body.toHo,
    saveDate: req.body.saveDate,
  };
  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    } else {
      var jobs = [
        dbUpdate(
          connection,
          "locker",
          { status: "B" },
          {
            yid: req.body.yid,
            jumper: req.body.jumper,
            serial: req.body.serial,
            status: "E",
          }
        ),
      ];
      if (req.body.usage == "B") {
        // 고객이 보관한  택배를 관리자가 찾음
        jobs.push(
          dbUpdate(
            connection,
            "order",
            { status: "C", shippingDate: new Date() },
            {
              orderCd: req.body.thingsSq,
              //status:'A'
            }
          )
        );
      } else if (req.body.usage == "C" || req.body.usage == "H") {
        // 고객이 보관한 물건을 세탁소가 찾아감

        jobs.push(
          dbUpdate(
            connection,
            "things",
            { status: "C", takeDate: new Date() },
            {
              thingsSq: req.body.thingsSq,
            }
          )
        );
      } else if (req.body.usage == "D") {
        //세탁소가 보관한 물건을 사용자가 찾아감
        jobs.push(
          dbUpdate(
            connection,
            "things",
            { status: "I", takeDate: new Date() },
            {
              thingsSq: req.body.thingsSq,
            }
          )
        );
      }
      Promise.all(jobs).then(
        function (results) {
          //if(req.body.usage=='B'){
          //sendFcm(connection,req.decoded,{command:'CLOSE_TO_TAKE',data:param},req.body.saveHp,null,true);
          /*
				if(req.body.usage=='B'){
					var fcmData={      
							//to:toId,
							notification:{
								body: param.toName+'님이 택배물건을 찾아갔습니다.', 
								title: 'O2OBox-택배',
								sound:'default'
							},
							data: {
								command:'CLOSE_TO_TAKE',
								data:JSON.stringify(param)
								//pushId:param.uuid
							},
							content_available:true
					};
					sendFcmHp(connection,fcmData,req.body.saveHp,res);
				}else{
					connection.release();
					res.json({success:true});	
				}*/
          //if(req.body.usage=='H'){ // 세탁 보관함에 키오스크로 보관

          //writeThings(req);

          //}
          connection.release();
          res.json({ success: true });
          //sendWallpad(param,2);
        },
        function (err) {
          res.status(500).json({ code: 10, type: "error", message: err });
          connection.release();
        }
      );
    }
  });
}
router.post("/Server/close_to_take", ensureAuthorized, closeToTakeServer);

function closeToSaveServer(req, res, next) {
  var param = req.body;
  // usage=='A';
  //console.log(req.body);
  if (
    param.usage == "B" ||
    param.usage == "C" ||
    param.usage == "G" ||
    param.usage == "H"
  ) {
    // 택배보내기 세탁-고객, 기부보관  ,세탁보관
    closeToSaveOrderServer(req, res, next);

    return;
  } else if (param.usage == "F") {
    // 개인물품 보관
    pool.getConnection(function (err, connection) {
      if (err) {
        // 실패로그 기록

        connection.release();
        throw err;
      }
      Promise.all([
        dbUpdate(
          connection,
          "locker",
          {
            status: "A",
            saveHp: req.body.saveHp,
            saveName: req.body.saveName,
            saveDate: req.body.saveDate,
            toHp: req.body.toHp,
            toName: req.body.toName,
            pwd: req.body.pwd,
            price: req.body.price,
          },
          {
            yid: req.body.yid,
            jumper: req.body.jumper,
            serial: req.body.serial,
          }
        ),
      ]).then(
        function (res2) {
          connection.release();
          res.json({ success: true });
        },
        function (err) {
          console.log(err);
          res.status(500).json({ code: 10, type: "error", message: err });
          connection.release();
          //throw err;
        }
      );
    });
  } else {
    // 일반택배(A) 세탁소 보관(D), 개인물품보관(F)
    var crypt = require("../common/crypto");
    var jobs = [
      getCodeTbl("template", "B"),
      dbQuery1(
        "SELECT * FROM member WHERE hp='" +
          req.body.toHp +
          "' order by joinDate desc limit 1"
      ),
      //,shortUrl('http://o2obox.kr/parcel/index.php?hp='+encodeURIComponent(crypt.encrypt(req.body.toHp))+'&saveDate='+encodeURIComponent(req.body.saveDate))
    ];
    Promise.all(jobs).then(
      function (res1) {
        var format = require("string-template");
        //console.log('ssss');
        var smsData = {
          dest_phone: req.body.toHp,
          send_phone: config.feedbackPhone,
          msg_body: format(res1[0].description, {
            saveName: req.body.saveName,
            boxName: req.body.boxName,
            pwd: req.body.pwd,
            //url: getSimpleUrl(res1[2].id)
          }),
          uuid: param.uuid,
        };
        //(무인택배보관함알림) 패스워드:12345 상세확인 -> goog.com/skjdfljsl

        var toId = null;
        var fcmData = null;

        if (res1[1].length > 0 && res1[1][0].regId) {
          //

          toId = res1[1][0].regId;

          fcmData = {
            priority: "high",
            to: toId,
            notification: {
              body: param.boxName + " 보관함에 물건이 보관되었습니다",
              title: "위키박스-" + (req.body.usage == "D" ? "세탁물" : ""),
              sound: "default",
            },
            data: {
              command: "CLOSE_TO_SAVE",
              data: JSON.stringify(param),
              pushId: param.uuid,
            },
            content_available: true,
          };
        } else {
          fcmData = null;
        }

        pool.getConnection(function (err, connection) {
          if (err) {
            // 실패로그 기록

            connection.release();
            throw err;
          } else {
            connection.beginTransaction(function (err) {
              if (err) {
                connection.release();
                throw err;
              }
              jobs = [
                dbUpdate(
                  connection,
                  "locker",
                  {
                    status: "A",
                    saveHp: req.body.saveHp,
                    saveName: req.body.saveName,
                    saveDate: req.body.saveDate,
                    toHp: req.body.toHp,
                    toName: req.body.toName,
                    pwd: req.body.pwd,
                  },
                  {
                    yid: req.body.yid,
                    jumper: req.body.jumper,
                    serial: req.body.serial,
                  }
                ),
                /*
							dbInsert(connection,'fcmPush',{
								pushId:param.uuid,
								uuid:param.uuid,
								receiverId:toId,
								fcmData:JSON.stringify(fcmData),
								smsData:JSON.stringify(smsData),
								senderHp:req.body.saveHp,
								receiverHp:req.body.toHp,
								senderType:(fcmData==null?'A':'B'),
								senderDate:(fcmData==null?null:new Date())
							})*/
              ];
              if (req.body.usage == "D") {
                //세탁소 보관
                jobs.push(
                  dbUpdate(
                    connection,
                    "things",
                    {
                      status: "H",
                      shippingDate: new Date(),
                      saveLocker: JSON.stringify({
                        yid: req.body.yid,
                        jumper: req.body.jumper,
                        serial: req.body.serial,
                        status: "A",
                        saveHp: req.body.saveHp,
                        saveName: req.body.saveName,
                        saveDate: req.body.saveDate,
                        toHp: req.body.toHp,
                        toName: req.body.toName,
                        boxName: req.body.boxName,
                        pwd: req.body.pwd,
                      }),
                    },
                    {
                      thingsSq: req.body.thingsSq,
                    }
                  )
                );
              }
              Promise.all(jobs).then(
                function (res2) {
                  connection.commit(function (err) {
                    if (err) {
                      //console.log(err);
                      //res.status(500).json({type:'error',message:err,code:500});
                      connection.rollback(function (err) {
                        console.log(err);
                      });
                      connection.release();
                      throw err;
                    } else {
                      res.json({});
                      /*if(fcmData!=null)
										sendFcmMessage(fcmData);
									sendCjHelloMessage(req.body.yid,req.body.boxName,req.body.usage,req.body.toHp,req.body.saveHp,req.body.saveName,req.body.saveDate);
									*/
                    }
                    connection.release();
                  });
                },
                function (err) {
                  //res.status(500).json({"code":10,"type":"error","message":err});
                  connection.rollback(function (err) {
                    console.log(err);
                  });
                  connection.release();
                  //throw err;
                  res
                    .status(500)
                    .json({ type: "error", message: err, code: 500 });
                }
              );
            });
          }
        });
      },
      function (err) {
        //console.log(err);
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  }
}

router.post("/Server/close_to_save", ensureAuthorized, closeToSaveServer);

function closeToSaveOrderServer(req, res, next) {
  //
  //var jobs = [dbSelect('shop',{shopSq:req.body.shopSq})];
  pool.getConnection(function (err, connection) {
    if (err) {
      // 실패로그 기록
      //connection.release();
      console.log(err);
      throw err;
    }
    var jobs = [
      dbUpdate(
        connection,
        "locker",
        {
          status: "A", // 보관중
          saveHp: req.body.saveHp,
          saveName: req.body.saveName,
          saveDate: req.body.saveDate,
          toHp: req.body.toHp,
          toName: req.body.toName,
          toDong: req.body.toDong,
          toHo: req.body.toHo,
          pwd: req.body.pwd,
        },
        {
          yid: req.body.yid,
          jumper: req.body.jumper,
          serial: req.body.serial,
        }
      ),
    ];
    if (req.body.usage == "B") {
      // 택배기사 보관
      jobs.push(
        dbUpdate(
          connection,
          "order",
          {
            status: "B",
            //shippingDate:new Date(),
            locker: JSON.stringify({
              yid: req.body.yid,
              jumper: req.body.jumper,
              serial: req.body.serial,
              status: "A",
              saveHp: req.body.saveHp,
              saveName: req.body.saveName,
              saveDate: req.body.saveDate,
              toHp: req.body.toHp,
              toName: req.body.toName,
              toDong: req.body.toDong,
              toHo: req.body.toHo,
              boxName: req.body.boxName,
              pwd: req.body.pwd,
              label: req.body.label,
              uuid: req.body.uuid,
            }),
          },
          {
            orderCd: req.body.thingsSq,
          }
        )
      );
    } else if (req.body.usage == "C") {
      // 고객이 세탁물 보관 앱으로 이미 things입력됩
      jobs.push(
        dbUpdate(
          connection,
          "things",
          {
            status: "B",
            //shippingDate:new Date(),
            locker: JSON.stringify({
              yid: req.body.yid,
              jumper: req.body.jumper,
              serial: req.body.serial,
              status: "A",
              saveHp: req.body.saveHp,
              saveName: req.body.saveName,
              saveDate: req.body.saveDate,
              toHp: req.body.toHp,
              toName: req.body.toName,
              toDong: req.body.toDong,
              toHo: req.body.toHo,
              boxName: req.body.boxName,
              pwd: req.body.pwd,
              label: req.body.label,
              uuid: req.body.uuid,
            }),
          },
          {
            thingsSq: req.body.thingsSq,
          }
        )
      );
    }
    if (req.body.pincodeSq) {
      jobs.push(
        dbUpdate(
          connection,
          "pincode",
          {
            valid: req.body.pincodeSq,
          },
          { pincodeSq: req.body.pincodeSq }
        )
      );
    }

    //console.log('bbb');
    Promise.all(jobs).then(
      function (res2) {
        //console.log('bbb1111');
        res.json({ success: true });

        //if(req.query.yid) wsql+=' and shopSq in(select '+req.query.yid[1]+' from buyer where buyerSq in (select buyerSq from applebox where yid='+req.query.yid[0]+'))';
        connection.release();

        if (req.body.usage == "H") {
          // 세탁 보관함에 키오스크로 보관
          console.log("writeThings");
          writeThings(req.body);
        }
      },
      function (err) {
        connection.release();
        //throw err;
        console.log(err);
        res.status(500).json({ type: "error", message: err, code: 500 });
      }
    );
  });
}

function writeThings(req) {
  //	select shopSq from shop where laundrySq=1

  //console.log(req.body,111);
  Promise.all([
    dbQuery1(
      "SELECT * FROM member WHERE hp='" +
        req.saveHp +
        "' order by joinDate desc limit 1"
    ),
    dbQuery1(
      "select laundrySq from buyer where buyerSq in (select buyerSq from applebox where yid=" +
        req.yid +
        ")"
    ),
  ]).then(
    function (res) {
      //console.log(4444);
      pool.getConnection(function (err, connection) {
        if (err) {
          console.log(err);
          //throw err;
        } else {
          console.log(1111);

          if (res[0].length == 0) {
            dbInsert(connection, "member", {
              media: "D",
              hp: req.saveHp,
              name: req.saveName,
            }).then(
              function (rr) {
                var param = {
                  thingsSq: req.thingsSq,
                  things: JSON.stringify(req.things),
                  yid: req.yid,
                  shopSq: req.shopSq || res[1][0].laundrySq,

                  memberSq: rr,
                  photos: "[]",
                  prices: "[]",
                  locker: JSON.stringify(req),
                  method: "A",
                  status: "B",
                  userName: req.saveName,
                  userHp: req.saveHp,
                };
                dbInsert(connection, "things", param).then(
                  function (rr2) {
                    connection.release();
                  },
                  function (err2) {
                    console.log(err2);
                    connection.release();
                  }
                );
              },
              function (err) {
                console.log(err);
                connection.release();
              }
            );
          } else {
            //console.log(222);
            var param = {
              thingsSq: req.thingsSq,
              things: JSON.stringify(req.things),
              yid: req.yid,
              shopSq: req.shopSq || res[1][0].laundrySq,
              memberSq: res[0][0].memberSq,
              photos: "[]",
              prices: "[]",
              locker: JSON.stringify(req),
              method: "A",
              status: "B",
              userName: res[0][0].name,
              userHp: req.saveHp,
            };
            console.log(param);
            dbInsert(connection, "things", param).then(
              function (rr2) {
                connection.release();
              },
              function (err2) {
                console.log(err2);
                connection.release();
              }
            );
          }
        }
      });
    },
    function (err) {
      console.log("error");
    }
  );
}
function sendFcmMessageMember(fcmData, memberSq) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
    } else {
      var query = connection.query(
        "SELECT * FROM member WHERE memberSq=?",
        [memberSq],
        function (err, results) {
          if (err) {
            //connection.release();
          }
          if (results.length > 0) {
            fcmData.to = results[0].regId;
            sendFcmMessage(fcmData);
          }
          connection.release();
        }
      );
    }
  });
}
function sendFcmHp(connection, fcmData, toHp, res) {
  var query = connection.query(
    "SELECT * FROM member WHERE hp=? order by joinDate desc limit 1",
    [toHp],
    function (err, results) {
      if (err) {
        //res.status(500).json({"code":10,"type":"error","message":err});
        //console.log(err);
        connection.release();
        throw err;
      }
      if (results.length > 0) {
        fcmData.to = results[0].regId;
        sendFcmMessage(fcmData);
      }
      connection.release();
      res.json({ success: true });
    }
  );
}
router.post("/Locker/close_to_take", ensureAuthorized, closeToTake);

function lockerCnt(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      //var wsql =' where A.yid = B.yid and B.status="A" and A.status = "A" ';
      //wsql+=' and A.toHp="'+req.decoded.hp+'"';
      //if(req.query.usage) wsql+= ' and A.usage="'+req.query.usage+'"';
      //wsql+='and  memberSq in (select memberSq from goods where goodsSq='+req.params.goodsSq+')';
      //if(req.query.topDate) wsql+= ' and A.saveDate>"'+req.query.topDate+'"';

      //console.log('select  A.*,B.name boxName,B.addr from locker A , applebox B '+wsql+' order by A.saveDate desc');
      var query = connection.query(
        'select count(*) cnt from locker A  where A.status="A" and  A.toHp="' +
          req.decoded.hp +
          '"',
        [],
        function (err, results) {
          // ...
          if (err) {
            //console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json({ success: true, data: results[0].cnt });
            //console.log(rs);
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/LockerCnt", ensureAuthorized, lockerCnt);

function newCnt(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      //var wsql =' where A.yid = B.yid and B.status="A" and A.status = "A" ';
      //wsql+=' and A.toHp="'+req.decoded.hp+'"';
      //if(req.query.usage) wsql+= ' and A.usage="'+req.query.usage+'"';
      //wsql+='and  memberSq in (select memberSq from goods where goodsSq='+req.params.goodsSq+')';
      //if(req.query.topDate) wsql+= ' and A.saveDate>"'+req.query.topDate+'"';

      //console.log('select  A.*,B.name boxName,B.addr from locker A , applebox B '+wsql+' order by A.saveDate desc');
      var query = connection.query(
        'select ( select count(*) cnt from locker A  where A.status="A" and  A.toHp="' +
          req.decoded.hp +
          '") lockerNewCnt,count(*) thingsNewCnt from things where ((status="A" and method="B") or (status>="B" and status<="H")) and memberSq = ' +
          req.decoded.memberSq,
        [],
        function (err, results) {
          // ...
          if (err) {
            //console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json(results[0]);
            //console.log(rs);
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/NewCnt", ensureAuthorized, newCnt);

function lockerList(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var wsql = ' where A.yid = B.yid and B.status="A" and A.status = "A" ';
      wsql += ' and A.toHp="' + req.decoded.hp + '"';
      if (req.query.usage) wsql += ' and A.usage="' + req.query.usage + '"';
      //wsql+='and  memberSq in (select memberSq from goods where goodsSq='+req.params.goodsSq+')';
      if (req.query.topDate)
        wsql += ' and A.saveDate>"' + req.query.topDate + '"';

      console.log(wsql);
      //console.log('select  A.*,B.name boxName,B.addr from locker A , applebox B '+wsql+' order by A.saveDate desc');
      var query = connection.query(
        "select  A.*,B.name boxName,B.addr from locker A , applebox B " +
          wsql +
          " order by A.saveDate desc",
        [],
        function (err, results) {
          // ...
          if (err) {
            console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            var rs = [];
            _.each(results, function (one) {
              try {
                one.addr = JSON.parse(one.addr);
              } catch (X) {}
              rs.push(one);
            });
            res.json({ success: true, data: rs });
            //console.log(rs);
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/Locker", ensureAuthorized, lockerList);

function saveLogList(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var topSq = 0;
      //if(req.query.topSq) topSq= req.query.topSq;
      var wsql = ' where toHp="' + req.decoded.hp + '"';
      if (req.query.maxDate)
        wsql +=
          " and regDate>STR_TO_DATE('" +
          dateFormat(new Date(req.query.maxDate), "yyyy-mm-dd HH:MM:ss.l") +
          "','%Y-%m-%d %H:%i:%s.%fZ')";
      else wsql += " and regDate<now()";

      var query = connection.query(
        "select * from saveLog " + wsql + " order by saveSq desc limit 1000",
        [],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            //console.log(results);
            res.json({ success: true, data: results });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/SaveLog", ensureAuthorized, saveLogList);

function takeLogList(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var topSq = 0;
      if (req.query.maxDate) maxDate = req.query.maxDate;
      var wsql = ' where toHp="' + req.decoded.hp + '"';
      if (req.query.maxDate)
        wsql +=
          " and regDate>STR_TO_DATE('" +
          dateFormat(new Date(req.query.maxDate), "yyyy-mm-dd HH:MM:ss.l") +
          "','%Y-%m-%d %H:%i:%s.%fZ')";
      else wsql += " and regDate<now()";
      //console.log('select * from takeLog '+wsql+' order by takeSq desc limit 1000');
      var query = connection.query(
        "select * from takeLog " + wsql + " order by takeSq desc limit 1000",
        [],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json({ success: true, data: results });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/TakeLog", ensureAuthorized, takeLogList);

/*

# api_key=YOUR_SERVER_KEY

# curl --header "Authorization: key=$api_key" \
       --header Content-Type:"application/json" \
       https://fcm.googleapis.com/fcm/send \
       -d "{\"registration_ids\":[\"ABC\"]}"

curl   --header "Host:"www42422.apple-box.kr" http//:125.209.200.159 
       

*/
function sendFcmMessage(fcmData) {
  //var FCM = require('fcm').FCM;
  var FCM = require("fcm-push");
  var apiKey =
    "AAAAGV33Ils:APA91bG4nuYybd-KAY32VNwh8BBi6-076FX-xhhjW9R3A3gPX0HvFjB_pZgGP2mOa0Dx4RfNia_yM6Dg77KNLgX-kGys2liCWZ9ZmZr70VxP6avhK0lyx-licw_9ZFJj1yssooXYNFx6";
  var fcm = new FCM(apiKey);
  /*
	var message = {
		registration_id: toId, // required
		collapse_key: 'Collapse key', 
		'data': JSON.stringify(fcmData)
		
	};*/

  //console.log(fcmData);
  fcm.send(fcmData, function (err, messageId) {
    if (err) {
      console.log(err);
    } else {
      console.log("Sent with message ID: ", messageId);
    }
  });
}

function rfidList(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');
  //var d = dateFormat(Date.parse(req.query.saveDate), "yyyy-MM-dd HH:mm:ss SSS");

  //console.log(d);
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var wsql = "where tagid is not null ";
      if (req.query.modDate) {
        wsql +=
          " and modDate>STR_TO_DATE('" +
          dateFormat(new Date(req.query.modDate), "yyyy-mm-dd HH:MM:ss.l") +
          "','%Y-%m-%d %H:%i:%s.%fZ')";
      }
      if (req.query.buyerSq) {
        wsql += " and sq=" + req.query.buyerSq;
      }
      console.log(wsql);
      var query = connection.query(
        "select  * from rfid " + wsql + "",
        [],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json({ success: true, data: results });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/Rfid", ensureAuthorized, rfidList);

function rfidInsert(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      var param = {
        tagid: req.body.tagid,
        subject: req.body.subject,
        name: req.body.name,
        hp: req.body.hp,
        status: "A",
      };
      var query = connection.query(
        "INSERT INTO rfid set ?",
        param,
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ code: 10, type: "error", message: err });
          } else {
            res.json({ insertId: results.insertId });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.post("/Rfid/:rfid", ensureAuthorized, rfidInsert);
function uuidSelect(req, res, next) {
  //console.log(req.body);
  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    } else {
      Promise.all([
        dbSelect("BIZ_MSG", { uuid: req.params.uuid }),
        dbSelect("fcmPush", { uuid: req.params.uuid }),
      ]).then(
        function (res1) {
          res.json({
            success: true,
            data: { uds_msg: res1[0], fcmPush: res1[1] },
          });
          connection.release();
        },
        function (err) {
          connection.release();
          res
            .status(404)
            .json({ code: 404, type: "error", message: "no pushId" });
          //throw err;
        }
      );
    }
  });
}
router.get("/Uuid/:uuid", ensureAuthorized, uuidSelect);

function ack(req, res, next) {
  //console.log(req.body);
  pool.getConnection(function (err, connection) {
    if (err) {
      //console.log(err)
      //res.status(500).json({"code":10,"type":"error","message":err});
      //connection.release();
      throw err;
    } else {
      var jobs = [
        dbUpdate(
          connection,
          "fcmPush",
          { senderType: "E", receiverDate: new Date() },
          {
            pushId: req.body.pushId,
          }
        ),
      ];
      Promise.all(jobs).then(
        function (results) {
          connection.release();
          res.json({ success: true });
          /*data =JSON.parse(result[0].smsData);
				poolSanta.getConnection(function (err, connection1) {
					if (err) {
						res.status(500).json({"code":10,"type":"error","message":err});
						connection1.release();
					}else{
						
						connection1.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", data, function(err,results1) {
							if(err){
								res.status(500).json({"code":10,"type":"error","message":err});
							}else{
								res.json({success:true});
							}
							connection1.release();
						});
						
					}
				});
				connection.release();
				*/
        },
        function (err) {
          connection.release();
          res
            .status(404)
            .json({ code: 404, type: "error", message: "no pushId" });
          //throw err;
        }
      );
    }
  });
}
router.post("/FcmAck", ensureAuthorized, ack);
function shopList(req, res, next) {
  var start = parseInt(req.query.page || "1") - 1;
  var length = parseInt(req.query.display || "10");

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var wsql = "where shopSq is not null ";
      //console.log(req.query.shopSqs);
      if (req.query.shopSqs) {
        if (Array.isArray(req.query.shopSqs)) {
          wsql += " and shopSq in(" + req.query.shopSqs.join(",") + ")";
        } else {
          wsql += " and shopSq = " + req.query.shopSqs;
        }
      }

      if (req.query.kind) {
        if (Array.isArray(req.query.kind)) {
          wsql += " and kind in('" + req.query.kind.join("','") + "')";
        } else {
          wsql += " and kind='" + req.query.kind + "'";
        }
      }
      if (req.query.status) wsql += " and status='" + req.query.status + "'";
      if (req.query.yid)
        wsql +=
          " and shopSq in(select " +
          req.query.yid[1] +
          " from buyer where buyerSq in (select buyerSq from applebox where yid=" +
          req.query.yid[0] +
          "))";
      //console.log(wsql);
      var query = connection.query(
        "select count(*) cnt from shop " +
          wsql +
          "; select  * from shop " +
          wsql +
          " order by shopSq desc  limit ? , ? ",
        [start * length, length],
        function (err, results) {
          // ...
          if (err) {
            //res.status(500).json({type:'error',message:err,code:500});
            connection.release();
            throw err;
          }
          //console.log(results[1]);
          var rs = [];
          _.each(results[1], function (one) {
            one.imageUrl = JSON.parse(one.imageUrl);
            one.addr = JSON.parse(one.addr);
            rs.push(one);
          });

          //console.log(rs);
          res.json({
            draw: parseInt(req.query.draw),
            recordsTotal: results[0][0].cnt,
            recordsFiltered: results[0][0].cnt,
            data: rs,
          });

          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/Shop", ensureAuthorized, shopList);

function orderInsert(req, res, next) {
  var param = {
    orderCd: req.body.orderCd,
    products: JSON.stringify(req.body.products),
    reqItem: req.body.reqItem, //요청내용
    status: req.body.status,
    totalPrice: req.body.totalPrice, //총판매가격
    description: req.body.description, //비고
    title: req.body.title, //제목(자동생성)
    addr: JSON.stringify(req.body.addr), //주소
    shopSq: req.body.shopSq, //상점아이디
    memberSq: req.decoded.memberSq, //사용자아이디
    pgCode: req.body.pgCode, //피지코드
    kind: req.body.kind,
    payType: req.body.payType,
  };
  //if(!req.body.orderCd){
  //	param.orderCd=getOrderNumber();
  //}

  pool.getConnection(function (err, connection) {
    if (err) {
      //connectin.release();
      throw err;
    }
    dbInsert(connection, "order", param).then(
      function (rr) {
        res.json({ success: true, data: param });
        connection.release();
      },
      function (err) {
        connection.release();
        //throw err;
        res.status(500).json({ type: "error", message: err, code: 500 });
      }
    );
  });
}
router.post("/Order", ensureAuthorized, orderInsert);

function thingsInsert(req, res, next) {
  //console.log( req.body.method | 'A');
  var param = {
    thingsSq: req.body.thingsSq,
    reqItem: req.body.reqItem,
    things: JSON.stringify(req.body.things),
    yid: req.body.yid,
    //price:req.body.price,//총판매가격
    //description: req.body.description,//비고
    //title:req.body.title,//제목(자동생성)
    //addr:JSON.stringify(req.body.addr),//주소
    shopSq: req.body.shopSq, //상점아이디
    memberSq: req.decoded.memberSq, //사용자아이디
    photos: "[]",
    prices: req.body.prices ? JSON.stringify(req.body.prices) : "[]",
    confirm: req.body.confirm,
    saveLocker: JSON.stringify(req.body.saveLocker),
    method: req.body.method || "A",
    visitDate: req.body.visitDate,
    addr: req.body.addr,
    userName: req.decoded.name,
    userHp: req.decoded.hp,
    //pgCode:req.body.pgCode,//피지코드
    //kind:req.body.kind,
    //payType:req.body.payType
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      //connectin.release();
      throw err;
    }

    var jobs = [
      dbInsert(connection, "things", param),
      //dbInsert(connection,'acceptance',param1)
    ];
    Promise.all(jobs).then(
      function (res2) {
        res.json({ success: true, data: param });
        connection.release();
      },
      function (err) {
        //
        connection.release();
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  });
}
router.post("/Things", ensureAuthorized, thingsInsert);

function thingsTempInsert(req, res, next) {
  console.log(req.body);
  //console.log( req.body.method | 'A');
  var param = {
    thingsSq: req.body.thingsSq,
    reqItem: req.body.reqItem,
    things: JSON.stringify(req.body.things),
    yid: req.body.yid,
    //price:req.body.price,//총판매가격
    //description: req.body.description,//비고
    //title:req.body.title,//제목(자동생성)
    //addr:JSON.stringify(req.body.addr),//주소
    shopSq: req.body.shopSq, //상점아이디
    memberSq: req.decoded.memberSq, //사용자아이디
    photos: "[]",
    prices: req.body.prices ? JSON.stringify(req.body.prices) : "[]",
    confirm: req.body.confirm,
    saveLocker: JSON.stringify(req.body.saveLocker),
    method: req.body.method || "A",
    visitDate: req.body.visitDate,
    //pgCode:req.body.pgCode,//피지코드
    //kind:req.body.kind,
    //payType:req.body.payType
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      //connectin.release();
      throw err;
    }

    var jobs = [
      dbInsert(connection, "thingsTemp", param),
      //dbInsert(connection,'acceptance',param1)
    ];
    Promise.all(jobs).then(
      function (res2) {
        res.json({ success: true, data: param });
        connection.release();
      },
      function (err) {
        //
        connection.release();
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  });
}
router.post("/ThingsTemp", ensureAuthorized, thingsTempInsert);

function thingsTempUpdate(req, res, next) {
  var param = {
    reqItem: req.body.reqItem,
    things: JSON.stringify(req.body.things),
    //yid:req.body.yid,
    //price:req.body.price,//총판매가격
    //description: req.body.description,//비고
    //title:req.body.title,//제목(자동생성)
    //addr:JSON.stringify(req.body.addr),//주소
    //shopSq:req.body.shopSq,//상점아이디
    //memberSq:req.decoded.memberSq,//사용자아이디
    photos: "[]",
    prices: "[]",
    confirm: req.body.confirm,
    saveLocker: JSON.stringify(req.body.saveLocker),
    //method:req.body.method | 'A',
    regDate: new Date(),
    //status:req.body.status | 'A'
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      //connectin.release();
      throw err;
    }

    var jobs = [
      dbUpdate(connection, "things", param, { thingsSq: req.params.thingsSq }),
      //dbInsert(connection,'acceptance',param1)
    ];
    Promise.all(jobs).then(
      function (res2) {
        res.json({ success: true, data: param });
        connection.release();
      },
      function (err) {
        //
        connection.release();
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  });
}
router.post("/ThingsTemp/:thingsSq", ensureAuthorized, thingsTempUpdate);

function thingsUpdate(req, res, next) {
  //console.log(req.body);
  var param = {
    confirm: req.body.confirm,
    prices: JSON.stringify(req.body.prices),
    //photos: JSON.stringify(req.body.photos),

    totalPrice: req.body.totalPrice,
    status: req.body.status,
    pubDate: new Date(),
  };
  //console.log(req.body);
  //if(!req.body.orderCd){
  //	param.orderCd=getOrderNumber();
  //}
  var upload = require("./upload");
  upload.savePermantFiles(req.body.photos).then(
    function (results) {
      pool.getConnection(function (err, connection) {
        if (err) {
          //connectin.release();
          throw err;
        }
        param.photos = JSON.stringify(results);
        var jobs = [
          dbUpdate(connection, "things", param, {
            thingsSq: req.body.thingsSq,
          }),
        ];
        Promise.all(jobs).then(
          function (res2) {
            res.json({ success: true });
            connection.release();
            var fcmData = {
              priority: "high",
              notification: {
                body:
                  req.body.locker.toName +
                  "님이 인수증을 보냈습니다. 세탁신청내역에서 결제 대기중인 항목을 확인후 결제진행 부탁드립니다.",
                title: "위키박스-세탁",
                sound: "default",
              },
              data: {
                command: "CLOSE_TO_TAKE",
                data: JSON.stringify(param),
                //pushId:param.uuid
              },
              content_available: true,
            };
            sendFcmMessageMember(fcmData, req.body.memberSq);
          },
          function (err) {
            connection.release();
            res.status(500).json({ code: 10, type: "error", message: err });
          }
        );
      });
    },
    function (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    }
  );
}
// 인수증 발행의 경우  (세탁앱에서 사용함)
router.put("/Things/:thingsSq", ensureAuthorized, thingsUpdate);
function thingsFeedUpdate(req, res, next) {
  var param = {
    status: "H",
    shippingDate: new Date(),
    saveLocker: JSON.stringify(req.body.saveLocker),
  };
  //console.log(req.body);
  //if(!req.body.orderCd){
  //	param.orderCd=getOrderNumber();
  //}
  //var upload = require('./upload');

  pool.getConnection(function (err, connection) {
    if (err) {
      connectin.release();
      throw err;
    }

    var jobs = [
      dbUpdate(connection, "things", param, {
        thingsSq: req.body.thingsSq,
      }),
    ];
    Promise.all(jobs).then(
      function (res2) {
        res.json({ success: true });
        connection.release();
        /*var fcmData={   
					notification:{
						body: req.decoded.name+'님이 인수증을 보냈습니다.', 
						title: 'O2OBox-세탁',
						sound:'default'
					},
					data: {
						command:'CLOSE_TO_TAKE',
						data:JSON.stringify(param)
						//pushId:param.uuid
					},
					content_available:true
			};
			sendFcmMessageMember(fcmData,req.body.memberSq);
			*/
      },
      function (err) {
        connection.release();
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  });
}
// 인수증 발행의 경우
router.put("/ThingsFeed/:thingsSq", ensureAuthorized, thingsFeedUpdate);
//보관함 물건 보관의 경우 status = H, shippingDate=now saveLocker= locker;

function acceptanceInsert(req, res, next) {
  var param = {
    thingsSq: req.body.thingsSq,
    confirm: req.body.confirm,
    prices: JSON.stringify(req.body.prices),
    //photos: JSON.stringify(req.body.photos),
    shopSq: req.body.shopSq, //상점아이디
    totalPrice: req.body.totalPrice,
    status: "A",
    pubDate: new Date(),
  };
  //console.log(req.body);
  //if(!req.body.orderCd){
  //	param.orderCd=getOrderNumber();
  //}
  var upload = require("./upload");
  upload.savePermantFiles(req.body.photos).then(
    function (results) {
      //onsole.log(222222);
      pool.getConnection(function (err, connection) {
        if (err) {
          //console.log(err);
          //connectin.release();
          throw err;
        }
        param.photos = JSON.stringify(results);
        var jobs = [
          dbSelect("things", { thingsSq: req.body.thingsSq }),
          dbInsert(connection, "acceptance", param),
          dbUpdate(
            connection,
            "things",
            { status: "D" },
            { thingsSq: req.body.thingsSq }
          ),
        ];
        Promise.all(jobs).then(
          function (res2) {
            res.json({ success: true });
            connection.release();
            var fcmData = {
              priority: "high",
              notification: {
                body: req.decoded.name + "님이 인수증을 보냈습니다.",
                title: "위키박스-세탁",
                sound: "default",
              },
              data: {
                command: "CLOSE_TO_TAKE",
                data: JSON.stringify(param),
                //pushId:param.uuid
              },
              content_available: true,
            };
            sendFcmMessageMember(fcmData, res2[0].memberSq);
          },
          function (err) {
            //
            //console.log(err);
            connection.release();
            res.status(500).json({ code: 10, type: "error", message: err });
          }
        );
      });
    },
    function (err) {
      //console.log('111111');
      //console.log(err);
      res.status(500).json({ code: 10, type: "error", message: err });
    }
  );
}
router.post("/Acceptance", ensureAuthorized, acceptanceInsert);

function acceptanceUpdate(req, res, next) {
  var param = {
    confirm: req.body.confirm,
    prices: JSON.stringify(req.body.prices),
    //photos: JSON.stringify(req.body.photos),
    totalPrice: req.body.totalPrice,
    status: "A",
    pubDate: new Date(),
  };
  //console.log(req.body);
  //if(!req.body.orderCd){
  //	param.orderCd=getOrderNumber();
  //}
  var upload = require("./upload");
  upload.savePermantFiles(req.body.photos).then(
    function (results) {
      pool.getConnection(function (err, connection) {
        if (err) {
          //connectin.release();
          throw err;
        }
        param.photos = JSON.stringify(results);
        var jobs = [
          dbSelect("things", { thingsSq: req.body.thingsSq }),
          dbUpdate(connection, "acceptance", param, {
            thingsSq: req.body.thingsSq,
          }),
        ];
        Promise.all(jobs).then(
          function (res2) {
            res.json({ success: true });
            connection.release();
            var fcmData = {
              priority: "high",
              notification: {
                body: req.decoded.name + "님이 인수증을 보냈습니다.",
                title: "위키박스-세탁",
                sound: "default",
              },
              data: {
                command: "CLOSE_TO_TAKE",
                data: JSON.stringify(param),
                //pushId:param.uuid
              },
              content_available: true,
            };
            sendFcmMessageMember(fcmData, res2[0].memberSq);
          },
          function (err) {
            connection.release();
            res.status(500).json({ code: 10, type: "error", message: err });
          }
        );
      });
    },
    function (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    }
  );
}
router.put("/Acceptance/:thingsSq", ensureAuthorized, acceptanceUpdate);

function shopOrderList(req, res, next) {
  var start = parseInt(req.query.page || "1") - 1;
  var length = parseInt(req.query.display || "10");

  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    }
    //console.log(req.decoded);
    var wsql = " where shopSq=" + req.decoded.shopSq;
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        wsql += " and status in('" + req.query.status.join("','") + "')";
      } else {
        wsql += " and status='" + req.query.status + "'";
      }
    }
    if (req.query.kind) wsql += " and kind='" + req.query.kind + "'";
    if (req.query.startDate)
      wsql += " and regDate>='" + req.query.startDate + "'";
    if (req.query.endDate)
      wsql += " and regDate<='" + req.query.endDate + "  23:59:59'";
    //console.log(wsql);
    var query = connection.query(
      "select count(*) cnt from `order` " +
        wsql +
        "; select  * from `order` " +
        wsql +
        " order by orderCd desc  limit ? , ? ",
      [start * length, length],
      function (err, results) {
        // ...
        if (err) {
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          var rs = [];
          _.each(results[1], function (one) {
            one.products = JSON.parse(one.products);
            one.addr = JSON.parse(one.addr);
            one.locker = JSON.parse(one.locker);
            rs.push(one);
          });

          //console.log(results[0][0].cnt);
          res.json({
            draw: parseInt(req.query.draw),
            recordsTotal: results[0][0].cnt,
            recordsFiltered: results[0][0].cnt,
            data: rs,
          });
        }
        connection.release();
      }
    );
  });
}
router.get("/ShopOrder", ensureAuthorized, shopOrderList);

function orderList(req, res, next) {
  var start = parseInt(req.query.page || "1") - 1;
  var length = parseInt(req.query.display || "10");

  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    }
    //console.log(req.decoded);
    var wsql = " where memberSq=" + req.decoded.memberSq;
    //if(req.query.status) wsql+=" and status='"+req.query.status+"'";
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        wsql += " and status in('" + req.query.status.join("','") + "')";
      } else {
        wsql += " and status='" + req.query.status + "'";
      }
    }
    //console.log(wsql);
    if (req.query.kind) wsql += " and kind='" + req.query.kind + "'";
    if (req.query.startDate)
      wsql += " and regDate>='" + req.query.startDate + "'";
    if (req.query.endDate)
      wsql += " and regDate<='" + req.query.endDate + "  23:59:59'";
    //console.log(wsql);
    var query = connection.query(
      "select count(*) cnt from `order` " +
        wsql +
        "; select  * from `order` " +
        wsql +
        " order by orderCd desc  limit ? , ? ",
      [start * length, length],
      function (err, results) {
        // ...
        if (err) {
          //connection.release();
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          var rs = [];
          _.each(results[1], function (one) {
            one.products = JSON.parse(one.products);
            one.locker = JSON.parse(one.locker);
            one.addr = JSON.parse(one.addr);
            rs.push(one);
          });

          //console.log(results[0][0].cnt);
          res.json({
            draw: parseInt(req.query.draw),
            recordsTotal: results[0][0].cnt,
            recordsFiltered: results[0][0].cnt,
            data: rs,
          });
        }

        connection.release();
      }
    );
  });
}
router.get("/Order", ensureAuthorized, orderList);
function buyerSelect(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var query = connection.query(
        "SELECT * FROM buyer WHERE buyerSq = ?",
        [req.params.buyerSq],
        function (err, results) {
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
            //throw err;
          } else {
            one = results[0];
            try {
              one.addr = JSON.parse(one.addr);
            } catch (E) {}
            res.json(one);
          }
          connection.release();
        }
      );
    }
  });
}
router.get("/Buyer/:buyerSq", ensureAuthorized, buyerSelect);

// 수거목록
function laundryPriceGroupList(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');

  pool.getConnection(function (err, connection) {
    if (err) {
      //console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      //var topSq = 0;
      //if(req.query.thingsSq) topSq= req.query.thingsSq;
      //var wsql;
      //wsql=' where  A.yid=B.yid and A.status="A"  and A.toHp = "'+req.decoded.hp+'"';

      var query = connection.query(
        "select distinct groupName from laundryPrice where shopSq=" +
          req.params.shopSq +
          " order by sortOrder;",
        [],
        function (err, results) {
          // ...
          if (err) {
            //console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json(results);
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get(
  "/LaundryPriceGroupList/:shopSq",
  ensureAuthorized,
  laundryPriceGroupList
);
function laundryPriceList(req, res, next) {
  //var start = parseInt(req.query.page||'1')-1;
  //var length = parseInt(req.query.display||'10');

  pool.getConnection(function (err, connection) {
    if (err) {
      //console.log(err);
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      //var topSq = 0;
      //if(req.query.thingsSq) topSq= req.query.thingsSq;
      //var wsql;
      //wsql=' where  A.yid=B.yid and A.status="A"  and A.toHp = "'+req.decoded.hp+'"';

      var query = connection.query(
        "select * from laundryPrice where shopSq=" +
          req.params.shopSq +
          ' and groupName="' +
          req.params.groupName +
          '" order by sortOrder;',
        [],
        function (err, results) {
          // ...
          if (err) {
            //console.log(err);
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json(results);
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get(
  "/LaundryPriceList/:shopSq/:groupName",
  ensureAuthorized,
  laundryPriceList
);

function appleboxMapList(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,Content-Type, Authorization"
  );
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var wsql = "where yid is not null ";

      //console.log(wsql);
      var query = connection.query(
        'select  * from applebox where status="A"',
        [],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            //console.log(results[0][0].cnt);
            var rs = [];
            _.each(results, function (one) {
              try {
                one.addr = JSON.parse(one.addr);
                var md = {
                  latitude: one.addr.latitude,
                  longitude: one.addr.longitude,
                };
                rs.push(md);
              } catch (X) {}
              //rs.push(one);
            });
            //console.log(typeof(results[1][0].regDate));
            res.json(rs);
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/AppleboxMap", appleboxMapList);

function donationSelect(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var query = connection.query(
        "SELECT * FROM donation WHERE memberSq=? and donationSq = ?",
        [req.decoded.memberSq, req.params.donationSq],
        function (err, results) {
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
            //throw err;
          } else {
            one = results[0];
            try {
              one.photos = JSON.parse(one.photos);
            } catch (E) {}
            res.json(one);
          }
          connection.release();
        }
      );
    }
  });
}

router.get("/Donation/:donationSq", ensureAuthorized, donationSelect);

function memberUpdate(req, res, next) {
  pool.getConnection(function (err, connection) {
    var param = {
      hp: req.body.hp,
      name: req.body.name,
    };
    var query = connection.query(
      "update `santa`.`member` set ? where memberSq=?",
      [param, req.decoded.memberSq],
      function (err, rows) {
        if (err) {
          //console.error("err : " + err);
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          res.json({ changedRows: rows.changedRows });
        }
        connection.release();
      }
    );
  });
}
router.put("/Member", ensureAuthorized, memberUpdate);

function pincodeInsert(req, res, next) {
  var pincode = randomString(6, "N");
  var param = {
    thingsSq: req.body.thingsSq,
    memberSq: req.decoded.memberSq, //사용자아이디
    mode: req.body.mode,
    saveHp: req.body.saveHp,
    saveName: req.body.saveName,
    toHp: req.body.toHp,
    toName: req.body.toName,
    valid: "A",
    fireDate: new Date() + 7,
    pincode: pincode,
  };

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      dbInsert(connection, "pincode", param).then(
        function (results) {
          res.json({ pincodeSq: results, pincode: pincode });
          connection.release();
        },
        function (err) {
          connection.release();
          res.status(500).json({ code: 10, type: "error", message: err });
        }
      );
    }
  });
}
router.post("/Pincode", ensureAuthorized, pincodeInsert);

function pincodeSelect(req, res, next) {
  res.json({
    pincodeSq: 1,
    thinsSq: "12345678900",
    mode: "A",
    saveName: "홍길동",
    saveHp: "01051925220",
    toHp: "01051925220",
    toName: "홍길동",
    memberSq: 119,
    pincode: "206187",
  });
  if (true) return;
}
router.get("/pincode/:yid/:pincode", ensureAuthorized, pincodeSelect);

function donationInsert(req, res, next) {
  var donationSq = getOrderNumber();
  var param = {
    donationSq: donationSq,
    memberSq: req.decoded.memberSq, //사용자아이디
    content: req.body.content,
    title: req.body.title,
    point: 0,
    pincode: req.body.pincode,
    viewCnt: 0,
    recoCnt: 0,
  };

  var upload = require("./upload");
  upload.savePermantFiles(req.body.photos).then(
    function (results) {
      pool.getConnection(function (err, connection) {
        if (err) {
          //connectin.release();
          throw err;
        }
        param.photos = JSON.stringify(results);
        var jobs = [dbInsert(connection, "donation", param)];
        Promise.all(jobs).then(
          function (res2) {
            res.json({ donationSq: donationSq });
            connection.release();
          },
          function (err) {
            connection.release();
            res.status(500).json({ code: 10, type: "error", message: err });
          }
        );
      });
    },
    function (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    }
  );
}
router.post("/Donation", ensureAuthorized, donationInsert);
function donationList(req, res, next) {
  var start = parseInt(req.query.page || "1") - 1;
  var length = parseInt(req.query.display || "10");

  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    }

    var wsql = " where memberSq=" + req.decoded.memberSq;

    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        wsql += " and status in('" + req.query.status.join("','") + "')";
      } else {
        wsql += " and status='" + req.query.status + "'";
      }
    }
    //console.log(wsql);
    if (req.query.kind) wsql += " and kind='" + req.query.kind + "'";
    if (req.query.startDate)
      wsql += " and regDate>='" + req.query.startDate + "'";
    if (req.query.endDate)
      wsql += " and regDate<='" + req.query.endDate + "  23:59:59'";
    //console.log(wsql);
    var query = connection.query(
      "select count(*) cnt from `donation` " +
        wsql +
        "; select  * from `donation` " +
        wsql +
        " order by regDate desc  limit ? , ? ",
      [start * length, length],
      function (err, results) {
        // ...
        if (err) {
          //connection.release();
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          var rs = [];
          _.each(results[1], function (one) {
            //one.products = JSON.parse(one.products);
            //one.locker = JSON.parse(one.locker);
            one.photos = JSON.parse(one.photos);
            rs.push(one);
          });

          //console.log(results[0][0].cnt);
          res.json({
            draw: parseInt(req.query.draw),
            recordsTotal: results[0][0].cnt,
            recordsFiltered: results[0][0].cnt,
            data: rs,
          });
        }

        connection.release();
      }
    );
  });
}
router.get("/Donation", ensureAuthorized, donationList);

function donationUpdate(req, res, next) {
  var param = req.body;
  var upload = require("./upload");
  if (req.body.photos) {
    upload.savePermantFiles(req.body.photos).then(
      function (results) {
        pool.getConnection(function (err, connection) {
          if (err) {
            //connectin.release();
            throw err;
          }
          param.photos = JSON.stringify(results);
          var query = connection.query(
            "update `donation` set ? where memberSq=? and donationSq=?",
            [param, req.decoded.memberSq, req.params.donationSq],
            function (err, rows) {
              if (err) {
                res
                  .status(500)
                  .json({ type: "error", message: err, code: 500 });
              } else {
                res.json(rows.changedRows);
              }
              connection.release();
            }
          );
          //console.log(query);
        });
      },
      function (err) {
        res.status(500).json({ code: 10, type: "error", message: err });
      }
    );
  } else {
    pool.getConnection(function (err, connection) {
      if (err) {
        throw err;
      }

      var query = connection.query(
        "update `donation` set ? where memberSq=? and donationSq=?",
        [param, req.decoded.memberSq, req.params.donationSq],
        function (err, rows) {
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json(rows.changedRows);
          }
          connection.release();
        }
      );
    });
  }
}
router.put("/Donation/:donationSq", ensureAuthorized, donationUpdate);
function donationIncUpdate(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    }

    var query = connection.query(
      "update `donation` set " +
        req.params.field +
        "=" +
        req.params.field +
        "+1 where memberSq=? and donationSq=?",
      [req.decoded.memberSq, req.params.donationSq],
      function (err, rows) {
        if (err) {
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          res.json(rows.changedRows);
        }
        connection.release();
      }
    );
  });
}
router.put(
  "/Donation/inc/:field/:donationSq",
  ensureAuthorized,
  donationIncUpdate
);

function shopSelect(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var query = connection.query(
        "select * from shop where shopSq in(select laundrySq from buyer where buyerSq in (select buyerSq from applebox where yid=?))",
        [req.params.yid],
        function (err, results) {
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            if (results.length == 0) {
              res
                .status(404)
                .json({ code: 404, type: "error", message: "no data" });
            } else {
              res.json(results[0]);
            }
          }
          connection.release();
        }
      );
    }
  });
}
router.get("/Shop/:yid", ensureAuthorized, shopSelect);

function noticeList(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      var wsql = "where buyerSq=" + req.params.buyerSq;
      if (req.query.modDate) {
        wsql +=
          " and modDate>STR_TO_DATE('" +
          dateFormat(new Date(req.query.modDate), "yyyy-mm-dd HH:MM:ss.l") +
          "','%Y-%m-%d %H:%i:%s.%fZ')";
      }
      console.log(wsql);
      var query = connection.query(
        "select  * from notice " + wsql + "",
        [],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            res.json({ success: true, data: results });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/Notice/:buyerSq", ensureAuthorized, noticeList);

/*var format = require("string-template");
console.log(format('{boxName}에 보관,패스워드:{pwd},상세확인 {url}', {
	saveName: 'sdf',
	boxName:'상암동 보관',
	pwd:'12334',
	url: 'http://goog.com'}));
	
Promise.all([shortUrl('http://o2obox.kr/parcel/index.php?hp=P4Kgvo4oYNEMIiIkpysRjA==&saveDate=2018-02-20T04:20:28.910Z')]).then(function(res1){
	console.log(res1[0].id);
},function(err){
	console.log(err);
});*/

function geojson(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ type: "error", message: err, code: 500 });
    } else {
      //var wsql='where shopSq='+req.params.shopSq;
      var query = connection.query(
        'select geometry from adm where adm_cd in(select adm_cd from admService where shopSq in (select shopSq from  service where kind="' +
          req.params.kind +
          '"))',
        [],
        function (err, results) {
          // ...
          if (err) {
            res.status(500).json({ type: "error", message: err, code: 500 });
          } else {
            var rs = [];
            _.each(results, function (it) {
              try {
                rs.push(JSON.parse(it.geometry));
              } catch (X) {}
            });

            res.json({
              type: "FeatureCollection",
              crs: {
                type: "name",
                properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
              },
              features: rs,
            });
          }
          connection.release();
        }
      );
      //console.log(query);
    }
  });
}
router.get("/Geojson/:kind", geojson);

function housePwdUpdate(req, res, next) {
  pool.getConnection(function (err, connection) {
    var param = {
      pwd: req.body.newpass,
    };
    var query = connection.query(
      "update house set ? where yid=? and dong=? and ho=?",
      [param, req.params.yid, req.params.dong, req.params.ho],
      function (err, rows) {
        if (err) {
          //console.error("err : " + err);
          res.status(500).json({ type: "error", message: err, code: 500 });
        } else {
          res.json({ changedRows: rows.changedRows });
        }
        connection.release();
      }
    );
  });
}
router.post("/HousePwdChange/:yid/:dong/:ho", ensureAuthorized, housePwdUpdate);

function rfidChange(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json({ code: 10, type: "error", message: err });
    } else {
      connection.query(
        "delete from resident  where yid=? and dong=? and ho=?",
        [req.params.yid, req.params.dong, req.params.ho],
        function (err, rows) {
          // ...
          if (err) {
            console.log(err);
            res.status(500).json({ code: 10, type: "error", message: err });
            connection.release();
          } else {
            var values = [];

            for (var i = 0; i < req.body.length; i++) {
              values.push([
                req.params.yid,
                req.params.dong,
                req.params.ho,
                req.body[i],
                "A",
              ]);
            }

            connection.query(
              "INSERT INTO resident (yid,dong, ho,tagid,status) VALUES ?",
              [values],
              function (err, rows) {
                // ...
                if (err) {
                  console.log(err);
                  res
                    .status(500)
                    .json({ code: 10, type: "error", message: err });
                  connection.release();
                } else {
                  connection.query(
                    "select * from resident where status='A' and  yid=? and dong=? and ho=?",
                    [req.params.yid, req.params.dong, req.params.ho],
                    function (err, rows) {
                      // ...
                      if (err) {
                        console.log(err);
                        res
                          .status(500)
                          .json({ code: 10, type: "error", message: err });
                      } else {
                        res.json(rows);
                      }
                      connection.release();
                    }
                  );
                }
              }
            );
          }
        }
      );

      //console.log(query);
    }
  });
}
router.post("/RfidChange/:yid/:dong/:ho", ensureAuthorized, rfidChange);

module.exports = router;
