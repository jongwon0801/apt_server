var express = require('express');
var router = express.Router({caseSensitive:true});
var urlencode = require('urlencode');
var crypto = require('crypto');
var jwt    = require('jsonwebtoken');
var config = require('../config');
var path = require('path');
var _ = require('underscore');
//var FCM = require('fcm').FCM;
var FCM=require('fcm-push');
// mysql
// MySQLdb.connect("localhost","yellowbox","dpfshdnqkrtm","yellowbox")    
var gcm = require('node-gcm');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'yellowbox',
    database: 'yellowbox',
    password: 'dpfshdnqkrtm',
	//dateStrings:true,
    multipleStatements: true // 멀티궈리
});


router.get('/aa', function(req, res){
	
	res.write('sss');
    res.end();
	  
});
function dbDelete(connection,table,where){
	return new Promise(function (resolve, reject) {
		
			var wherestr="";
			var keys=Object.keys(where);
			
			for(var i=0; i<keys.length; i++){
				wherestr+='`'+keys[i]+'`='+connection.escape(where[keys[i]]);
				if(i==keys.length-1){
					
				}else{
					wherestr+=' and ';
				}
			}
			
			var query = connection.query("delete from ??  where "+wherestr, [table], function(err,results) {
				//console.log(data)
				if (err) { 
					//console.log(err);
			        reject();
			        
			    }else{
			    	resolve(results.changedRows);
			    }
			});
		
		//console.log(query);
	});
}
function dbUpdate(connection,table,data,where){
	return new Promise(function (resolve, reject) {
		if(data==null || Object.keys(data).length==0){
			var query = connection.query(table, function(err,results) {
				//console.log(data)
				if (err) { 
					console.log(err);
			        reject();
			        
			    }else{
			    	resolve(results.changedRows);
			    }
			});
		}else {
			var wherestr="";
			var keys=Object.keys(where);
			
			for(var i=0; i<keys.length; i++){
				wherestr+='`'+keys[i]+'`='+connection.escape(where[keys[i]]);
				if(i==keys.length-1){
					
				}else{
					wherestr+=' and ';
				}
			}
			
			var query = connection.query("UPDATE ?? set ? where "+wherestr, [table,data], function(err,results) {
				//console.log(data)
				if (err) { 
					console.log(err);
			        reject();
			        
			    }else{
			    	resolve(results.changedRows);
			    }
			});
		}
		//console.log(query);
	});
}
function dbInsert(connection,table,data){
	return new Promise(function (resolve, reject) {
		var query=connection.query("INSERT INTO ?? set ?", [table,data], function(err,results) {
			//console.log(data)
			if (err) { 
				console.log(err);
		        reject();
		        
		    }else{
		    	resolve(results.insertId);
		    }
		});
		//console.log(query);
	});
}
var _checkadmin = function (req) {

	return new Promise(function (resolve, reject) {
		var atoken = req.body.token || req.query.token || req.headers['authorization'];	  
		if (atoken) {
			  var token = atoken.split(' ');
			  if( token.length==2 )
			    jwt.verify(token[1], 'ilovescotchyscotch', function(err, decoded) {      
			      if (err) reject( false);    
			      else {
			    	  if(req.decoded.memberType==='D'){
			    		  reject( true);
			    	  }else{
			    		  resolve( true);
			    	  }
			      }
			    });
			  else reject( false);

		 } else reject( false);
		
		
	});
}
function ensureAuthorized(req, res, next) {

	var atoken = req.body.token || req.query.token || req.headers['authorization'];

	  // decode token
	  //console.log(req.headers);
	  if (atoken) {
		  var token = atoken.split(' ');
		  if( token.length==2 ){
		    // verifies secret and checks exp
		    jwt.verify(token[1], 'ilovescotchyscotch', function(err, decoded) {      
		      if (err) {
		        return res.status(401).json({ type:'error',code:401, message: 'Failed to authenticate token.' });    
		      } else {
		        // if everything is good, save to request for use in other routes
		        req.decoded = decoded;    
		        next();
		      }
		    });
		  }else{
			  return res.status(401).json({ 
			        type: 'error', 
			        code:401,
			        message: 'No token provided1.' 
			  });
		  }

	  } else {

	    // if there is no token
	    // return an error
	    return res.status(401).json({ 
	        code: 401,
	        type:'error',
	        message: 'No token provided.' 
	    });
	    
	  }
}
function ensureAdmin(req,res,next){
	
		if(req.decoded.memberType==='D'){
			next();
		}else{
			return res.status(401).json({ code:401,type:'error', message: 'no auth.' });
		}
}
function authenticate(req, res,next) {
	if(req.body.userId && req.body.password) {
        
        if(req.body.userId=='admin' && req.body.password=='dnzlvotm'){
            		//var u = rows[0];
            		//var mypass = crypto.createHash("sha512").update(pass+u.salt).digest("hex");
            		
	            			var token = jwt.sign({memberSq:0,memberType:'D',hp:''}, 'ilovescotchyscotch', {
	            		          //expiresInMinutes: 1440 // 분 expires in 24 hours
	            		    });
	
	        		        // return the information including token as JSON
	        		        res.json({
	        		          token: token
	        		        });
		}else{
			res.status(401).json({"code":1001,"type":"error","message":"사용자 패스워드가 틀립니다1."});	
		}
            		
	}else{
		res.status(401).json({"code":1001,"type":"error","message":"사용자 패스워드가 틀립니다1."});
	} 
        
}
router.post('/authenticate', authenticate);

function gCodeTblList(req, res,next) {
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
         	connection.release();
		}else{
			var query = connection.query('SELECT * FROM codeTbl WHERE gCode = ? and status="A" order by sortOrder asc', [req.params.gCode], function(err, results) {
				 //if (err) res.status(500).json({type:'error',message:err,code:500});
		         //else res.json(results);
				 var rs= [];
		        	 _.each(results, function(one) {
			        		 //console.log(one);
		        		 //one.thumbnail=JSON.parse(one.thumbnail);
		        		 //one.message=JSON.parse(one.message);
		        		 //one.from=JSON.parse(one.from);
		        		 //one.to=JSON.parse(one.to);
		        		 //one.descList=JSON.parse(one.descList);
		        		 rs.push(one);
			      });
		         res.json(rs); 
				 connection.release();
			});
		}
	});
}

router.get('/CodeTbl/:gCode',gCodeTblList); 

function gCodeTbl(req, res,next) {
	//console.log(111111111);
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
         	connection.release();
		}else{
			var query = connection.query('SELECT * FROM codeTbl WHERE gCode = ? and `key`=?', [req.params.gCode,req.params.key], function(err, results) {
				 if (err) res.status(500).json({type:'error',message:err,code:500});
		         else {
					 
					 if(results.length==0){
						 res.json({});
					 }else{
						 
						 var rs= results[0];
						 //rs.thumbnail=JSON.parse(rs.thumbnail);
		         
		         	 		res.json(rs);
					 }
		        	 
		        	 // 
				 
		        	// res.json(results[0]);
		         }
				 
				 
				 connection.release();
			});
		}
	});
}

router.get('/CodeTbl/:gCode/:key',gCodeTbl);

function getCodeList(gCode){
	return new Promise(function (resolve, reject) { 
		pool.getConnection(function (err, connection) {
		
			connection.query("SELECT `key`,name,description FROM codeTbl WHERE gCode = ? and status='A' order by sortOrder asc",[gCode], function (err, rows) {
				
				if (err) {
					resolve([]);
				}else{
					if(rows.length==0){
						resolve([]);
					}else{
						resolve(rows);
					}
				}
				connection.release();
			});
			
		});
		
		
	});
}


router.get('/CodeTbl',function(req,res,next){
	var p = req.query.gCode;
	if(!p){
		res.json({});
	}
	var codes=[];
	if(Array.isArray(p)){
		codes=p;
	}else{
		codes=[p];
	}
	var promises=[];
	for(var i=0; i<codes.length; i++){
		promises.push(getCodeList(codes[i]));
	}
	//console.log(codes);
	Promise.all(promises).then(function(results){
    	var rs = {};
    	//console.log(results);
    	for(var i=0; i<codes.length; i++){
    		
    		rs[codes[i]]= results[i];
    		//console.log(i);
    	}
    	
    	res.json(rs);
		//console.log(results);
	},function(err){
		res.status(401).json({"code":401,"type":"error","message":"오류입니다."});
	});
	//console.log(req.query);
	//res.send('dddd');
});


//회원입력

function memberInsert(req, res, next) {
	var pass = req.body.password;
	var salt = Math.round((new Date().valueOf() * Math.random())) + "";
	var mypass = crypto.createHash("sha512").update(pass+salt).digest("hex");
	
	
	console.log(req.body);
	var crypt = require('../common/crypto');
	
	var param = req.body;
	
	param.pwd=mypass;
	param.salt=salt;
	delete param.password;
	delete param.password_c;
	pool.getConnection(function (err, connection) {
		if (err) {
            
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('INSERT INTO `member` set ?', param, function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',code:500,message:err});
		         }else{
		        	 
					//res.json(results[0]);
					res.json({changedRows:results.changedRows});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
	
}
router.post('/Member', ensureAuthorized,ensureAdmin,memberInsert);
// 회원 수정

function memberUpdate(req, res, next) {
	pool.getConnection(function (err, connection) {
		var param={
				status:req.body.status
		}
		var query = connection.query("update `santa`.`member` set ? where memberSq=?",[param,req.params.memberSq], function (err, rows) {
	        if (err) {
	        	//console.error("err : " + err);
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
	});
}
router.put('/Member/:memberSq', ensureAuthorized,ensureAdmin,memberUpdate);
// 회원 조회

function memberSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM member WHERE memberSq = ?', [req.params.memberSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
		        	 
		        	 res.json(results[0]);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Member/:memberSq',memberSelect);

/*
 * start : 0
 * length:10
 */

function memberList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where memberSq is not null ';
			if(req.query.hp) wsql+=' and hp="'+req.query.hp+'"';
			if(req.query.media) wsql+=' and media="'+req.query.media+'"';
			if(req.query.memberType) wsql+=' and memberType="'+req.query.memberType+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from member '+wsql+'; select  * from member '+wsql+' order by memberSq desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:results[1]});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Member',ensureAuthorized,ensureAdmin, memberList);

////////////////////////

//회원입력

function appleboxInsert(req, res, next) {
	//var pass = req.body.password;
	//var salt = Math.round((new Date().valueOf() * Math.random())) + "";
	//var mypass = crypto.createHash("sha512").update(pass+salt).digest("hex");
	
	
	//console.log(req.body);
	//var crypt = require('../common/crypto');
	
	//var param = req.body;
	
	//param.pwd=mypass;
	//param.salt=salt;
	//delete param.password;
	//delete param.password_c;
	//console.log(param)
	pool.getConnection(function (err, connection) {
		if (err) {
            
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var param={
				name:req.body.name,
				location:req.body.location,
				addr:JSON.stringify(req.body.addr),
				hp:req.body.hp,
				status:req.body.status,
				sshPort:req.body.sshPort,
				sshHost:req.body.sshHost,
				buyerSq:req.body.buyerSq,
				useType:req.body.userType,
				laundryFlag:req.body.laundryFlag

			};
			var query = connection.query('INSERT INTO `applebox` set ?', param, function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',code:500,message:err});
		         }else{
		        	 
		            res.json(results[0]);
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
	
}
router.post('/Applebox', ensureAuthorized,ensureAdmin,appleboxInsert);

router.post('/AppleboxAll', ensureAuthorized,function(req, res, next) {

    var param=req.body.applebox;
    param.addr=JSON.stringify(param.addr);

    pool.getConnection(function(err,connection){
        if(err){
            return next(err);
        }
        //sss;
        //console.log(param)
        var query = connection.query('insert into applebox set ?',param,function(err,result){
            
            if(err){
                connection.release();    
                return next(err);
            }
            boxes=[];
            for(var i =0; i<req.body.cabinet.length; i++){
                
                for(var j=0; j<req.body.cabinet[i].box.length; j++){
                    var box = req.body.cabinet[i].box[j];
                    box.yid=param.yid;
                    boxes.push([
                        param.yid, //yid
                        box.label,  //label
                        i,   // col
                        box.row, //row
                        box.jumper || 0,  //jumper
                        box.serial || 0,  //serial
                        box.status, // status
                        box.width, //width
                        box.height, //height
                        box.depth, //depth
                        box.kind, //kind
                    ]);    
                }
               
						}
						console.log(boxes);


            var query = connection.query('insert into locker(yid,label,col,`row`,jumper,serial,status,width,height,depth,kind) values ?',[boxes],function(err,result){
                connection.release();
                if(err){
                    
                    return next(err);
                }
                res.json(result);
            });
            
            

            
            //param.postdepartSq = result.insertId;
            
            //res.json(param);
        });
    });
});

// 회원 수정

function appleboxUpdate(req, res, next) {
	pool.getConnection(function (err, connection) {
		var param={
			name:req.body.name,
			location:req.body.location,
			addr:JSON.stringify(req.body.addr),
			hp:req.body.hp,
			status:req.body.status
					
		};

		var query = connection.query("update `applebox` set ? where yid=?",[param,req.params.yid], function (err, rows) {
	        if (err) {
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
	});
}
router.put('/Applebox/:yid', ensureAuthorized,ensureAdmin,appleboxUpdate);
// 회원 조회

function appleboxSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM applebox WHERE yid = ?', [req.params.yid], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
		        	 
					 var one = results[0];
					  one.bleName= getBleName(one.yid);
		        	 try{

						 one.addr = JSON.parse(one.addr);
						 
					 }catch(E){

					 }
		        	 res.json(one);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Applebox/:yid', ensureAuthorized,ensureAdmin,appleboxSelect);

function appleboxSettingSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM appleboxSetting WHERE yid = ?', [req.params.yid], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
		        	 
					 
		        	 res.json(results[0]);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/AppleboxSetting/:yid', ensureAuthorized,ensureAdmin,appleboxSettingSelect);
function appleboxSettingUpdate(req, res, next) {
	pool.getConnection(function (err, connection) {
		var param={
			yid:req.body.yid,
			usim:req.body.usim,
			hp:req.body.hp,
			dev_serial:req.body.dev_serial,
			boardCnt:req.body.boardCnt,
			installDate:req.body.installDate,
			memo:req.body.memo,
			networkType:req.body.networkType
					
		};

		var query = connection.query("INSERT INTO appleboxSetting set  ? ON DUPLICATE KEY UPDATE usim=VALUES(usim),hp=VALUES(hp),dev_serial=VALUES(dev_serial),boardCnt=VALUES(boardCnt),installDate=VALUES(installDate),memo=VALUES(memo), networkType=VALUES(networkType)",[param,req.params.yid], function (err, rows) {
	        if (err) {
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
	});
}
router.put('/AppleboxSetting/:yid', ensureAuthorized,ensureAdmin,appleboxSettingUpdate);

function getBleName(yid){
	var sprintf = require("sprintf-js").sprintf
	var ret = sprintf('%04X',parseInt(yid))
	//var end =  sprintf('%02X',ret.charAt(0)+ret.charAt(1));
	//var end =  sprintf('%02X',ret.charAt(2)+ret.charAt(3));
	var sum=0;
	for(var i=0; i<ret.length; i++){
			sum+=ret.charCodeAt(i);
	}
		//console.log(sum);
	return 'O2OX'+sprintf('%02X',sum)+ret;
}
/*
	yid=10000
	ret =  "{0:04X}".format(yid)
	sum=0
	for c in ret:
	    sum+=ord(c)
		
	return "O2OX"+"{0:02X}".format(sum)+ret	

*/
/*
 * start : 0
 * length:10
 */

function appleboxList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	//console.log(req.query);
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where yid is not null ';
			if(req.query.yids){
				if(Array.isArray(req.query.yids)){
					wsql+=' and yid in('+req.query.yids.join(',')+')';
				}else{
					wsql+=' and yid = '+req.query.yids;
				}
			}
			if(req.query.name) wsql+=' and (name like "%'+req.query.name+'%" or yid="'+req.query.name+'")';
			if(req.query.buyerSq) wsql+=' and buyerSq='+req.query.buyerSq;
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			console.log(wsql);
			var query = connection.query('select count(*) cnt from applebox '+wsql+'; select  * from applebox '+wsql+' order by yid desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
		        	 	//console.log(results[0][0].cnt);
					var rs= [];
		        	 _.each(results[1], function(one) {
						 try{
							 one.addr = JSON.parse(one.addr);
						 }catch(X){}
		        		 rs.push(one);
			      });
						 //console.log(typeof(results[1][0].regDate));
		             res.json({
						 
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Applebox',ensureAuthorized,ensureAdmin, appleboxList);

function appleboxLogList(req, res, next) {
	//var start = parseInt(req.query.page||'1')-1;
	//var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where yid='+req.query.yid;
			
			//console.log(wsql);
			var query = connection.query('select  * from appleboxLog '+wsql+' order by regDate desc', [], function(err, results) {
			  // ...
			  	
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
		        	 	//console.log(results[0][0].cnt);
		             res.json(results);
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/AppleboxLog',ensureAuthorized,ensureAdmin, appleboxLogList);


function appleboxLogInsert(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
            
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var param={
				description:req.body.description,
				yid:req.body.yid
			};
			var query = connection.query('INSERT INTO `appleboxLog` set ?', param, function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',code:500,message:err});
		         }else{
		        	 
		            res.json(results[0]);
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
	
}
router.post('/AppleboxLog', ensureAuthorized,ensureAdmin,appleboxLogInsert);

function appleboxLogDelete(req, res, next) {

    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var query = connection.query("delete from appleboxLog where appleboxLogSq=?",[req.params.appleboxLogSq], function (err, rows) {
            if (err) {
                //console.error("err : " + err);
                res.status(500).json({type:'error',message:err,code:500});
            }else{
                res.json({affectedRows:rows.affectedRows});
            }
            connection.release();
		});
		//console.log(query);
        
	});
}
router.delete('/AppleboxLog/:appleboxLogSq',  ensureAuthorized,ensureAdmin,appleboxLogDelete);
function lockerList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where yid is not null';
			if(req.query.yid) wsql+=' and  yid='+req.query.yid ;
			if(req.query.saveName) wsql+=' and saveName="'+req.query.saveName+'"';
			if(req.query.toHp) wsql+=' and toHp="'+req.query.toHp+'"';
			if(req.query.toName) wsql+=' and toName="'+req.query.toName+'"';
			if(req.query.saveHp) wsql+=' and saveHp="'+req.query.saveHp+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.pwd) wsql+=' and pwd="'+req.query.pwd+'"';
			if(req.query.uuid) wsql+=' and uuid="'+req.query.uuid+'"';

			//if(req.query.saveDate) wsql+=' and saveDate like "'+req.query.saveDate+'%"';

			if(req.query.dwhere=='A'){
				if(req.query.saveDate) wsql+=' and saveDate>="'+new Date(req.query.saveDate+' GMT+0900 (KST)').toISOString()+'"';
				if(req.query.saveDate) wsql+=' and saveDate<="'+new Date(req.query.saveDate+' 23:59:59 GMT+0900 (KST)').toISOString()+'"';
			}else {
				if(req.query.saveDate) wsql+=' and saveDate<="'+new Date(req.query.saveDate+' GMT+0900 (KST)').toISOString()+'"';
			}

			//if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			//var query = connection.query('select  * from locker '+wsql+' order by col asc,row asc ', [], function(err, results) {
				var query = connection.query('select count(*) cnt from locker '+wsql+'; select  * from locker '+wsql+' order by saveDate desc  limit ? , ? ', [start*length,length], function(err, results) {	
			  // ...
			  	
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
		        	 	//console.log(results[0][0].cnt);
					 //res.json(results);
					 res.json({
						"draw": parseInt(req.query.draw),
						"recordsTotal": results[0][0].cnt,
						"recordsFiltered": results[0][0].cnt,data:results[1]});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Locker',ensureAuthorized,ensureAdmin, lockerList);

function appleboxCount(req, res, next) {
	//var start = parseInt(req.query.page||'1')-1;
	//var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where buyerSq='+req.params.buyerSq;
			
			//console.log(wsql);
			var query = connection.query('select  count(*) cnt from applebox '+wsql, [], function(err, results) {
			  // ...
			  	
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
		        	 	//console.log(results[0][0].cnt);
		             res.json(results[0].cnt);
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/AppleboxCount/:buyerSq',ensureAuthorized,ensureAdmin, appleboxCount);

function lockerInsert(req, res, next) {
	
	var param = req.body;
	param.yid= req.params.yid;
	console.log(param);
	pool.getConnection(function (err, connection) {
		if (err) {
			
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('INSERT INTO `locker` set ?', param, function(err, results) {
			  // ...
				 if (err) {
					 console.log(err);
		         	res.status(500).json({type:'error',code:500,message:err});
		         }else{
		        	 
		            res.json(results[0]);
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
	
}
router.post('/Locker/:yid', ensureAuthorized,ensureAdmin,lockerInsert);
function dbSelect(tableName,where){
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			
			var query=connection.query("select * from ?? where ?",[tableName,where], function (err, rows) {
				
				if (err) {
					//console.log(9999);
					reject({});
				}else{
					//console.log(rows);
					if(rows.length==0){
						resolve(undefined);
					}else{
						resolve(rows[0]);
					}
				}
				connection.release();
			});
			
			//console.log(query);
		});
		
		
	});
}
function lockerUpdate(req, res, next) {

	
	Promise.all([dbSelect('applebox',{yid:req.body.yid})]).then(function(rsdata){
		
		apple = rsdata[0];
		pool.getConnection(function (err, connection) {
			var param={
				saveName:req.body.saveName,
				saveHp:req.body.saveHp,
				toName:req.body.toName,
				toHp:req.body.toHp,
				status:req.body.status
			};
			//var dateFormat = require('dateformat');
		
			//console.log(req.body);
			//req.body.saveDate = dateFormat(Date.parse(req.body.saveDate), "yyyy-MM-dd HH:mm:ss");
			if (err) {
         		res.status(500).json({type:'error',message:err,code:500});
			}else {
				var isSync = req.body.isSync;
				if( isSync)
					delete req.body.isSync;

				//if	(req.body.saveDate ){
				//	delete req.body.saveDate; 
				//}
				var query = connection.query("update locker set ? where yid=? and jumper=? and serial=?",[param,req.body.yid,req.body.jumper,req.body.serial], function (err, rows) {
					if (err) {
						res.status(500).json({"code":10,"type":"error","message":err});
					}else{
						if(rows.changedRows==0){
							res.status(404).json({"code":10,"type":"error","message":err});
						}else{
							res.json({changedRows:rows.changedRows});
							if(isSync=='Y') {
								sendPushTablet(apple.regId,{'command':'LOCKERUPDATE','data':req.body});
							}
						} 
					}
					
					connection.release();
				}); 
				console.log(query);
			}
		});
	},function(err){
		console.log(err);
	});
}
router.put('/Locker', ensureAuthorized,lockerUpdate);
function shopSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM shop WHERE shopSq = ?', [req.params.shopSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 
					 one = results[0];
					 console.log(one.imageUrl);
		        	 one.addr = JSON.parse(one.addr);
		        	 try{
						 one.imageUrl = JSON.parse(one.imageUrl);
					 }catch(Ex){}
		        	 res.json(one);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Shop/:shopSq', ensureAuthorized,ensureAdmin,shopSelect);

function shopList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	var wsql='where shopSq is not null ';
	if(req.query.userId) wsql+=" and userId='"+req.query.userId+"'";
	if(req.query.kind) {
		
		if(Array.isArray(req.query.kind)){
			wsql+=" and kind in('"+req.query.kind.join("','")+"')";
		}else{
			wsql+=" and kind='"+req.query.kind+"'";
		}	
		
	}
	//console.log(req.query.kind);
	
	//console.log(wsql);
	if(req.query.status) wsql+=" and status='"+req.query.status+"'";
	if(req.query.startDate) wsql+=" and regDate>='"+req.query.startDate+"'";
	if(req.query.endDate) wsql+=" and regDate<='"+req.query.endDate+"  23:59:59'";
	pool.getConnection(function (err, connection) {
		if (err) {
         	//res.status(500).json({type:'error',message:err,code:500});
			 throw err;
		}
			
		
		//console.log(wsql);
		var query = connection.query('select count(*) cnt from shop '+wsql+'; select  * from shop '+wsql+' order by shopSq desc  limit ? , ? ', [start*length,length], function(err, results) {
			// ...
				if (err) {
				//res.status(500).json({type:'error',message:err,code:500});
					connection.release();
					throw err;
				}else{
					var rs= [];
					_.each(results[1], function(one) {
							//console.log(one);
						//one.thumbnail=JSON.parse(one.thumbnail);
						//one.message=JSON.parse(one.message);
						//one.from=JSON.parse(one.from);
						//one.to=JSON.parse(one.to);
						//one.descList=JSON.parse(one.descList);
						one.addr = JSON.parse(one.addr);
						rs.push(one);
				});
				

					//console.log(results[0][0].cnt);
					res.json({
						"draw": parseInt(req.query.draw),
						"recordsTotal": results[0][0].cnt,
						"recordsFiltered": results[0][0].cnt,data:rs});
				
				}
				connection.release();
		});
			//console.log(query);
		
	});
}
router.get('/Shop',ensureAuthorized,ensureAdmin, shopList);

function shopUpdate(req, res, next) {

	var param={
		shopId:req.body.shopId, // 상점 아이디 
		passwd:req.body.passwd, // 패스워드 
		companyName:req.body.companyName, //회사명 
		preName:req.body.preName, //대표자 
		licenseNumber:req.body.licenseNumber, // 사업자등록번호 
		kind:req.body.kind, // 상점 유형 
		addr:JSON.stringify(req.body.addr), // 주소 
		margin:req.body.margin, // 마진 
		minMoney:req.body.minMoney , //배달가믕금액 
		account:req.body.account, //정산 계좌번호 
		imageUrl:null , // 이미지를 처리 과정을 거쳐 저장 
		shipSDate : req.body.shipSDate, // 배달 시작일 
		shipEDate : req.body.shipEDate, // 배달 마감일 
		shipPlace: req.body.shipPlace, // 배달가능지역 
		intro:req.body.intro, // 마트소개글 
		tel:req.body.tel, // 회사전화번호 
		email:req.body.email, // 담당자 이메일 
		name:req.body.name, // 담당자명 
		hp:req.body.hp, // 담당자 연락처 
		status:req.body.status,		 //상태
		sms:req.body.sms,
		smsTemplate:req.body.smsTemplate
	};
	if (req.body.imageUrl && req.body.imageUrl.length>0){
		var upload = require('./upload');
		//console.log(upload);
		upload.savePermantFiles(req.body.imageUrl).then(function(results){
			pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					param.imageUrl=JSON.stringify(results);
					dbUpdate(connection,'shop',param,{
							shopSq:req.params.shopSq
					}).then(function(results){
						res.json({changedRows:results});
						connection.release();
					},function(err){
						res.status(500).json({"code":10,"type":"error","message":err});
						connection.release();
					});
					
				}
			}); 
		},function(err){
			res.status(500).json({type:'error',message:err,code:500});
		});

	}else{
		pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					
					dbUpdate(connection,'shop',param,{
							shopSq:req.params.shopSq
					}).then(function(results){
						res.json({changedRows:results});
						connection.release();
					},function(err){
						res.status(500).json({"code":10,"type":"error","message":err});
						connection.release();
					});
					
				}
		}); 
	}
}
router.put('/Shop/:shopSq',  ensureAuthorized,ensureAdmin,shopUpdate);


function shopInsert(req, res, next) {
	var param={
		shopId:req.body.shopId, // 상점 아이디 
		passwd:req.body.passwd, // 패스워드 
		companyName:req.body.companyName, //회사명 
		preName:req.body.preName, //대표자 
		licenseNumber:req.body.licenseNumber, // 사업자등록번호 
		kind:req.body.kind, // 상점 유형 
		addr:JSON.stringify(req.body.addr), // 주소 
		margin:req.body.margin, // 마진 
		minMoney:req.body.minMoney , //배달가믕금액 
		account:req.body.account, //정산 계좌번호 
		imageUrl:null , // 이미지를 처리 과정을 거쳐 저장 
		shipSDate : req.body.shipSDate, // 배달 시작일 
		shipEDate : req.body.shipEDate, // 배달 마감일 
		shipPlace: req.body.shipPlace, // 배달가능지역 
		intro:req.body.intro, // 마트소개글 
		tel:req.body.tel, // 회사전화번호 
		email:req.body.email, // 담당자 이메일 
		name:req.body.name, // 담당자명 
		hp:req.body.hp, // 담당자 연락처 
		status:'A',		 //상태
		sms:req.body.sms,
		smsTemplate:req.body.smsTemplate
		
	};
	if (req.body.imageUrl && req.body.imageUrl.length>0){
		var upload = require('./upload');
		upload.savePermantFiles(req.body.imageUrl).then(function(results){
			pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					param.imageUrl=JSON.stringify(results);
					dbInsert(connection,'shop',param).then(function(results){
						res.json({insertId:results});
						connection.release();
					},function(err){
						connection.release();
						res.status(500).json({"code":10,"type":"error","message":err});
					});
					
				}
			}); 
		},function(err){
			res.status(500).json({type:'error',message:err,code:500});
		});

	}else{
		pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					
					dbInsert(connection,'shop',param).then(function(results){
						res.json({insertId:results});
						connection.release();
					},function(err){
						connection.release();
						res.status(500).json({"code":10,"type":"error","message":err});
					});
					
				}
		}); 
	}
	
}
router.post('/Shop',  ensureAuthorized,ensureAdmin,shopInsert);
////////////////////////////////
function rfidSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM rfid WHERE tagid = ?', [req.params.tagid], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 one = results[0];
		        	 //one.addr = JSON.parse(one.addr);
		        	
		        	 res.json(one);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Rfid/:tagid', ensureAuthorized,ensureAdmin,rfidSelect);

function rfidList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where tagid is not null ';
			if(req.query.tagid) wsql+=' and tagid="'+req.query.tagid+'"';
			if(req.query.hp) wsql+=' and hp="'+req.query.hp+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from rfid '+wsql+'; select  * from rfid '+wsql+' order by regDate desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
			        		 //console.log(one);
		        		 //one.thumbnail=JSON.parse(one.thumbnail);
		        		 //one.message=JSON.parse(one.message);
		        		 //one.from=JSON.parse(one.from);
		        		 //one.to=JSON.parse(one.to);
		        		 //one.descList=JSON.parse(one.descList);
						 //one.addr = JSON.parse(one.addr);
		        		 rs.push(one);
			      });
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Rfid',ensureAuthorized,ensureAdmin, rfidList);

function rfidUpdate(req, res, next) {

	
	//console.log(param);
	//console.log(req.body.addr);
	pool.getConnection(function (err, connection) {
		var param={
			status:req.body.status,
			
			name:req.body.name,
			hp:req.body.hp
					
		};
		var query = connection.query("update rfid set ? ,modDate=now() where tagid=?",[param,req.params.tagid], function (err, rows) {
	        if (err) {
	        	//console.error("err : " + err);
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
		
	});
}
router.put('/Rfid/:tagid',  ensureAuthorized,ensureAdmin,rfidUpdate);


function rfidInsert(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
		}else{
			var param={
				tagid:req.body.tagid,
				subject:req.body.subject,
				name:req.body.name,
				hp:req.body.hp,
				numbering:req.body.numbering,
				status:'A'		
			};
			var query = connection.query('INSERT INTO rfid set ?', param, function(err, results) {
			  // ...
				 if (err) {
					 
					 res.status(500).json({"code":10,"type":"error","message":err});
		         }else{
		        	 
		            res.json({insertId:results.insertId});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	}); 
}
router.post('/Rfid/:rfid',  ensureAuthorized,ensureAdmin,rfidInsert);


function houseDelete(req, res, next) {

    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var query = connection.query("delete from house where yid=? and dong=? and ho=?",[req.params.yid,req.params.dong,req.params.ho], function (err, rows) {
            if (err) {
                //console.error("err : " + err);
                res.status(500).json({type:'error',message:err,code:500});
            }else{
                res.json({affectedRows:rows.affectedRows});
            }
            connection.release();
		});
		//console.log(query);
        
	});
}
router.delete('/House/:yid/:dong/:ho',  ensureAuthorized,ensureAdmin,houseDelete);

function randomString(len, an){
    an = an&&an.toLowerCase();
    var str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
    for(;i++<len;){
      var r = Math.random()*(max-min)+min <<0;
      str += String.fromCharCode(r+=r>9?r<36?55:61:48);
    }
    return str;
}

function housePasswords(start_ho,end_ho){
	ret ={};
	rsize=end_ho-start_ho;
	/*
	for(var i=start_ho; i<end_ho; i++){
		var pass = randomString(4,'N');
		ret[pass]=pass;

	}*/
	for(var i=0; i<1000; i++){
		if( Object.keys(ret).length >=rsize){
			break;
		}
		var pass = '0'+randomString(4,'N');
		ret[pass]=pass;

	}
	return Object.keys(ret);
	
}
function houseInsert(req, res, next) {
	
	var dong = req.body.dong;
	var start_ho = parseInt(req.body.start_ho);
	var end_ho=parseInt(req.body.end_ho);
	
	pool.getConnection(function (err, connection) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
		}else{
			var passwds=housePasswords(start_ho,end_ho);
			var values = [];
			var inc=0;
			for(var i =start_ho; i<end_ho; i++){
				values.push([req.params.yid,dong,i,passwds[inc]]);
				inc++;
			}
 			connection.query("INSERT INTO house (yid,dong, ho,pwd) VALUES ?", [values], function(err) {
			  // ...
				 if (err) {
					 
					 res.status(500).json({"code":10,"type":"error","message":err});
		         }else{
		        	 
		            res.json({});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	}); 
}
router.post('/House/:yid',  ensureAuthorized,ensureAdmin,houseInsert);

function boxtypeList(req, res, next) {

	var boxtypes=require('../boxtypes');
	
	res.json(boxtypes);
}
router.get('/Boxtypes', ensureAuthorized,ensureAdmin,boxtypeList);


function houseList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where yid is not null ';
			//if(req.query.companyName) wsql+=' and companyName like "%'+req.query.companyName+'%"';
			if(req.query.yid) wsql+=' and yid="'+req.query.yid+'"';
			if(req.query.dong) wsql+=' and dong="'+req.query.dong+'"';
			//if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			//if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from house '+wsql+'; select  * from house '+wsql+' order by dong,ho   limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:results[1]});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/House',ensureAuthorized,ensureAdmin, houseList);

function buyerSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM buyer WHERE buyerSq = ?', [req.params.buyerSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 one = results[0];
					 try{
		        	 	one.addr = JSON.parse(one.addr);
					 }catch(E){
						
					 }
		        	
		        	 res.json(one);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Buyer/:buyerSq', ensureAuthorized,ensureAdmin,buyerSelect);

function buyerList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where buyerSq is not null ';
			if(req.query.companyName) wsql+=' and companyName like "%'+req.query.companyName+'%"';
			if(req.query.userId) wsql+=' and userId="'+req.query.userId+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from buyer '+wsql+'; select  * from buyer '+wsql+' order by buyerSq desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
			        	 //console.log(one);
		        		 //one.thumbnail=JSON.parse(one.thumbnail);
		        		 //one.message=JSON.parse(one.message);
		        		 //one.from=JSON.parse(one.from);
		        		 //one.to=JSON.parse(one.to);
		        		 //one.descList=JSON.parse(one.descList);
						 try{
							 one.addr = JSON.parse(one.addr);
						 }catch(x){
							 //console.log(x);
						 }
		        		 rs.push(one);
			      	});
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Buyer',ensureAuthorized,ensureAdmin, buyerList);

function buyerUpdate(req, res, next) {

	
	//console.log(param);
	//console.log(req.body.addr);
	pool.getConnection(function (err, connection) {
		var param ={
			companyName:req.body.companyName,
			name:req.body.name,
			addr:JSON.stringify(req.body.addr),
			tel:req.body.tel,
			status:req.body.status,
			//companyName:req.body.companyName,
			parcelSq:req.body.parcelSq,
			laundrySq:req.body.laundrySq,
			passwd:req.body.passwd
		};
		var query = connection.query("update buyer set ? where buyerSq=?",[param,req.params.buyerSq], function (err, rows) {
	        if (err) {
	        	//console.error("err : " + err);
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
		
	});
}
router.put('/Buyer/:buyerSq', ensureAuthorized,buyerUpdate);


function buyerInsert(req, res, next) {
	
	var param={
			name:req.body.name,
			addr:JSON.stringify(req.body.addr),
			companyName:req.body.companyName,
			status:req.body.status,
			tel:req.body.tel,
			laundrySq:req.body.laundrySq,
			parcelSq:req.body.parcelSq,
			buyerId:req.body.buyerId,
			passwd:req.body.passwd
			
	}
	pool.getConnection(function (err, connection) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
		}else{
			var query = connection.query('INSERT INTO buyer set ?', param, function(err, results) {
			  // ...
				 if (err) {
					 res.status(500).json({"code":10,"type":"error","message":err});
		         }else{
		        	 
		            res.json({insertId:results.insertId});
		            
		         }
				 connection.release();
			});
			console.log(query);
		}
	});
}
router.post('/Buyer',  ensureAuthorized,ensureAdmin,buyerInsert);

//{"yid":0,"jumper":0,"serial":0,"status":"A","saveHp":"","saveName":"","saveDate":"","toHp":"","toName":"","boxName":"","pwd":"","label":""}
function thingsInsert(req, res, next) {
	var param={
		thingsSq:req.body.thingsSq,
		reqItem: req.body.reqItem,
		things: JSON.stringify(req.body.things),
		yid:req.body.yid,
		//price:req.body.price,//총판매가격
		//description: req.body.description,//비고
  		//title:req.body.title,//제목(자동생성)
  		//addr:JSON.stringify(req.body.addr),//주소
  		shopSq:req.body.shopSq,//상점아이디
  		memberSq:req.body.memberSq,//사용자아이디
		photos:'[]',
		prices:'[]',
		confirm:req.body.confirm,
		saveLocker:JSON.stringify(req.body.saveLocker),
		method:req.body.method | 'A',
		visitDate: req.body.visitDate?Date.parse(req.body.visitDate):null,
		locker:'{"yid":0,"jumper":0,"serial":0,"status":"A","saveHp":"","saveName":"","saveDate":"","toHp":"01066666666","toName":"세탁을 위한사람들","boxName":"","pwd":"","label":""}'
		//toName:''
  		//pgCode:req.body.pgCode,//피지코드
		//kind:req.body.kind,
		//payType:req.body.payType

	};
	//console.log(req.body);
	//if(!req.body.orderCd){
	//	param.orderCd=getOrderNumber();
	//}
	
	pool.getConnection(function (err, connection) {
		if (err) {
			//connectin.release();
			throw err;
		}
		/*var param1={
			thingsSq:req.body.thingsSq,
			shopSq:req.body.shopSq,
			photos:'[]',
			prices:'[]',
			status:req.body.status
		};
		*/
		var jobs=[ 
				dbInsert(connection,'things',param)
				//dbInsert(connection,'acceptance',param1)
		];
		Promise.all(jobs).then(function(res2){
			res.json({success:true,data:param});	
			connection.release();
		},function(err){
			
			//
			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	}); 
		
	
}
router.post('/Things/:thingsSq',  ensureAuthorized,ensureAdmin,thingsInsert);

function thingsList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where thingsSq is not null ';
			if(req.query.memberSq) wsql+=' and memberSq='+req.query.memberSq;	
			if(req.query.shopSq) wsql+=' and shopSq='+req.query.shopSq;
			if(req.query.hp || req.query.name) {
				var tsql='memberSq is not null'

				if(req.query.hp){
					tsql+=' and hp="'+req.query.hp+'"';
				}
				if(req.query.name){
					tsql+=' and name="'+req.query.name+'"';
				}
				wsql+='and memberSq in (select memberSq from member where '+tsql+')';
			}
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from things '+wsql+'; select  * from things '+wsql+' order by regDate desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
			        	 try{
							 one.things = JSON.parse(one.things);
							 one.locker = JSON.parse(one.locker);
						 }catch(E){
						 }
		        		 rs.push(one);
			      	});
		          
				  res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			
		}
	});
}
router.get('/Things',ensureAuthorized,ensureAdmin, thingsList);

function thingsUpdate(req, res, next) {

	
	//console.log(param);
	//console.log(req.body.addr);
	pool.getConnection(function (err, connection) {
		var param ={
			status:req.body.status,
			shopSq:req.body.shopSq
		};
		var query = connection.query("update things set ? where thingsSq=?",[param,req.params.thingsSq], function (err, rows) {
	        if (err) {
	        	
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
		
	});
}
router.put('/Things/:thingsSq', ensureAuthorized,thingsUpdate);


function thingsSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM things WHERE thingsSq = ?', [req.params.thingsSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 //console.log(results);

					if(results.length==0){
						//res.status(404).json({type:'error',message:'no data',code:404});
						res.json({});
					}else{
						var one = results[0];
						try{
							one.locker = JSON.parse(one.locker);
							one.things = JSON.parse(one.things);
							one.saveLocker = JSON.parse(one.saveLocker);
							one.prices = JSON.parse(one.prices);
							one.photos = JSON.parse(one.photos);
						}catch(X){
							console.log(X);
						}
						res.json(one);
					}
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Things/:thingsSq', ensureAuthorized,ensureAdmin,thingsSelect);


function sendPushTablet(target, data){
	console.log(target);
	 var apiKey='AAAAGV33Ils:APA91bG4nuYybd-KAY32VNwh8BBi6-076FX-xhhjW9R3A3gPX0HvFjB_pZgGP2mOa0Dx4RfNia_yM6Dg77KNLgX-kGys2liCWZ9ZmZr70VxP6avhK0lyx-licw_9ZFJj1yssooXYNFx6 ';

	var fcm = new FCM(apiKey);


	var message = {
    	//registration_id:'f-5uTQ9snO0:APA91bGHsmsqVnVC49jtuU84kQoDFOebGW4IYgWFKnUOQbHvQR_HLXTozeLOlKqZqgOTfZeNT8VTo_lbYpjwINPEzjTwWwq1fZ2cL8LBxwoLWwzmCiM3iwXaBTjNYu6uuj4_OxGFL78q',
		registration_id:target,
    	// apple 
		collapse_key: 'Collapse key', 
    	'data': JSON.stringify(data)
	};     
	fcm.send(message, function(err, messageId){
		if (err) {
      		console.log(err)
			
		} else {
			console.log("Sent with message ID: ", messageId);
		}
	});
}
router.put('/Locker/:yid', ensureAuthorized,ensureAdmin,lockerUpdate);


/*

curl --header "Authorization: key=AIzaSyD39bcaQU8ThRuGcjJugkoxUpnzH9LOxTc" \
       --header Content-Type:"application/json" \
       https://gcm-http.googleapis.com/gcm/send \
       -d "{ \"data\" : { \"title\" : \"MyCoolApp\", \"text\" : \"MessageText\", \"extra\":{\"url\":\"someurl.js\"}}, \"to\" : \"ckCl7POKo9c:APA91bFw28eXA5HNuBIjwEey-He1wUE3Hl6M_jjlGloaReThJM-a7oluxKz8jdYv_JZMPl1DDKHAUskrbAQ2wKgcikyejvBGwLokF_Lv29yKzC3nSAr9NfZlTBU6jDSXvDnH7Q6Oqr_Z\" }"

*/
//AIzaSyDvFT05Og2oWCUn99retwhyqbIG7cTMJow
//332512205848
function gcmMessage(req,res,next){
	var gcm = require('node-gcm');
		var message = new gcm.Message({
		collapseKey: 'demo',
		delayWhileIdle: true,
		timeToLive: 3,
		data: {
			lecture_id:"notice",
			title:"제목입니다",
			desc: "설명입니다",
			param1: '첫번째파람',
			param2: '두번째파람'
		}
	});

	var server_access_key = 'AIzaSyD39bcaQU8ThRuGcjJugkoxUpnzH9LOxTc';
	var sender = new gcm.Sender(server_access_key);
	var registrationIds = [ ];     // 여기에 pushid 문자열을 넣는다.

	registrationIds = ['dcI4s09cXZU:APA91bHtHxCi35LTg6KXV2vuACB5qB23Wx2yEODfezlYuVj7sJwoVlrIAIsUfcBbsZQqXt2RfW_7PIrjtNTRfji3wEP_WxOK2VZ1emQJA5w7Hf7nlcwfELK2naTmM_l-__b7AYTgUAZC'];

	sender.send(message, registrationIds, 4, function (err, result) {
		console.log(result); 
	});
}
router.post('/Gcm', ensureAuthorized,ensureAdmin,gcmMessage);

function takeLogList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where takeSq is not null ';
			if(req.query.yid) wsql+=' and yid='+req.query.yid;
			if(req.query.uuid) wsql+=" and uuid='"+req.query.uuid+"'";
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.saveHp) wsql+=' and saveHp="'+req.query.saveHp+'"';
			if(req.query.toHp) wsql+=' and toHp="'+req.query.toHp+'"';
			if(req.query.usage) wsql+=' and `usage`="'+req.query.usage+'"';
			//if(req.query.regDate) wsql+=' and regDate>="'+new Date(req.query.regDate+' GMT+0900 (KST)').toISOString()+'"';
			//if(req.query.regDate) wsql+=' and regDate<="'+new Date(req.query.regDate+' 23:59:59 GMT+0900 (KST)').toISOString()+'"';
			/*
			if(req.query.regDate) {
				
				wsql+=' and regDate>="'+req.query.regDate+'"';
				wsql+=' and regDate<="'+req.query.regDate+'  23:59:59"';
			}*/
			if(req.query.startDate) wsql+=' and saveDate>="'+new Date(req.query.startDate+' 00:00:00 GMT+0900 (KST)').toISOString()+'"';
			if(req.query.endDate) wsql+=' and saveDate<="'+new Date(req.query.endDate+' 23:59:59 GMT+0900 (KST)').toISOString()+'  23:59:59"';

			//console.log(wsql);
			var query = connection.query('select count(*) cnt from takeLog '+wsql+'; select  * from takeLog '+wsql+' order by takeSq desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
		        		 rs.push(one);
			      });
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/TakeLog',ensureAuthorized,ensureAdmin, takeLogList);


function saveLogList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where saveSq is not null ';
			if(req.query.yid) wsql+=' and yid='+req.query.yid;
			if(req.query.toDong) wsql+=" and toDong='"+req.query.toDong+"'";
			if(req.query.toHo) wsql+=" and toHo='"+req.query.toHo+"'";
			if(req.query.uuid) wsql+=" and uuid='"+req.query.uuid+"'";
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.saveHp) wsql+=' and saveHp="'+req.query.saveHp+'"';
			if(req.query.toHp) wsql+=' and toHp="'+req.query.toHp+'"';
			if(req.query.usage) wsql+=' and `usage`="'+req.query.usage+'"';
			if(req.query.saveName) wsql+=' and `saveName`="'+req.query.saveName+'"';
			/*
			if(req.query.saveDate) {
				wsql+=' and saveDate>="'+new Date(req.query.saveDate+' 00:00:00 GMT+0900 (KST)').toISOString()+'"';
				wsql+=' and saveDate<="'+new Date(req.query.saveDate+' 23:59:59 GMT+0900 (KST)').toISOString()+'"';
			}*/
			if(req.query.startDate) wsql+=' and saveDate>="'+new Date(req.query.startDate+' 00:00:00 GMT+0900 (KST)').toISOString()+'"';
			if(req.query.endDate) wsql+=' and saveDate<="'+new Date(req.query.endDate+' 23:59:59 GMT+0900 (KST)').toISOString()+'"';

			console.log(wsql);
			var query = connection.query('select count(*) cnt from saveLog '+wsql+'; select  * from saveLog '+wsql+' order by saveSq desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
		        		 rs.push(one);
			      });
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/SaveLog',ensureAuthorized,ensureAdmin, saveLogList);

function raspCall(yid,command,auth_str,datas){
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			if (err) {
				res.status(500).json({type:'error',message:err,code:500});
			}else{
				var query = connection.query('select sshPort from applebox where yid=?', [yid], function(err, yb) {
					if (err) {
						//res.status(500).json({type:'error',message:err,code:500});
						pool.release();
						reject(err);
						
					}else{

						var sshclient = require('node-sshclient');
						var ssh = new sshclient.SSH({
							hostname: 'localhost'
							, port: yb[0].sshPort
							,login_name:'pi'
							
						});
						param = "-X POST --header 'Content-Type: application/json' --header 'Authorization: "+auth_str+"' --header 'Accept: application/json' 'http://localhost:8800/v1/'+command+'/' -d '"+JSON.stringify(datas)+"'";
						
						ssh.command('curl' ,param,  function(procResult) {
							try{
								resolve(JSON.parse(procResult.stdout));
							}catch(E){
								
								reject(E);
							}
						});
					}
					connection.release();
				});
			}
		});
	});
		
}



function openToAdminAtRasp(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			
			var query = connection.query('select sshPort from applebox where yid=?', [req.params.yid], function(err, yb) {
				 if (err) {
		         	//res.status(500).json({type:'error',message:err,code:500});
                     errorHandler(err);
		         }else{

					var sshclient = require('node-sshclient');
					var ssh = new sshclient.SSH({
						hostname: 'localhost'
						, port: yb[0].sshPort
						,login_name:'pi'
						
					});
					param = "-X POST --header 'Content-Type: application/json' --header 'Authorization: "+req.header('Authorization')+"' --header 'Accept: application/json' 'http://localhost:8800/v1/openToAdmin/' -d '"+JSON.stringify(req.body)+"'";
					
					ssh.command('curl' ,param,  function(procResult) {
						console.log(procResult);
						res.json(JSON.parse(procResult.stdout));
					});
				 }
				 connection.release();
			});
		}
	});
}
router.post('/:yid/OpenToAdmin', ensureAuthorized,openToAdminAtRasp);

function sendSms(req, res, next) {
	var data={
			dest_phone:req.body.hp, 
			send_phone:config.feedbackPhone, 
			msg_body:req.body.content,
			uuid:req.body.uuid
	};


	pool.getConnection(function (err, connection1) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
			connection1.release();
		}else{
			connection1.query("INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", data, function(err,results) {
			//connection1.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", data, function(err,results1) {
				//console.log(data)
				res.json({success:true});
				connection1.release();
			});
			
		}
	});	
}

router.post('/SendSms',ensureAuthorized,ensureAdmin,sendSms);




function sendFcm(req,res,next){
	var FCM=require('fcm-push');
	var apiKey = 'AAAAGV33Ils:APA91bG4nuYybd-KAY32VNwh8BBi6-076FX-xhhjW9R3A3gPX0HvFjB_pZgGP2mOa0Dx4RfNia_yM6Dg77KNLgX-kGys2liCWZ9ZmZr70VxP6avhK0lyx-licw_9ZFJj1yssooXYNFx6';
	var fcm = new FCM(apiKey);
	fcm.send(req.body, function(err, messageId){
		if (err) {
			throw err;
		} else {
			//console.log("Sent with message ID: ", messageId);
			res.json({success:true});
		}
	});
}
router.post('/SendFcm',ensureAuthorized, sendFcm);


function productSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query("SELECT * ,if(saleYn='Y', if(saleEDate>now() and saleSDate<now(), if(saleType='A', truncate(originPrice*(1-(salePoint/100)),0),originPrice-salePoint),originPrice),originPrice) as salePrice FROM product WHERE productSq = ?", [req.params.productSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 
					 one = results[0];
					 console.log(results);
					 one.preUrl = JSON.parse(one.preUrl);
					 one.detailUrl = JSON.parse(one.detailUrl);
					 console.log(one.saleSDate);
					 console.log(typeof(one.saleSDate));
		        	 res.json({success:true,data:one});
					 
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Product/:productSq', ensureAuthorized,ensureAdmin,productSelect);

function productList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	//console.log('aaaa',req.query.productSqs);
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where productSq is not null ';
			if(req.query.productSqs){
				wsql+=' and productSq in('+req.query.productSqs.map(Number).join(',')+')';
			}
			//if(req.query.userId) wsql+=" and userId='"+req.query.userId+"'";
			if(req.query.status) wsql+=" and status='"+req.query.status+"'";
			if(req.query.startDate) wsql+=" and regDate>='"+req.query.startDate+"'";
			if(req.query.endDate) wsql+=" and regDate<='"+req.query.endDate+"  23:59:59'";
			if(req.query.cate) wsql+=" and cate = '"+req.query.cate+"'";
			if(req.query.categoryCode) wsql+=' and categoryCode like "'+req.query.categoryCode+'"';
			//console.log(wsql);
			var query = connection.query("select count(*) cnt from product "+wsql+"; select  *,if(saleYn='Y', if(saleEDate>now() and saleSDate<now(), if(saleType='A', truncate(originPrice*(1-(salePoint/100)),0),originPrice-salePoint),originPrice),originPrice) salePoint from product "+wsql+" order by regDate desc  limit ? , ? ", [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
			        		 //console.log(one);
		        		 //one.thumbnail=JSON.parse(one.thumbnail);
		        		 //one.message=JSON.parse(one.message);
		        		 //one.from=JSON.parse(one.from);
		        		 //one.to=JSON.parse(one.to);
		        		 //one.descList=JSON.parse(one.descList);
						 one.preUrl = JSON.parse(one.preUrl);
						 one.detailUrl = JSON.parse(one.detailUrl);
						 
		        		 rs.push(one);
			      });
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Product',ensureAuthorized,ensureAdmin, productList);

function productUpdate(req, res, next) {

	var param={
		title:req.body.title, //상품명 
		categoryCode:req.body.categoryCode, // 카테고리 아이디 
		cate:req.body.cate,
		preUrl:null, // 대표사진
		detailUrl:null, //상세 사진들
		intro:req.body.intro, //소개
		originPrice:req.body.originPrice, //판매가 
		cnt:req.body.cnt, // 재고수 
		saleYn:req.body.saleYn, // 세일여부 
		saleType:req.body.saleType, // 세일 유형 
		salePoint:req.body.salePoint, // 세일 포인트 
		saleSDate:req.body.saleSDate , //세일 시작일 
		saleEDate:req.body.saleEDate, //세일 마감일 
		status:req.body.status	
		
	};
	//console.log(req.body.detailUrl);
	var images=[];
	if(req.body.preUrl){
		images.push(req.body.preUrl);
	}
	if(req.body.detailUrl) {
		for(var i=0; i<req.body.detailUrl.length; i++){
			images.push(req.body.detailUrl[i]);
		}
	}
	//console.log(images);
	if (images.length>0){
		var upload = require('./upload');
		//console.log(upload);
		upload.savePermantFiles(images).then(function(results){
			pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					if(req.body.preUrl){
						param.preUrl=JSON.stringify(results[0]);
						param.detailUrl=JSON.stringify(results.slice(1));
					}else{
						param.detailUrl=JSON.stringify(results);
					}
					dbUpdate(connection,'product',param,{
							productSq:req.params.productSq
					}).then(function(results){
						res.json({changedRows:results});
						connection.release();
					},function(err){
						res.status(500).json({"code":10,"type":"error","message":err});
						connection.release();
					});
					
				}
			}); 
		},function(err){
			res.status(500).json({type:'error',message:err,code:500});
		});

	}else{
		pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					
					dbUpdate(connection,'product',param,{
							productSq:req.params.productSq
					}).then(function(results){
						res.json({changedRows:results});
						connection.release();
					},function(err){
						res.status(500).json({"code":10,"type":"error","message":err});
						connection.release();
					});
					
				}
		}); 
	}
}
router.put('/Product/:productSq',  ensureAuthorized,ensureAdmin,productUpdate);


function productInsert(req, res, next) {
	var param={
		shopSq:req.body.shopSq, // 고유번호
		title:req.body.title, //상품명 
		categoryCode:req.body.categoryCode, // 카테고리 아이디 
		preUrl:null, // 대표사진
		detailUrl:null, //상세 사진들
		intro:req.body.intro, //소개
		originPrice:req.body.originPrice, //판매가 
		cnt:req.body.cnt, // 재고수 
		saleYn:req.body.saleYn, // 세일여부 
		saleType:req.body.saleType, // 세일 유형 
		salePoint:req.body.salePoint, // 세일 포인트 
		saleSDate:req.body.saleSDate , //세일 시작일 
		saleEDate:req.body.saleEDate, //세일 마감일 
		cate:req.body.cate,
		status:'A',		 //상태
		
	};
	var images=[];
	if(req.body.preUrl){
		images.push(req.body.preUrl);
	}
	if(req.body.detailUrl) {
		for(var i=0; i<req.body.detailUrl.length; i++){
			images.push(req.body.detailUrl[i]);
		}
	}
	if (images.length>0){
		var upload = require('./upload');
		upload.savePermantFiles(images).then(function(results){
			pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					if(req.body.preUrl){
						param.preUrl=JSON.stringify(results[0]);
						param.detailUrl=JSON.stringify(results.slice(1));
					}else{
						param.detailUrl=JSON.stringify(results);
					}
						
					dbInsert(connection,'product',param).then(function(results){
						res.json({insertId:results});
						connection.release();
					},function(err){
						connection.release();
						res.status(500).json({"code":10,"type":"error","message":err});
					});
					
				}
			}); 
		},function(err){
			res.status(500).json({type:'error',message:err,code:500});
		});

	}else{
		pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					
					dbInsert(connection,'product',param).then(function(results){
						res.json({insertId:results});
						connection.release();
					},function(err){
						connection.release();
						res.status(500).json({"code":10,"type":"error","message":err});
					});
					
				}
		}); 
	}
	
}
router.post('/Product',  ensureAuthorized,ensureAdmin,productInsert);

function orderSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM `order` WHERE orderCd = ?', [req.params.orderCd], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 
					 one = results[0];
					 //console.log(one.imageUrl);
		        	 //one.addr = JSON.parse(one.addr);
		        	 one.products = JSON.parse(one.products);
					 one.addr = JSON.parse(one.addr);
					 one.locker = JSON.parse(one.locker);
		        	 res.json(one);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Order/:orderCd', ensureAuthorized,ensureAdmin,orderSelect);

function orderList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			
			var wsql=' where orderCd is not null';
			if(req.query.memberSq) wsql+=' and memberSq='+req.query.memberSq;
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.kind) wsql+=' and kind="'+req.query.kind+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from `order` '+wsql+'; select  * from `order` '+wsql+' order by regDate desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
			        		 //console.log(one);
		        		 //one.thumbnail=JSON.parse(one.thumbnail);
		        		 //one.message=JSON.parse(one.message);
		        		 //one.from=JSON.parse(one.from);
		        		 //one.to=JSON.parse(one.to);
		        		 //one.descList=JSON.parse(one.descList);
						 one.products = JSON.parse(one.products);
						 one.addr = JSON.parse(one.addr);
		        		 rs.push(one);
			      });
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Order',ensureAuthorized, ensureAdmin,orderList);

function orderUpdate(req, res, next) {

	Promise.all([dbSelect('order',{orderSq:req.body.orderSq})]).then(function(dbrs){
			
			//apple = rsdata[0];
			//pool.getConnection(function (err, connection) {
		
		var param={
			status:req.body.status, // 상점 아이디 
			
		};
		if(dbrs[0].status==req.body.status){ // 관리자 비고만 수정
			param.description=req.body.description;
		}else if(dbrs[0].status=='A' && req.body.status=='B'){
			param.shippingDate=new Date();
		}else if(dbrs[0].status=='B' && req.body.status=='C'){
			param.shippingEDate=new Date();
		}else if ((req.body.status=='D' || req.body.status=='E') && (dbrs[0].status=='A' || dbrs[0].status=='B' || dbrs[0].status=='C' )){
			param.cancelDate = new Date();
			param.cancelDesc=req.body.cancelDesc;
		}else{
			res.status(403).json({"code":10,"type":"error","message":"parameter error"});
			return;
		}
		pool.getConnection(function (err, connection) {
			if (err) {
				res.status(500).json({"code":10,"type":"error","message":err});
			}else{
				//PG사 취소도 구현해야합니다.
				dbUpdate(connection,'order',param,{
						orderSq:req.params.orderSq
				}).then(function(results){
					res.json({changedRows:results});
					connection.release();
				},function(err){
					res.status(500).json({"code":10,"type":"error","message":err});
					connection.release();
				});
				
			}
		}); 
	},function(err){

	});
	
}
router.put('/Order/:orderSq',  ensureAuthorized,ensureAdmin,orderUpdate);


function orderInsert(req, res, next) {
	var param={
		products: req.body.products,// 주문상품
		reqItem:req.body.reqItem,//요청내용
		status:req.body.status,//배달준비중\n대발중\n배달완료\n주문취소\n환불
		totalPrice:req.body.status,//총판매가격
		description: req.body.description,//비고
  		title:req.body.title,//제목(자동생성)
  		addr:JSON.stringify(req.body.addr),//주소
  		shopSq:req.body.shopSq,//상점아이디
  		memberSq:req.decoded.memberSq,//사용자아이디
  		pgCode:req.body.pgCode//피지코드
	};
	
	pool.getConnection(function (err, connection) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
		}else{

			var query = connection.query('select * from product where productSq in(?)', [req.body.productSqs], function(err, results) {
			  
			  if(err){
				  	console.log(err);
					res.status(500).json({"code":10,"type":"error","message":err});
					connection.release();
			  }else{
				param.products = JSON.stringify(results);
				dbInsert(connection,'order',param).then(function(rr){
					res.json({insertId:rr});
					connection.release();	
				},function(err){
					connection.release();
					res.status(500).json({"code":10,"type":"error","message":err});
				});
				
			  }
			});

			
			
		}
	}); 
		

	
	
}


router.post('/Order',  ensureAuthorized,ensureAdmin,orderInsert);

function pincodeList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	throw err;
		
		}
			//console.log(req.decoded);
		var wsql=' where pincodeSq is not null';
		//if(req.query.status) wsql+=" and status='"+req.query.status+"'";
		if(req.query.status) {
				if(Array.isArray(req.query.status)){
					wsql+=" and status in('"+req.query.status.join("','")+"')";
				}else{
					wsql+=" and status='"+req.query.status+"'";
				}		
				
		}
		//console.log(wsql);
		//if(req.query.status) wsql+=" and status='"+req.query.kind+"'";
		if(req.query.startDate) wsql+=" and regDate>='"+req.query.startDate+"'";
		if(req.query.endDate) wsql+=" and regDate<='"+req.query.endDate+"  23:59:59'";
		//console.log(wsql);
		var query = connection.query("select count(*) cnt from `pincode` "+wsql+"; select  * from `pincode` "+wsql+" order by regDate desc  limit ? , ? ", [start*length,length], function(err, results) {
			// ...
				if (err) {
					//connection.release();
					res.status(500).json({type:'error',message:err,code:500});
				}else {
					var rs= [];
					_.each(results[1], function(one) {
						//one.products = JSON.parse(one.products);
						//one.locker = JSON.parse(one.locker);
						//one.photos = JSON.parse(one.photos);
						rs.push(one);
					});
				

					//console.log(results[0][0].cnt);
					res.json({
						"draw": parseInt(req.query.draw),
						"recordsTotal": results[0][0].cnt,
						"recordsFiltered": results[0][0].cnt,data:rs});
				}	
			
				connection.release();
		});
		
		
	});
}
router.get('/Pincode',ensureAuthorized, pincodeList);

function donationSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM donation WHERE donationSq = ?', [req.params.donationSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 one = results[0];
					 try{
		        	 	one.photos = JSON.parse(one.photos);
					 }catch(E){
						
					 }
		        	 res.json(one);
		         }
				 connection.release();
			});
		}
	});
}

router.get('/Donation/:donationSq', ensureAuthorized,donationSelect);


function donationList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	throw err;
		
		}
			//console.log(req.decoded);
		var wsql=' where memberSq is not null';
		//if(req.query.status) wsql+=" and status='"+req.query.status+"'";
		if(req.query.status) {
				if(Array.isArray(req.query.status)){
					wsql+=" and status in('"+req.query.status.join("','")+"')";
				}else{
					wsql+=" and status='"+req.query.status+"'";
				}		
				
		}
		//console.log(wsql);
		//if(req.query.status) wsql+=" and status='"+req.query.kind+"'";
		if(req.query.startDate) wsql+=" and regDate>='"+req.query.startDate+"'";
		if(req.query.endDate) wsql+=" and regDate<='"+req.query.endDate+"  23:59:59'";
		//console.log(wsql);
		var query = connection.query("select count(*) cnt from `donation` "+wsql+"; select  * from `donation` "+wsql+" order by regDate desc  limit ? , ? ", [start*length,length], function(err, results) {
			// ...
				if (err) {
					//connection.release();
					res.status(500).json({type:'error',message:err,code:500});
				}else {
					var rs= [];
					_.each(results[1], function(one) {
						//one.products = JSON.parse(one.products);
						//one.locker = JSON.parse(one.locker);
						one.photos = JSON.parse(one.photos);
						rs.push(one);
					});
				

					//console.log(results[0][0].cnt);
					res.json({
						"draw": parseInt(req.query.draw),
						"recordsTotal": results[0][0].cnt,
						"recordsFiltered": results[0][0].cnt,data:rs});
				}	
			
				connection.release();
		});
		
		
	});
}
router.get('/Donation',ensureAuthorized, donationList);

function donationUpdate(req, res, next) {
	var param={
		title:req.body.title,
		content:req.body.content,
		status:req.body.status,
		point:req.body.point
	};
	var upload = require('./upload');
	if(req.body.photos) {
		upload.savePermantFiles(req.body.photos).then(function(results){
			pool.getConnection(function (err, connection) {
				if (err) {
					//connectin.release();
					throw err;
				}
				param.photos = JSON.stringify(results);
				var query = connection.query("update `donation` set ? where memberSq=? and donationSq=?",[param,req.decoded.memberSq,req.params.donationSq], function (err, rows) {
					if (err) {
						res.status(500).json({type:'error',message:err,code:500});
					}else{
						res.json(rows.changedRows);
					}
					connection.release();
				});
				//console.log(query);
				
			}); 
		},function(err){
			res.status(500).json({"code":10,"type":"error","message":err});
		});
	}else{
		pool.getConnection(function (err, connection) {
			if (err) {
				//connectin.release();
				throw err;
			}
			/*var jobs = [dbUpdate(connection,'donation',param,{
				donationSq:req.params.donationSq, memberSq:req.decoded.memberSq
			})];
			Promise.all(jobs).then(function(res2){
				res.json(res2[0]);	
				connection.release();
				
			},function(err){
				connection.release();
				res.status(500).json({"code":10,"type":"error","message":err});
			});*/

			var query = connection.query("update `donation` set ? where donationSq=?",[param,req.params.donationSq], function (err, rows) {
				if (err) {
					res.status(500).json({type:'error',message:err,code:500});
				}else{
					res.json(rows.changedRows);
				}
				connection.release();
			});
			//console.log(query);

		});
	}

	
}
router.put('/Donation/:donationSq', ensureAuthorized,donationUpdate);


function udsMsgList(req, res,next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	throw err;
		
		}
			//console.log(req.decoded);
		var wsql=' where cmid is not null';
		
		if(req.query.uuid) wsql+=" and uuid='"+req.query.uuid+"'";
		if(req.query.dest_phone) wsql+=" and dest_phone='"+req.query.dest_phone+"'";
		if(req.query.request_time) {
			wsql+=" and REQUEST_TIME>='"+req.query.request_time+"'";
			wsql+=" and REQUEST_TIME<='"+req.query.request_time+"  23:59:59'";
		}

		if(req.query.rsYn){
			if(req.query.rsYn=='Y'){
				wsql+=' and status=2 and call_status=4100';
			}else if(req.query.rsYn=='N'){
				wsql+=' and status=2 and call_status!=4100';
			}
		}
		//console.log(wsql);
		var query = connection.query("select count(*) cnt from `BIZ_MSG` "+wsql+"; select  * from `BIZ_MSG` "+wsql+" order by request_time desc  limit ? , ? ", [start*length,length], function(err, results) {
			// ...
				if (err) {
					//connection.release();
					res.status(500).json({type:'error',message:err,code:500});
				}else {
					var rs= [];
					_.each(results[1], function(one) {
						//one.products = JSON.parse(one.products);
						//one.locker = JSON.parse(one.locker);
						//one.photos = JSON.parse(one.photos);
						rs.push(one);
					});
				

					//console.log(results[0][0].cnt);
					res.json({
						"draw": parseInt(req.query.draw),
						"recordsTotal": results[0][0].cnt,
						"recordsFiltered": results[0][0].cnt,data:rs});
				}	
			
				connection.release();
		});
		
		
	});
}
router.get('/UdsMsg', ensureAuthorized,udsMsgList);

function fcmPushList(req, res,next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	throw err;
		
		}
			//console.log(req.decoded);
		var wsql=' where pushId is not null';
		
		if(req.query.uuid) wsql+=" and uuid='"+req.query.uuid+"'";
		
		var query = connection.query("select count(*) cnt from `fcmPush` "+wsql+"; select  * from `fcmPush` "+wsql+" order by regDate desc  limit ? , ? ", [start*length,length], function(err, results) {
			// ...
				if (err) {
					//connection.release();
					res.status(500).json({type:'error',message:err,code:500});
				}else {
					var rs= [];
					_.each(results[1], function(one) {
						//one.products = JSON.parse(one.products);
						//one.locker = JSON.parse(one.locker);
						//one.photos = JSON.parse(one.photos);
						rs.push(one);
					});
				

					//console.log(results[0][0].cnt);
					res.json({
						"draw": parseInt(req.query.draw),
						"recordsTotal": results[0][0].cnt,
						"recordsFiltered": results[0][0].cnt,data:rs});
				}	
			
				connection.release();
		});
		
		
	});
}
router.get('/FcmPush', ensureAuthorized,fcmPushList);


function memberLogList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	throw err;
		
		}
			//console.log(req.decoded);
		var wsql=' where memberLogSq is not null';
		
		if(req.query.memberSq) wsql+=" and memberSq="+req.query.memberSq;
		if(req.query.regDate) {
			wsql+=" and regDate>='"+req.query.regDate+"'";
			wsql+=" and regDate<='"+req.query.regDate+"  23:59:59'";
		}
		//console.log(wsql);
		var query = connection.query("select count(*) cnt from `memberLog` "+wsql+"; select  * from `memberLog` "+wsql+" order by regDate desc  limit ? , ? ", [start*length,length], function(err, results) {
			// ...
				if (err) {
					//connection.release();
					res.status(500).json({type:'error',message:err,code:500});
				}else {
					var rs= [];
					_.each(results[1], function(one) {
						//one.products = JSON.parse(one.products);
						//one.locker = JSON.parse(one.locker);
						//one.photos = JSON.parse(one.photos);
						rs.push(one);
					});
				

					//console.log(results[0][0].cnt);
					res.json({
						"draw": parseInt(req.query.draw),
						"recordsTotal": results[0][0].cnt,
						"recordsFiltered": results[0][0].cnt,data:rs});
				}	
			
				connection.release();
		});
		
		
	});
}
router.get('/MemberLog',ensureAuthorized, memberLogList);

function memberLogInsert(req, res, next) {
	var param={
		description:req.body.description,
		memberSq:req.body.memberSq
	}
	pool.getConnection(function (err, connection) {
		if (err) {
            
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('INSERT INTO `memberLog` set ?', param, function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',code:500,message:err});
		         }else{
		        	 
					//res.json(results[0]);
					res.json({changedRows:results.changedRows});
					
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
	
}
router.post('/MemberLog', ensureAuthorized,ensureAdmin,memberLogInsert);


function memberLogDelete(req, res, next) {

    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var query = connection.query("delete from memberLog where memberLogSq=?",[req.params.memberLogSq], function (err, rows) {
            if (err) {
                //console.error("err : " + err);
                res.status(500).json({type:'error',message:err,code:500});
            }else{
                res.json({affectedRows:rows.affectedRows});
            }
            connection.release();
		});
		//console.log(query);
        
	});
}
router.delete('/MemberLog/:memberLogSq',  ensureAuthorized,ensureAdmin,memberLogDelete);


function appleboxAllDelete(req, res, next) {

    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var jobs = [
			dbDelete(connection,'locker',{yid:req.params.yid}),
			dbDelete(connection,'applebox',{yid:req.params.yid}),
		];
		Promise.all(jobs).then(function(res2){
			res.json({});	
			connection.release();
			
		},function(err){
			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		})
        
	});
}
router.delete('/AppleboxAllDelete/:yid',  ensureAuthorized,ensureAdmin,appleboxAllDelete);


// buyer


function noticeSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM notice WHERE noticeSq = ?', [req.params.noticeSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 one = results[0];
					 try{
		        	 	one.dataImg = JSON.parse(one.dataImg);
					 }catch(E){
						
					 }
		        	
		        	 res.json(one);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Notice/:noticeSq', ensureAuthorized,ensureAdmin,noticeSelect);

function noticeList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where noticeSq is not null ';
			//if(req.query.kind) wsql+=' and kind="'+req.query.kind+'"';
			if(req.query.buyerSq) wsql+=' and buyerSq="'+req.query.buyerSq+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from notice '+wsql+'; select  * from notice '+wsql+' order by noticeSq desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
			        	 //console.log(one);
		        		 //one.thumbnail=JSON.parse(one.thumbnail);
		        		 //one.message=JSON.parse(one.message);
		        		 //one.from=JSON.parse(one.from);
		        		 
		        		 //one.descList=JSON.parse(one.descList);
						 try{
							one.dataImg=JSON.parse(one.dataImg);
						 }catch(x){
							 //console.log(x);
						 }
		        		 rs.push(one);
			      	});
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Notice',ensureAuthorized,ensureAdmin, noticeList);

function noticeUpdate(req, res, next) {

	
	//console.log(param);
	//console.log(req.body.addr);
	pool.getConnection(function (err, connection) {
		var param ={
			title:req.body.title,
			dataImg:JSON.stringify(req.body.dataImg),
			status:req.body.status,
		};
		var query = connection.query("update notice set ? where buyerSq=?",[param,req.params.noticeSq], function (err, rows) {
	        if (err) {
	        	//console.error("err : " + err);
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
		
	});
}
router.put('/Notice/:noticeSq', ensureAuthorized,noticeUpdate);


function noticeInsert(req, res, next) {
	console.log(req.body);
	var param={
			title:req.body.title,
			dataImg:JSON.stringify(req.body.dataImg),
			kind:req.body.kind,
			status:req.body.status,
			buyerSq:req.body.buyerSq 
			
	}
	if(param.kind=='A'){
		var upload = require('./upload');
			//console.log(upload);
			upload.savePermantFile(req.body.dataImg.fileKey).then(function(results){
				
			param.dataImg=JSON.stringify(results);
			pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					var query = connection.query('INSERT INTO notice set ?', param, function(err, results) {
					// ...
						if (err) {
							res.status(500).json({"code":10,"type":"error","message":err});
						}else{
							
							res.json({insertId:results.insertId});
							
						}
						connection.release();
					});
					console.log(query);
				}
			}); 
		},function(err){
			res.status(500).json({type:'error',message:err,code:500});
		});	
	}else{
		pool.getConnection(function (err, connection) {
			if (err) {
				res.status(500).json({"code":10,"type":"error","message":err});
			}else{
				var query = connection.query('INSERT INTO notice set ?', param, function(err, results) {
				// ...
					if (err) {
						res.status(500).json({"code":10,"type":"error","message":err});
					}else{
						
						res.json({insertId:results.insertId});
						
					}
					connection.release();
				});
				console.log(query);
			}
		}); 
	}
}
router.post('/Notice',  ensureAuthorized,ensureAdmin,noticeInsert);

/////////laundry notice///////////////////////
function laundryNoticeSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM laundryNotice WHERE laundryNoticeSq = ?', [req.params.laundryNoticeSq], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 one = results[0];
		        	 one.dataImg = JSON.parse(one.dataImg);
		        	
		        	 res.json(one);
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/LaundryNotice/:laundryNoticeSq', ensureAuthorized,ensureAdmin,laundryNoticeSelect);

function laundryNoticeList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where laundryNoticeSq is not null ';
			if(req.query.tagid) wsql+=' and tagid="'+req.query.tagid+'"';
			if(req.query.hp) wsql+=' and hp="'+req.query.hp+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from laundryNotice '+wsql+'; select  * from laundryNotice '+wsql+' order by regDate desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
					 var rs= [];
		        	 _.each(results[1], function(one) {
			        		 //console.log(one);
		        		 //one.thumbnail=JSON.parse(one.thumbnail);
		        		 //one.message=JSON.parse(one.message);
		        		 //one.from=JSON.parse(one.from);
		        		 one.dataImg=JSON.parse(one.dataImg);
		        		 //one.descList=JSON.parse(one.descList);
						 //one.addr = JSON.parse(one.addr);
		        		 rs.push(one);
			      });
		          

		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/LaundryNotice',ensureAuthorized,ensureAdmin, laundryNoticeList);

function laundryNoticeUpdate(req, res, next) {

	
	//console.log(param);
	//console.log(req.body.addr);
	pool.getConnection(function (err, connection) {
		var param={
			status:req.body.status,
			
			content:req.body.content,
			title:req.body.title
					
		};
		var query = connection.query("update laundryNotice set ? where laundryNoticeSq=?",[param,req.params.laundryNoticeSq], function (err, rows) {
	        if (err) {
	        	//console.error("err : " + err);
	        	res.status(500).json({type:'error',message:err,code:500});
	        }else{
	        	res.json({changedRows:rows.changedRows});
	        }
	        connection.release();
	    });
		
	});
}
router.put('/LaundryNotice/:laundryNoticeSq',  ensureAuthorized,ensureAdmin,laundryNoticeUpdate);


function laundryNoticeInsert(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
		}else{

			
			var param={
				title:req.body.title,
				content:req.body.content,
				status:'A'		
			};
			var upload = require('./upload');
			//console.log(upload);
			if (req.body.dataImg) {
				upload.savePermantFile(req.body.dataImg.fileKey).then(function(results){
					
					param.dataImg=JSON.stringify(results);
					var query = connection.query('INSERT INTO laundryNotice set ?', param, function(err, results) {
					// ...
						if (err) {
							
							res.status(500).json({"code":10,"type":"error","message":err});
						}else{
							
							res.json({insertId:results.insertId});
							
						}
						connection.release();
					});
				});
			}else {
				var query = connection.query('INSERT INTO laundryNotice set ?', param, function(err, results) {
					// ...
						if (err) {
							
							res.status(500).json({"code":10,"type":"error","message":err});
						}else{
							
							res.json({insertId:results.insertId});
							
						}
						connection.release();
				});
			}
			//console.log(query);
		}
	}); 
}
router.post('/LaundryNotice',  ensureAuthorized,ensureAdmin,laundryNoticeInsert);


// servie

function serviceDelete(req, res, next) {
    
        
	//console.log(req.query);
	//console.log(req.body.addr);
	pool.getConnection(function (err, connection) {
			
			var query = connection.query("delete from service where serviceSq=? ",[req.params.serviceSq], function (err, rows) {
					if (err) {
							//console.error("err : " + err);
							res.status(500).json({type:'error',message:err,code:500});
					}else{
							res.json({affectedRows:rows.affectedRows});
					}
					connection.release();
	});
	console.log(query);
			
	});
}
router.delete('/Service/:serviceSq',  ensureAuthorized,ensureAdmin,serviceDelete);

function serviceList(req, res, next) {
var start = parseInt(req.query.page||'1')-1;
var length = parseInt(req.query.display||'100');

pool.getConnection(function (err, connection) {
	if (err) {
				 res.status(500).json({type:'error',message:err,code:500});
	}else{
		
		var wsql='where  serviceSq is not null';
		if(req.query.buyerSq) wsql+=' and A.buyerSq ="'+req.query.buyerSq+'"';
		if(req.query.shopSq) wsql+=' and A.shopSq = "'+req.query.shopSq+'"';
		if(req.query.kind) wsql+=' and A.kind ="'+req.query.kind+'"';
		//console.log(wsql);
				var query = connection.query('select count(*) cnt  from service A '+wsql+'; select  * from service A '+wsql+'  limit ? , ? ', [start*length,length], function(err, results) {
			// ...
			//console.log('select  * from things '+wsql+' order by regDate desc');
			if (err) {
				res.status(500).json({type:'error',message:err,code:500});
			}else{
				
				var rs= [];
						 _.each(results[1], function(one) {
								 //console.log(one);
							 //one.thumbnail=JSON.parse(one.thumbnail);
							 //one.message=JSON.parse(one.message);
							 //one.from=JSON.parse(one.from);
							 //one.to=JSON.parse(one.to);
							 //one.addr=JSON.parse(one.addr);
							 rs.push(one);
				});
				
				res.json({
					"draw": parseInt(req.query.draw),
					"recordsTotal": results[0][0].cnt,
					"recordsFiltered": results[0][0].cnt,data:rs});
				
			}
			connection.release();
			});
		
	}
});
}
router.get('/Service',ensureAuthorized,ensureAdmin, serviceList);




function serviceInsert(req, res, next) {
var param={
	shopSq:req.body.shopSq,
	name:req.body.name,
	hp:req.body.hp,
	buyerSq:req.body.buyerSq,
	kind:req.body.kind
	

};


pool.getConnection(function (err, connection) {
	if (err) {
		//connectin.release();
		throw err;
	}
	
	var jobs=[ 
		dbInsert(connection,'service',param)];
	Promise.all(jobs).then(function(res2){
		
		res.json({customerSq:res2[0][0]});
		connection.release();
	},function(err){
		
		//
		console.log(err);

		connection.release();
		res.status(500).json({"code":10,"type":"error","message":err});
	});
	
}); 
	

}

router.post('/Service',  ensureAuthorized,ensureAdmin,serviceInsert);


function serviceSelect(req, res, next) {
//console.log('aaaa1111');
pool.getConnection(function (err, connection) {
	if (err) {
		//console.log(err);
				 res.status(500).json({type:'error',message:err,code:500});
	}else{
		var query = connection.query('SELECT * FROM service WHERE serviceSq = ? ', [req.params.serviceSq], function(err, results) {
			
			 if (err) {
				 //console.log(err);
				 //console.log('aaaaaa');
						 //res.status(500).json({type:'error',message:err,code:500});
									throw err;
					 }else{
				 
				if(results.length==0){
					res.status(404).json({type:'error',message:'not found',code:404});
				}else{
					var rs= [];
							 _.each(results, function(one) {
								 //console.log(one);
							 //one.thumbnail=JSON.parse(one.thumbnail);
							 //one.message=JSON.parse(one.message);
							 //one.from=JSON.parse(one.from);
							 //one.to=JSON.parse(one.to);
							 //one.addr=JSON.parse(one.addr);
							 rs.push(one);
						});
				
					res.json(rs[0]);
				}
						 
							
					 }
			 connection.release();
		});
		console.log(query);
	}
});
}

router.get('/Service/:serviceSq', ensureAuthorized,ensureAdmin,serviceSelect);


function payList(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where thingsSq is not null';
			if(req.query.shopSq) wsql+=' and shopSq='+req.query.shopSq;
			if(req.query.userName) wsql+=' and userName="'+req.query.userName+'"';
			if(req.query.method) wsql+=' and method="'+req.query.method+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
            if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			if(req.query.hp) wsql+=' and memberSq in (select memberSq from member where hp="'+req.query.hp+'")';
			if(req.query.userHp) wsql+=' and userHp="'+req.query.userHp+'"';
            if(req.query.name) wsql+=' and memberSq in (select memberSq from member where name="'+req.query.name+'")';
			//if(req.query.mode=='1') wsql +=' and pgCode is not null';
			if(req.query.mode=='1') wsql +=' and status in ("E","F","G","H","I")';
			if(req.query.mode=='2') wsql +=' and status in ("A","B")';
			
			//console.log('select count(*) cnt , sum(totalPrice) totalPrice , date_format(pgDate,"%Y-%m-%d") date from things '+wsql+' group by date desc');
			var query = connection.query(`select sum(CASE
				WHEN payMethod ='A' THEN 1
				ELSE 0
			END ) '카드건',
			sum(CASE
				WHEN payMethod ='B' THEN 1
				ELSE 0
			END ) '무통장건',
			sum(CASE
				WHEN payMethod ='C' THEN 1
				ELSE 0
			END ) '현금건',
			sum(CASE
				WHEN payMethod ='D' THEN 1
				ELSE 0
			END ) '핸드폰건',
			 sum(CASE
				WHEN payMethod ='A' THEN totalPrice
				ELSE 0
			END ) '카드',
			
			sum(CASE
				WHEN payMethod ='B' THEN totalPrice
				ELSE 0
			END ) '무통장',
			sum(CASE
				WHEN payMethod ='C' THEN totalPrice
				ELSE 0
			END ) '현금',
			sum(CASE
				WHEN payMethod ='D' THEN totalPrice
				ELSE 0
			END ) '핸드폰',count(*) cnt , sum(totalPrice) totalPrice , date_format(regDate,"%Y-%m-%d") date from things ${wsql} group by date asc`, [], function(err, results) {
              // ...
              //console.log('select  * from things '+wsql+' order by regDate desc');
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
                    
		          
				    res.json(results);
		            
		         }
				 connection.release();
            });
            //console.log(query);
			
		}
	});
}

router.get('/Paylist',ensureAuthorized,ensureAdmin, payList);
function vipList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where ip is not null ';
			if(req.query.hp) wsql+=' and hp="'+req.query.hp+'"';
                        if(req.query.name) wsql+=' and name like "%'+req.query.name+'%"';
			if(req.query.memberType) wsql+=' and memberType="'+req.query.memberType+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from vip '+wsql+'; select  * from vip '+wsql+' order by INET_ATON(ip) desc  limit ? , ? ', [start*length,length], function(err, results) {
			  // ...
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
		        	 	//console.log(results[0][0].cnt);
		             res.json({
		            	  "draw": parseInt(req.query.draw),
		            	  "recordsTotal": results[0][0].cnt,
		            	  "recordsFiltered": results[0][0].cnt,data:results[1]});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
}
router.get('/Vip',ensureAuthorized,ensureAdmin, vipList);

module.exports = router;
