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
		        reject(err);
		        
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
                  console.log(err);
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
        //console.log("aaa"+req.decoded);
		if(req.decoded.shopSq){
			next();
		}else{
			return res.status(401).json({ code:401,type:'error', message: 'no auth.' });
		}
}
function authenticate(req, res,next) {
    if(req.body.userId && req.body.password) {
        pool.getConnection(function (err, connection) {
            if(err){
				  	console.log(err);
					res.status(500).json({"code":10,"type":"error","message":err});
					connection.release();
            }else{
                connection.query('select * FROM shop where shopId=?',[req.body.userId],function (err, rows) {
                    if (err) {
                        connection.release();
                        //res.status(500).json({"code":10,"type":"error","message":"내부에러입니다."});
                        throw err;
                    }else{
                        if(rows.length==0){
                            res.status(404).json({"code":1000,"type":"error","message":"아이디가 존재하지 않습니다."});
                            
                        }else{
                            var u = rows[0];
                                
                            if(u.status=='B'){
                                
                                res.status(401).json({"code":1001,"type":"error","message":"중지중인 아이디입니다."});
                            }else{
                                if(u.passwd==req.body.password) {
                                    var token = jwt.sign({shopSq:u.shopSq,companyName:u.companyName,userId:u.userId,kind:u.kind}, config.secret, {
                                        //expiresInMinutes: 1440 // 분 expires in 24 hours
                                    });

                                    // return the information including token as JSON
                                    res.json({
                                        message: 'enjoy!',
                                        token: token
                                    });
                                }else{
                                    res.status(401).json({"code":1001,"type":"error","message":"사용자 패스워드가 틀립니다."});
                                }
                            }
                        
                            
                        }
                        
                    }
                    connection.release();

                    // Don't use the connection here, it has been returned to the pool.
                });
            }
            //res.status(500).json({type:'error',code:500,message:err});
            //connection.release();
        });
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
	//var pass = req.body.password;
	//var salt = Math.round((new Date().valueOf() * Math.random())) + "";
	//var mypass = crypto.createHash("sha512").update(pass+salt).digest("hex");
	
	
	//console.log(req.body);
	//var crypt = require('../common/crypto');
	
	var param = {
		
		hp:req.body.hp,
		name:req.body.name,
		media: 'C',
		path:'G',
		status:'A'
	};
	
	//param.pwd=mypass;
	//param.salt=salt;
	//delete param.password;
	//delete param.password_c;
	dbQuery('member',{hp:req.body.hp,path:param.path}).then(function(results){
		//res.json({changedRows:results});
		//connection.release();
		if(results.length==0){
			pool.getConnection(function (err, connection) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					//param.imageUrl=JSON.stringify(results);
					dbInsert(connection,'member',param).then(function(results){
						//res.json({memberSq:results});

						//connection.release();
						dbInsert(connection,'customer',{hp:param.hp,name:param.name,memberSq:results,shopSq:req.decoded.shopSq}).then(function(results1){
							res.json({memberSq:results});
							
							connection.release();
						},function(err){
							connection.release();
							res.status(500).json({"code":10,"type":"error","message":err});
						});

					},function(err){
						connection.release();
						res.status(500).json({"code":10,"type":"error","message":err});
					});
					
				}
			}); 
		}else {
			res.status(500).json({"code":10,"type":"error","message":"duplicate phone number!!!"});
		}
	},function(err){
		res.status(500).json({"code":10,"type":"error","message":err});
		//connection.release();
	});
	/*
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
					res.json({memberSq:results.insertId});
		            
		         }
				 connection.release();
			});
			//console.log(query);
		}
	});
	*/
	
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
					 
					if(results.length==0){
						res.status(404).json({type:'error',message:'not found',code:404});
					}else{
						res.json(results[0]);
					}
		        	 
		            
		         }
				 connection.release();
			});
		}
	});
}
router.get('/Member/:memberSq', memberSelect);

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
			
			//var wsql="where path='G' ";
			var wsql="where memberSq is not null";
			if(req.query.userId) wsql+=' and userId="'+req.query.userId+'"';
			if(req.query.memberType) wsql+=' and memberType="'+req.query.memberType+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.hp) wsql+=' and hp="'+req.query.hp+'"';
			//if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			//if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
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
				buyerSq:req.body.buyerSq

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

/*
 * start : 0
 * length:10
 */

function appleboxList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	console.log(req.query);
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			//var wsql='where buyerSq in(select buyerSq from buyer where laundrySq='+req.decoded.shopSq+')';
			var wsql='where buyerSq in(select distinct buyerSq from service where shopSq='+req.decoded.shopSq+')';
			if(req.query.companyName) wsql+=' and companyName like "%'+req.query.companyName+'%"';
			if(req.query.buyerSq) wsql+=' and buyerSq='+req.query.buyerSq;
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
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

/*
function lockerList(req, res, next) {
	//var start = parseInt(req.query.page||'1')-1;
	//var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where yid="'+req.params.yid+'" ';
			if(req.query.memberType) wsql+=' and memberType="'+req.query.memberType+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select  * from locker '+wsql+' order by col asc,row asc ', [], function(err, results) {
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
router.get('/Locker/:yid',ensureAuthorized,ensureAdmin, lockerList);
*/
function lockerList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			//var wsql='where  `usage` in ("C","H") and yid in (select yid from applebox where buyerSq in (select buyerSq from buyer where laundrySq='+req.decoded.shopSq+'))';
			var wsql=" where A.yid=B.yid and `usage` in ('C','H')";
			if(req.query.yid) wsql+=' and  yid='+req.query.yid ;
			if(req.query.saveName) wsql+=' and A.saveName="'+req.query.saveName+'"';
			if(req.query.toHp) wsql+=' and A.toHp="'+req.query.toHp+'"';
			if(req.query.toName) wsql+=' and A.toName="'+req.query.toName+'"';
			if(req.query.saveHp) wsql+=' and A.saveHp="'+req.query.saveHp+'"';
			if(req.query.status) wsql+=' and A.status="'+req.query.status+'"';
			if(req.query.pwd) wsql+=' and A.pwd="'+req.query.pwd+'"';
			if(req.query.uuid) wsql+=' and A.uuid="'+req.query.uuid+'"';

			//console.log(wsql);
			//if(req.query.saveDate) wsql+=' and saveDate like "'+req.query.saveDate+'%"';
			/*
			if(req.query.dwhere=='A'){
				if(req.query.saveDate) wsql+=' and A.saveDate>="'+new Date(req.query.saveDate+' GMT+0900 (KST)').toISOString()+'"';
				if(req.query.saveDate) wsql+=' and A.saveDate<="'+new Date(req.query.saveDate+' 23:59:59 GMT+0900 (KST)').toISOString()+'"';
			}else {
				if(req.query.saveDate) wsql+=' and A.saveDate<="'+new Date(req.query.saveDate+' GMT+0900 (KST)').toISOString()+'"';
			}*/

			//if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			//var query = connection.query('select  * from locker '+wsql+' order by col asc,row asc ', [], function(err, results) {
				var query = connection.query('select count(*) cnt from locker A , applebox B '+wsql+'; select A.*,B.boxName from locker A, (select yid,a.name boxName from applebox a,buyer b where a.buyerSq=b.buyerSq and b.laundrySq='+req.decoded.shopSq+') B '+wsql+' order by A.saveDate desc  limit ? , ? ', [start*length,length], function(err, results) {	
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

function lockerSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM locker WHERE yid = ? and col=? and `row`=?', [req.params.yid,req.params.col,req.params.row], function(err, results) {
			  
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
                    //throw err;
		         }else{
					 
					if(results.length==0){
						res.status(404).json({type:'error',message:'not found',code:404});
					}else{
						res.json(results[0]);
					}
		        	 
		            
		         }
				 connection.release();
			});
		}
	});
}

router.get('/Locker/:yid/:col/:row',ensureAuthorized,ensureAdmin, lockerSelect);

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
function dbQuery(tableName,where){
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			var wherestr="";
			var keys=Object.keys(where);
			
			for(var i=0; i<keys.length; i++){
				wherestr+='`'+keys[i]+'`='+connection.escape(where[keys[i]]);
				if(i==keys.length-1){
					
				}else{
					wherestr+=' and ';
				}
			}

			var query=connection.query("select * from ?? where "+wherestr,[tableName], function (err, rows) {
				
				if (err) {
					//console.log(query);
					//console.log(err);
					reject({});
				}else{
					
					resolve(rows);
					
				}
				connection.release();
			});
			//console.log(query);
			
			
		});
		
		
	});
}

function dbSelect(tableName,where){
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			var wherestr="";
			var keys=Object.keys(where);
			
			for(var i=0; i<keys.length; i++){
				wherestr+='`'+keys[i]+'`='+connection.escape(where[keys[i]]);
				if(i==keys.length-1){
					
				}else{
					wherestr+=' and ';
				}
			}
			var query=connection.query("select * from ?? where "+wherestr,[tableName], function (err, rows) {
				
				if (err) {
					//console.log(err);
					reject(err);
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
			
			
		});
		
		
	});
}
function lockerUpdate(req, res, next) {

	
		
	pool.getConnection(function (err, connection) {
		var param=req.body;

		if (err) {
			res.status(500).json({type:'error',message:err,code:500});
		}else {
			
			var query = connection.query("update locker set ? where yid=? and col=? and `row`=?",[param,req.params.yid,req.body.col,req.body.row], function (err, rows) {
				if (err) {
					res.status(500).json({"code":10,"type":"error","message":err});
				}else{
					if(rows.changedRows==0){
						res.status(404).json({"code":10,"type":"error","message":err});
					}else{
						res.json({changedRows:rows.changedRows});
						
					} 
				}
				
				connection.release();
			}); 
			
		}
	});
	
}
router.put('/Locker/:yid', ensureAuthorized,lockerUpdate);
function shopSelect(req, res, next) {

	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM shop WHERE shopSq = ?', [req.decoded.shopSq], function(err, results) {
			  
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
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where shopSq is not null ';
			if(req.query.userId) wsql+=' and userId="'+req.query.userId+'"';
			if(req.query.kind) wsql+=' and kind="'+req.query.kind+'"';
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
			var query = connection.query('select count(*) cnt from shop '+wsql+'; select  * from shop '+wsql+' order by shopSq desc  limit ? , ? ', [start*length,length], function(err, results) {
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
router.get('/Shop',ensureAuthorized,ensureAdmin, shopList);

function shopUpdate(req, res, next) {

	var param={
		//shopId:req.body.shopId, // 상점 아이디 
		//passwd:req.body.passwd, // 패스워드 
		//companyName:req.body.companyName, //회사명 
		//preName:req.body.preName, //대표자 
		//licenseNumber:req.body.licenseNumber, // 사업자등록번호 
		//kind:req.body.kind, // 상점 유형 
		addr:JSON.stringify(req.body.addr), // 주소 
		//margin:req.body.margin, // 마진 
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
		hp:req.body.hp // 담당자 연락처 
		//status:req.body.status,		 //상태
		
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
							shopSq:req.decoded.shopSq
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
			if(req.query.userId) wsql+=' and userId="'+req.query.userId+'"';
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
			companyName:req.body.companyName
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
			status:'A',
			tel:req.body.tel
			
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
  		shopSq:req.decoded.shopSq,//상점아이디
  		memberSq:req.body.memberSq,//사용자아이디
		photos:'[]',
		prices:'[]',
		//takeDate:new Date(),
		confirm:req.body.confirm,
		locker:JSON.stringify(req.body.locker),
		method:req.body.method,
		status:req.body.status,
		kind:req.body.kind||'A',
		totalPrice:req.body.totalPrice
		//visitDate: req.body.visitDate?Date.parse(req.body.visitDate):null,
		//locker:'{"yid":0,"jumper":0,"serial":0,"status":"A","saveHp":"","saveName":"","saveDate":"","toHp":"","toName":"","boxName":"","pwd":"","label":""}'
		//toName:''
  		//pgCode:req.body.pgCode,//피지코드
		//kind:req.body.kind,
		//payType:req.body.payType

	};
	//console.log(req.body);
	//if(!req.body.orderCd){
	//	param.orderCd=getOrderNumber();
	//}
	dbSelect('member',{memberSq:req.body.memberSq}).then(function(rrr){
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
			if(rrr){
				param.userHp=rrr.hp;
				param.userName=rrr.name;
				}
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
	},function(err){
		res.status(500).json({"code":10,"type":"error","message":err});
	});
	
		
	
}
router.post('/Things/:thingsSq',  ensureAuthorized,ensureAdmin,thingsInsert);


function thingsStat(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where A.status!="Z" and A.shopSq = '+req.decoded.shopSq;
                        //if(req.query.userName) wsql+=' and userName="'+req.query.userName+'"';
                        if(req.query.payMethod) wsql+=' and A.payMethod="'+req.query.payMethod+'"';
                        if(req.query.method) wsql+=' and A.method="'+req.query.method+'"';
                        if(req.query.status) wsql+=' and A.status="'+req.query.status+'"';
                        if(req.query.startDate) wsql+=' and A.regDate>="'+req.query.startDate+'"';
            if(req.query.endDate) wsql+=' and A.regDate<="'+req.query.endDate+'  23:59:59"';
                        if(req.query.hp) wsql+=' and A.memberSq in (select memberSq from member where hp="'+req.query.hp+'")';
                        if(req.query.userHp) wsql+=' and ( A.userHp like "%'+req.query.userHp+'%" or  C.hp like "%'+req.query.userHp+'%" )';
                        if(req.query.userName) wsql+=' and ( A.userName like "%'+req.query.userName+'%" or C.name like "%'+req.query.userName+'%")';
            if(req.query.name) wsql+=' and A.memberSq in (select memberSq from member where name="'+req.query.name+'")';
                        //if(req.query.mode=='1') wsql +=' and pgCode is not null';
                        if(req.query.mode=='1') wsql +=' and A.status in ("E","F","G","H","I")';
                        if(req.query.mode=='2') wsql +=' and A.status in ("A","B")';

                        //console.log('select count(*) cnt , sum(totalPrice) totalPrice from things A '+wsql+'; select  thingsSq, reqItem, A.regDate, A.status, A.shopSq, yid, A.memberSq, pgCode, totalPrice, locker, things, takeDate, pgDate, saveLocker, prices, photos, confirm, pubDate, shippingDate, method, visitDate, payMethod, COALESCE(A.addr,C.addr) addr, COALESCE(C.hp,A.userHp,B.hp) userHp, COALESCE(C.name,A.userName,B.name) userName, kind, results FROM  things AS A      LEFT JOIN member AS BON B.memberSq = A.memberSq LEFT JOIN customer C ON C.memberSq = COALESCE(A.memberSq, B.memberSq)  '+wsql+' order by A.regDate desc  limit ? , ? ');
                        //var wwsql=wsql+ " and C.shopSq="+req.decoded.shopSq;
        //var query = connection.query('select count(*) cnt , sum(totalPrice) totalPrice from things A '+wsql+'; select  thingsSq, reqItem, A.regDate, A.status, A.shopSq, yid, A.memberSq, pgCode, totalPrice, locker, things, takeDate, pgDate, saveLocker, prices, photos, confirm, pubDate, shippingDate, method, visitDate, payMethod, COALESCE(A.addr,C.addr) addr, COALESCE(C.hp,A.userHp,B.hp) userHp, COALESCE(C.name,A.userName,B.name) userName, kind, results FROM  things AS A     LEFT JOIN member AS B ON B.memberSq = A.memberSq LEFT JOIN customer C ON C.memberSq = COALESCE(A.memberSq, B.memberSq)  '+wwsql+' order by A.regDate desc  limit ? , ? ', [start*length,length], function(err, results) {
            var query = connection.query('select  takeDate,thingsSq, reqItem, A.regDate, A.status, A.shopSq, yid, A.memberSq, pgCode, totalPrice, locker, things, takeDate, pgDate, saveLocker, prices, photos, confirm, pubDate, shippingDate, method, visitDate, payMethod, COALESCE(A.addr,C.addr) addr, COALESCE(C.hp,A.userHp,B.hp) userHp, COALESCE(C.name,A.userName,B.name) userName, kind, results FROM  things AS A       LEFT JOIN member AS B ON B.memberSq = A.memberSq LEFT JOIN customer C ON C.memberSq = COALESCE(A.memberSq, B.memberSq)  '+wsql+' order by A.regDate desc  limit ? , ? ', [start*length,length], function(err, results) {  // ...
              //console.log('select  * from things '+wsql+' order by regDate desc');
				 if (err) {
					connection.release();
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
                    var rs= [];
                    _.each(results, function(one) {
                        try{
                            one.locker = JSON.parse(one.locker);
                            one.things = JSON.parse(one.things);
                            one.saveLocker = JSON.parse(one.saveLocker);
                            one.prices = JSON.parse(one.prices);
							one.photos = JSON.parse(one.photos);
							one.results = JSON.parse(one.results);
                        }catch(E){
                        }
                        rs.push(laundryQuery(connection,one));
						//console.log(rs);
						
						

					 });
					 Promise.all(rs).then(function(res2){
						res.json(res2);
						//res.json({success:true});	
						connection.release();
						
					},function(err){
						connection.release();
						res.status(500).json({"code":10,"type":"error","message":err});
					});
					
					 
				    
		            
		         }
				 //
            });
            //console.log(query);
			
		}
	});
}
router.get('/ThingsStat',ensureAuthorized,ensureAdmin, thingsStat);

function thingsSummary(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			
			//console.log('select count(*) cnt , sum(totalPrice) totalPrice , date_format(pgDate,"%Y-%m-%d") date from things '+wsql+' group by date desc');
			var query = connection.query(`select status,count(*) as cnt from things group by status order by status`, [], function(err, results) {
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

router.get('/ThingsSummary',ensureAuthorized,ensureAdmin, thingsSummary);


function laundryQuery(connection,item){
	return new Promise(function (resolve, reject) {
		///pool.getConnection(function (err, connection) {
			
			var query=connection.query('select * from laundry where thingsSq='+item.thingsSq,[], function (err, rows) {
				
				if (err) {
					//console.log(9999);
					console.log(err);
					reject(err);
				}else{
					item.items=rows;
					resolve(item);
				}
				//connection.release();
			});
		//});
		
		
	});
}


function thingsList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where A.status!="Z" and A.shopSq = '+req.decoded.shopSq;
			//if(req.query.userName) wsql+=' and userName="'+req.query.userName+'"';
			if(req.query.payMethod) wsql+=' and A.payMethod="'+req.query.payMethod+'"';
			if(req.query.method) wsql+=' and A.method="'+req.query.method+'"';
			if(req.query.status) wsql+=' and A.status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and A.regDate>="'+req.query.startDate+'"';
            if(req.query.endDate) wsql+=' and A.regDate<="'+req.query.endDate+'  23:59:59"';
			if(req.query.hp) wsql+=' and A.memberSq in (select memberSq from member where hp="'+req.query.hp+'")';
			if(req.query.userHp) wsql+=' and ( A.userHp like "%'+req.query.userHp+'%" or  C.hp like "%'+req.query.userHp+'%" )';
			if(req.query.userName) wsql+=' and ( A.userName like "%'+req.query.userName+'%" or C.name like "%'+req.query.userName+'%")';
            if(req.query.name) wsql+=' and A.memberSq in (select memberSq from member where name="'+req.query.name+'")';
			//if(req.query.mode=='1') wsql +=' and pgCode is not null';
			if(req.query.mode=='1') wsql +=' and A.status in ("E","F","G","H","I")';
			if(req.query.mode=='2') wsql +=' and A.status in ("A","B")';
			
			//console.log('select count(*) cnt , sum(totalPrice) totalPrice from things A '+wsql+'; select  thingsSq, reqItem, A.regDate, A.status, A.shopSq, yid, A.memberSq, pgCode, totalPrice, locker, things, takeDate, pgDate, saveLocker, prices, photos, confirm, pubDate, shippingDate, method, visitDate, payMethod, COALESCE(A.addr,C.addr) addr, COALESCE(C.hp,A.userHp,B.hp) userHp, COALESCE(C.name,A.userName,B.name) userName, kind, results FROM  things AS A	LEFT JOIN member AS BON B.memberSq = A.memberSq LEFT JOIN customer C ON C.memberSq = COALESCE(A.memberSq, B.memberSq)  '+wsql+' order by A.regDate desc  limit ? , ? ');
			//var wwsql=wsql+ " and C.shopSq="+req.decoded.shopSq;
        //var query = connection.query('select count(*) cnt , sum(totalPrice) totalPrice from things A '+wsql+'; select  thingsSq, reqItem, A.regDate, A.status, A.shopSq, yid, A.memberSq, pgCode, totalPrice, locker, things, takeDate, pgDate, saveLocker, prices, photos, confirm, pubDate, shippingDate, method, visitDate, payMethod, COALESCE(A.addr,C.addr) addr, COALESCE(C.hp,A.userHp,B.hp) userHp, COALESCE(C.name,A.userName,B.name) userName, kind, results FROM  things AS A	LEFT JOIN member AS B ON B.memberSq = A.memberSq LEFT JOIN customer C ON C.memberSq = COALESCE(A.memberSq, B.memberSq)  '+wwsql+' order by A.regDate desc  limit ? , ? ', [start*length,length], function(err, results) {
			var query = connection.query('select count(*) cnt FROM  things AS A       LEFT JOIN member AS B ON B.memberSq = A.memberSq LEFT JOIN customer C ON C.memberSq = COALESCE(A.memberSq, B.memberSq)  '+wsql+'; select  thingsSq, reqItem, A.regDate, A.status, A.shopSq, yid, A.memberSq, pgCode, totalPrice, locker, things, takeDate, pgDate, saveLocker, prices, photos, confirm, pubDate, shippingDate, method, visitDate, payMethod, COALESCE(A.addr,C.addr) addr, COALESCE(C.hp,A.userHp,B.hp) userHp, COALESCE(C.name,A.userName,B.name) userName, kind, results FROM  things AS A       LEFT JOIN member AS B ON B.memberSq = A.memberSq LEFT JOIN customer C ON C.memberSq = COALESCE(A.memberSq, B.memberSq)  '+wsql+' order by A.regDate desc  limit ? , ? ', [start*length,length], function(err, results) {
              // ...
              //console.log('select  * from things '+wsql+' order by regDate desc');
				 if (err) {
		         	res.status(500).json({type:'error',message:err,code:500});
		         }else{
                    var rs= [];
                    _.each(results[1], function(one) {
                        try{
                            one.locker = JSON.parse(one.locker);
                            one.things = JSON.parse(one.things);
                            one.saveLocker = JSON.parse(one.saveLocker);
                            one.prices = JSON.parse(one.prices);
							one.photos = JSON.parse(one.photos);
							one.results = JSON.parse(one.results);
                        }catch(E){
                        }
                        rs.push(one);
                        //console.log(rs);
                     });
		          
				    res.json({
		            	  "draw": parseInt(req.query.draw),
                          "recordsTotal": results[0][0].cnt,
                          "totalPrice": results[0][0].totalPrice,
		            	  "recordsFiltered": results[0][0].cnt,data:rs});
		            
		         }
				 connection.release();
            });
            //console.log(query);
			
		}
	});
}
router.get('/Things',ensureAuthorized,ensureAdmin, thingsList);

function payList(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where shopSq = '+req.decoded.shopSq;
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

function laundryFileUpdate(req,res,next){
	
	
	console.log(req.body);
	//console.log(req.body);
	//"saveHp":"01085481970","saveName":"윤시완" ,"toHp":"111112","toName":"세탁을위한사람들"
	var param={
		
		photos: JSON.stringify(req.body.photos),
	
	};
	 
	var upload = require('./upload');
	upload.savePermantFiles(req.body.photos).then(function(results){
		//console.log('444');
		pool.getConnection(function (err, connection) {
			if (err) {
				//connectin.release();
				//console.log('3333');
				throw err;
			}
			//console.log(1);
			param.photos = JSON.stringify(results);
			var jobs = [dbUpdate(connection,'laundry',param,{
										laundrySq:req.params.laundrySq})];

			Promise.all(jobs).then(function(res1){
				connection.release();
				res.json({});
			},function(err){
				connection.release(); 
				res.status(500).json({"code":10,"type":"error","message":err});
			});
		});
	});

}
router.put('/LaundryFile/:laundrySq',ensureAuthorized,ensureAdmin, laundryFileUpdate)

function thingsResultsSave(req,res,next){
	
	
	//console.log(req.body);
	//console.log(req.body);
	//"saveHp":"01085481970","saveName":"윤시완" ,"toHp":"111112","toName":"세탁을위한사람들"
	/*var param={
		
		photos: JSON.stringify(req.body.photos),
	
	};*/
	console.log(req.body);
	var param={results:req.body};
	
	 
	var upload = require('./upload');
	upload.savePermantFiles(req.body.images).then(function(results){
		//console.log('444');
		pool.getConnection(function (err, connection) {
			if (err) {
				//connectin.release();
				//console.log('3333');
				throw err;
			}
			//console.log(1);
			param.results.images = results;
			param.results = JSON.stringify(param.results);
			console.log(param);
			var jobs = [dbUpdate(connection,'things',param,{
										thingsSq:req.params.thingsSq})];

			Promise.all(jobs).then(function(res1){
				connection.release();
				res.json({});
			},function(err){
				connection.release(); 
				res.status(500).json({"code":10,"type":"error","message":err});
			});
		});
	});

}
router.put('/ThingsResults/:thingsSq',ensureAuthorized,ensureAdmin, thingsResultsSave)

function thingsUpdate(req, res, next) { //인수증 발행 
	
	
	var param={
		confirm: req.body.confirm,
		//prices: JSON.stringify(req.body.prices),
		//photos: JSON.stringify(req.body.photos),
		totalPrice:req.body.totalPrice,
		status:req.body.status,
		pubDate:new Date()
	};

	var results = req.body.results;
	if(results){
		if(!results.images){
			results.images=[];
		}
	}else{
		results={images:[]};
	}
	
	console.log(results.images);
	var upload = require('./upload');
		//console.log(upload);
	upload.savePermantFiles(results.images).then(function(rsfiles){
		pool.getConnection(function (err, connection) {
			if (err) {
				//connectin.release();
				//console.log('3333');
				throw err;
			}
			//console.log(1);
			results.images = rsfiles;
			param.results = JSON.stringify(results);
			var jobs = [dbUpdate(connection,'things',param,{
										thingsSq:req.params.thingsSq})];
			

			jobs.push(dbSelect('member',{memberSq:req.body.memberSq}));
			jobs.push(dbSelect('shop',{shopSq:req.decoded.shopSq}));
			jobs.push(dbSelect('customer',{memberSq:req.body.memberSq,shopSq:req.decoded.shopSq}));
			//console.log();
			Promise.all(jobs).then(function(res1){
				
				targetHp=res1[1].hp;
				if(res1[3]){
					targetHp=res1[3].hp;
				}
				//console.log(req.body.memberSq,res1[1]);
				//if(res1[1] && res1[1].path=='G'){ //기부쪽 메세지 
					
					//shortUrl(`http://okbox.kr/smspay?thingsSq=${req.params.thingsSq}&hp=${req.body.locker.saveHp}`).then(function(res2){
						shortUrl(`http://o2obox.kr/laundry/index.php?thingsSq=${req.params.thingsSq}&hp=${targetHp}`).then(function(res2){	
						
						var format = require("string-template");
						var uuid = require('uuid4');
						//console.log(uuid);
	// Generate a new UUID
						var idstr = uuid();
						var uid = idstr.toUpperCase().replace(/-/g,'');
						var fcmData={   
							/*notification:{
								body: res1[2].companyName+'님이 인수증을 보냈습니다. 세탁신청내역에서 결제 대기중인 항목을 확인후 결제진행 부탁드립니다.', 
								title: '위키박스-세탁',
								sound:'default'
							},*/
							priority : "high",
							data: {
								command:'ACCEPTANCE_ALERT',
								data:JSON.stringify(param), 
								shopName:res1[2].companyName
								//pushId:param.uuid
							},
							content_available:true,
							to:res1[1].regId
						};

						var kindName='명품세탁위키파크빌';
						if(req.body.kind=='F'){
							kindName='위키차량관리';
						}
						dbInsert(connection,'fcmPush',{
							pushId:uid,
							uuid:req.body.locker? req.body.locker.uuid:req.params.thingsSq,
							receiverId:(res1[1]?res1[1].regId:null),
							fcmData:JSON.stringify(fcmData),
							smsData:JSON.stringify({
								dest_phone:targetHp, 
								//send_phone:config.feedbackPhone, 
								send_phone:res1[2].hp, 
								msg_body:format(kindName+'에서 인수증 확인 후 결제부탁드립니다. {url}', {
									url: res2.url
								}),
								uuid:req.body.locker? req.body.locker.uuid:req.params.thingsSq,
							}),
							senderHp:res1[2].hp,
							receiverHp:targetHp,
							senderType:'A',
							senderDate:null
						}).then(function(rr){
							//console.log('success');
							res.json({insertId:rr});
							connection.release();	
						},function(err){
							console.log(err);
							connection.release();
							res.status(500).json({"code":10,"type":"error","message":err});
						});
					},function(err2){
						console.log(err2);
						connection.release();
					});
				
				
				
			},function(err){
				console.log(err);
				connection.release();
				res.status(500).json({"code":10,"type":"error","message":err});
				
			});
			/////////////
			
		}); 
	},function(err){

	});
        
} 
router.put('/Things/:thingsSq', ensureAuthorized,thingsUpdate); // 인수증 발행

function thingsPayUpdate(req, res, next) { //인수증 발행 
    
	//console.log(req.body);
	//"saveHp":"01085481970","saveName":"윤시완" ,"toHp":"111112","toName":"세탁을위한사람들"
	var param={
		payMethod: req.body.payMethod,
		status:req.body.status,
		pgDate:new Date()
	};
	pool.getConnection(function (err, connection) {
		if (err) {
			throw err;
		}
		console.log(1);
		dbUpdate(connection,'things',param,{
			thingsSq:req.params.thingsSq}).then(function(res1){
				//console.log(2);
				res.json({}); 
				//res.json({success:true});	
				connection.release();
		},function(err){
			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	
	});
}
		


router.put('/ThingsPayUpdate/:thingsSq', ensureAuthorized,thingsPayUpdate); // 결제완료

function thingsStatusUpdate(req, res, next) { //인수증 발행 
    
	//console.log(req.body);
	//"saveHp":"01085481970","saveName":"윤시완" ,"toHp":"111112","toName":"세탁을위한사람들"
	var param={
		status:req.body.status
		
	};
	if(req.body.status=='H'){
		param.shippingDate=new Date();
	}
	pool.getConnection(function (err, connection) {
		if (err) {
			throw err;
		}
		console.log(1);
		dbUpdate(connection,'things',param,{
			thingsSq:req.params.thingsSq}).then(function(res1){
				//console.log(2);
				res.json({}); 
				//res.json({success:true});	
				connection.release();
		},function(err){
			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	
	});
}
		


router.put('/ThingsStatusUpdate/:thingsSq', ensureAuthorized,thingsStatusUpdate); // 결제완료
function shortUrl(linkurl){
	return new Promise(function(resolve,reject){
		var api_url = 'https://openapi.naver.com/v1/util/shorturl';
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
	});
	});
}

function getSimpleUrl(url){
	if(url){
		var idx= url.indexOf("https://");
		if(idx>-1){
			return url.substring(idx+8);
		}
		idx= url.indexOf("http://");
		if(idx>-1){
			return url.substring(idx+7);
		}
	}
	return url;
	
}
function dbQuery1(sql){
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			
			var query=connection.query(sql,[], function (err, rows) {
				
				if (err) {
					//console.log(9999);
					console.log(err);
					reject(err);
				}else{
					resolve(rows);
				}
				connection.release();
			});
		});
		
		
	});
}
function laundryDelete(req, res, next) {
    
        
    //console.log(req.query);
    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var query = connection.query("delete from laundry where laundrySq=?  and shopSq=?",[req.params.laundrySq,req.decoded.shopSq], function (err, rows) {
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
router.delete('/Laundry/:laundrySq',  ensureAuthorized,ensureAdmin,laundryDelete);

function laundryList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'100');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where A.thingsSq=B.thingsSq and A.shopSq = '+req.decoded.shopSq;
			if(req.query.thingsSq) wsql+=' and A.thingsSq="'+req.query.thingsSq+'"';
			if(req.query.tid) wsql+=' and A.tid like "%'+req.query.tid+'%"';
			if(req.query.startDate) wsql+=' and A.regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and A.regDate<="'+req.query.endDate+'  23:59:59"';
			if(req.query.iStartDate) wsql+=' and A.confirmDate>="'+req.query.iStartDate+'"';
			if(req.query.iEndDate) wsql+=' and A.confirmDate<="'+req.query.iEndDate+'  23:59:59"';
			if(req.query.oStartDate) wsql+=' and A.outDate>="'+req.query.oStartDate+'"';
			if(req.query.oEndDate) wsql+=' and A.outDate<="'+req.query.oEndDate+'  23:59:59"';
			//console.log(wsql);
        	var query = connection.query('select count(*) cnt  from laundry A, things B '+wsql+'; select  A.*, B.userName,B.userHp from laundry A, things B '+wsql+' order by laundrySq desc  limit ? , ? ', [start*length,length], function(err, results) {
				// ...
				//console.log('select  * from things '+wsql+' order by regDate desc');
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
			
		}
	});
}
router.get('/Laundry',ensureAuthorized,ensureAdmin, laundryList);

function laundryThingsList(req, res, next) {
	//var start = parseInt(req.query.page||'1')-1;
	//var length = parseInt(req.query.display||'100');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where A.shopSq = '+req.decoded.shopSq;
			if(req.query.thingsSq) wsql+=' and A.thingsSq="'+req.query.thingsSq+'"';
			if(req.query.tid) wsql+=' and A.tid="'+req.query.tid+'"';
			if(req.query.startDate) wsql+=' and A.regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and A.regDate<="'+req.query.endDate+'  23:59:59"';
			if(req.query.iStartDate) wsql+=' and A.confirmDate>="'+req.query.iStartDate+'"';
			if(req.query.iEndDate) wsql+=' and A.confirmDate<="'+req.query.iEndDate+'  23:59:59"';
			if(req.query.oStartDate) wsql+=' and A.outDate>="'+req.query.oStartDate+'"';
			if(req.query.oEndDate) wsql+=' and A.outDate<="'+req.query.oEndDate+'  23:59:59"';
			//console.log(wsql);
        	var query = connection.query('select * from things where thingsSq in (select distinct thingsSq from laundry A  '+wsql+') order by thingsSq desc limit 2000', [], function(err, results) {
				// ...
				//console.log('select  * from things '+wsql+' order by regDate desc');
				if (err) {
					res.status(500).json({type:'error',message:err,code:500});
				}else{
					
					res.json(results);
					
				}
				connection.release();
			  });
			
		}
	});
}
router.get('/LaundryThings',ensureAuthorized,ensureAdmin, laundryThingsList);

// 출고 입고 갱신
function laundryUpdate(req, res, next) {
    
	var param={
		//confirmDate:new Date()
	};

	if(req.body.utype=='1'){
		param.outDate=new Date();
	}else if(req.body.utype=='2'){
		param.confirmDate=new Date();
	}
	
	pool.getConnection(function (err, connection) {
		if (err) {
			
			throw err;
		}
		var jobs = [dbUpdate(connection,'laundry',param,{
									laundrySq:req.params.laundrySq,shopSq:req.decoded.shopSq})];
		Promise.all(jobs).then(function(res2){
			res.json({success:true});	
			connection.release();
			
		},function(err){
			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	}); 
	
	
} 
router.put('/Laundry/:laundrySq', ensureAuthorized,laundryUpdate);

function laundryInsert(req, res, next) {
	var param={
		shopSq:req.decoded.shopSq,
		grade:req.body.grade,
		groupName:req.body.groupName,
		num:req.body.num,
		price:req.body.price,
		productName:req.body.productName,
		washType:req.body.washType,
		thingsSq:req.body.thingsSq,
		tid:req.body.tid
	};
	
	
	pool.getConnection(function (err, connection) {
		if (err) {
			//connectin.release();
			throw err;
		}
		
		var jobs=[ 
			dbInsert(connection,'laundry',param),
			dbUpdate(connection,'shop',{lastTid:req.body.tid},{
				shopSq:req.decoded.shopSq
		})
				
		];
		Promise.all(jobs).then(function(res2){
			 
			res.json({laundrySq:res2[0]});
			connection.release();
		},function(err){
			
			//
			console.log(err);

			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	}); 
		
	
}

router.post('/Laundry',  ensureAuthorized,ensureAdmin,laundryInsert);


function thingsPricesUpdate(req, res, next) {
    
	//console.log(req.body);
	//"saveHp":"01085481970","saveName":"윤시완" ,"toHp":"111112","toName":"세탁을위한사람들"
	var param={
		//confirm: req.body.confirm,
		prices: JSON.stringify(req.body.prices),
		//photos: JSON.stringify(req.body.photos),
		//totalPrice:req.body.totalPrice,
		//status:req.body.status,
		//pubDate:new Date()
	};
	pool.getConnection(function (err, connection) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
		}else{
			//PG사 취소도 구현해야합니다.
			dbUpdate(connection,'things',param,{
					thingsSq:req.params.thingsSq
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
router.put('/ThingsPrices/:thingsSq', ensureAuthorized,thingsPricesUpdate);

function sendFcmMessageMember(fcmData,memberSq){
	pool.getConnection(function (err, connection) {
		if (err) {
			console.log(err);
		}else{
			var query = connection.query('SELECT * FROM member WHERE memberSq=?', [memberSq], function(err, results) {
				if (err) {
					//connection.release();
			
				}
				if(results.length>0) {
					fcmData.to = results[0].regId;
					sendFcmMessage(fcmData);
				}
				connection.release();
				
				
			});
		}
	});
}
function sendFcmMessage(fcmData){
	//var FCM = require('fcm').FCM;
	var FCM=require('fcm-push');
	var apiKey = 'AAAAGV33Ils:APA91bG4nuYybd-KAY32VNwh8BBi6-076FX-xhhjW9R3A3gPX0HvFjB_pZgGP2mOa0Dx4RfNia_yM6Dg77KNLgX-kGys2liCWZ9ZmZr70VxP6avhK0lyx-licw_9ZFJj1yssooXYNFx6';
	var fcm = new FCM(apiKey);
	/*
	var message = {
		registration_id: toId, // required
		collapse_key: 'Collapse key', 
		'data': JSON.stringify(fcmData)
		
	};*/

	fcm.send(fcmData, function(err, messageId){
		if (err) {
			console.log(err);
		} else {
			console.log("Sent with message ID: ", messageId);
		}
	});
}
function thingsSelect(req, res, next) {

	
			
		var jobs=[ 
			dbSelect('things',{thingsSq:req.params.thingsSq,shopSq:req.decoded.shopSq}),
			dbQuery('laundry',{thingsSq:req.params.thingsSq,shopSq:req.decoded.shopSq})
		];
		Promise.all(jobs).then(function(results){

			//console.log(results[0]);
			if(!results[0]){
				res.status(404).json({type:'error',message:'no data',code:404});
				
			}else{
				var one = results[0];
				//console.log(results);

				try{
					one.locker = JSON.parse(one.locker);
					one.things = JSON.parse(one.things);
					one.saveLocker = JSON.parse(one.saveLocker);
					one.results = JSON.parse(one.results);

					var rs= [];
		        	 _.each(results[1], function(it) {
			        		
						 it.photos = JSON.parse(it.photos);
						 
		        		 rs.push(it);
			      	});
					if(one.prices){
						/*one.prices = JSON.parse(one.prices);
						if(one.prices.length==0){
							
							one.prices = results[1];
						}*/
						one.prices = rs;	
					}else{
						
						one.prices = rs;	
					}
					//console.log([] | results[1]);
					one.photos = JSON.parse(one.photos);

					res.json(one);
					console.log(one);
				}catch(X){
					console.log(X);
					res.status(500).json({"code":10,"type":"error","message":X});
				}
			}
			
		},function(err){
			console.log(err);
			res.status(500).json({"code":10,"type":"error","message":err});
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
			//if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			//if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
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
			if(req.query.uuid) wsql+=" and uuid='"+req.query.uuid+"'";
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			//if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			//if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
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
			msg_body:req.body.content
	};
	poolSanta.getConnection(function (err, connection1) {
		if (err) {
			res.status(500).json({"code":10,"type":"error","message":err});
			connection1.release();
		}else{
			
			connection.query("INSERT INTO BIZ_MSG set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'),request_time=now(),send_time=now(),?",data, function(err,results) {
			//connection1.query("INSERT INTO uds_msg set msg_type=0,cmid=DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i'),request_time=now(),send_time=now(),?", data, function(err,results1) {
				//console.log(data)
				res.json({success:true});
				connection1.release();
			});
			
		}
	});	
}
router.post('/SendSms',ensureAuthorized,ensureAdmin,sendSms);

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
			
			var wsql='where shopSq='+req.decoded.shopSq;
			if(req.query.productSqs){
				wsql+=' and productSq in('+req.query.productSqs.map(Number).join(',')+')';
			}
			//if(req.query.userId) wsql+=" and userId='"+req.query.userId+"'";
			if(req.query.status) wsql+=" and status='"+req.query.status+"'";
			if(req.query.startDate) wsql+=" and regDate>='"+req.query.startDate+"'";
			if(req.query.endDate) wsql+=" and regDate<='"+req.query.endDate+"  23:59:59'";
			if(req.query.cate) wsql+=" and cate = '"+req.query.cate+"'";
			if(req.query.categoryCode) wsql+=' and categoryCode like "'+req.query.categoryCode+'"';
			if(req.query.title) wsql+=' and title like "%'+req.query.title+'%"';
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
		shopSq:req.decoded.shopSq, // 고유번호
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
	console.log(req.body);
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
					 res.json({success:true,data:one});
		        	 //res.json(one);
		            
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
			
			
			var wsql='where shopSq='+req.decoded.shopSq;
			if(req.query.memberSq) wsql+=' and status='+req.query.memberSq;
			if(req.query.status) wsql+=' and status="'+req.query.status+'"';
			if(req.query.startDate) wsql+=' and regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and regDate<="'+req.query.endDate+'  23:59:59"';
			console.log(wsql);
			var query = connection.query('select count(*) cnt from `order` '+wsql+'; select  * from `order` '+wsql+' order by orderCd desc  limit ? , ? ', [start*length,length], function(err, results) {
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

// 수거목록
function laundryPriceGroupList(req, res, next){
	//var start = parseInt(req.query.page||'1')-1;
	//var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
			//console.log(err);
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			//var topSq = 0; 
			//if(req.query.thingsSq) topSq= req.query.thingsSq;
			//var wsql;
			//wsql=' where  A.yid=B.yid and A.status="A"  and A.toHp = "'+req.decoded.hp+'"';
			
			var query = connection.query('select distinct groupName from laundryPrice where shopSq='+req.decoded.shopSq+' and kind="'+req.params.kind+'" order by sortOrder;', [], function(err, results) {
			
			  // ...
				 if (err) {
					 //console.log(err);
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
router.get('/LaundryPriceGroupList/:kind',ensureAuthorized, laundryPriceGroupList);
function laundryPriceList(req, res, next){
	//var start = parseInt(req.query.page||'1')-1;
	//var length = parseInt(req.query.display||'10');
	
	pool.getConnection(function (err, connection) {
		if (err) {
			//console.log(err);
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			//var topSq = 0; 
			//if(req.query.thingsSq) topSq= req.query.thingsSq;
			//var wsql;
			//wsql=' where  A.yid=B.yid and A.status="A"  and A.toHp = "'+req.decoded.hp+'"';
			
			var query = connection.query('select * from laundryPrice where kind="'+req.params.kind+'" and shopSq='+req.decoded.shopSq+' and groupName="'+req.params.groupName+'" order by sortOrder;', [], function(err, results) {
			
			  // ...
				 if (err) {
					//console.log(err);
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
router.get('/LaundryPriceList/:kind/:groupName',ensureAuthorized, laundryPriceList);


function laundryPriceUpdate(req, res, next) {
    
        
    //console.log(param);
    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        var param={
			dryNormal:req.body.dryNormal,
            dryAdvance:req.body.dryAdvance,
            dryLuxury:req.body.dryLuxury,
            dryChild:req.body.dryChild,
            washNormal:req.body.washNormal,
            washAdvance:req.body.washAdvance,
            washLuxury:req.body.washLuxury,
            washChild:req.body.washChild,
            ironingNormal:req.body.ironingNormal,
            ironingAdvance:req.body.ironingAdvance,
            ironingLuxury:req.body.ironingLuxury,
            ironingChild:req.body.ironingChild,
			sortOrder:req.body.sortOrder,
			productName:req.body.newName
        };
        var query = connection.query("update laundryPrice set ?  where groupName=? and productName=? and shopSq=? and kind=?",[param,req.body.groupName,req.body.productName,req.decoded.shopSq,req.body.kind], function (err, rows) {
            if (err) {
                //console.error("err : " + err);
                res.status(500).json({type:'error',message:err,code:500});
            }else{
                res.json({changedRows:rows.changedRows});
            }
            connection.release();
		});
		console.log(query);
        
    });
}
router.put('/LaundryPrice',  ensureAuthorized,ensureAdmin,laundryPriceUpdate);


function laundryPriceDelete(req, res, next) {
    
        
    console.log(req.query);
    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var query = connection.query("delete from laundryPrice where groupName=? and productName=? and shopSq=? and kind=?",[req.query.groupName,req.query.productName,req.decoded.shopSq,req.query.kind], function (err, rows) {
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
router.delete('/LaundryPrice',  ensureAuthorized,ensureAdmin,laundryPriceDelete);


function laundryPriceInsert(req, res, next) {
	
	pool.getConnection(function (err, connection) {
		if (err) {
            
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			req.body.shopSq = req.decoded.shopSq;
			var query = connection.query('INSERT INTO `laundryPrice` set ?', req.body, function(err, results) {
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
router.post('/LaundryPrice', ensureAuthorized,ensureAdmin,laundryPriceInsert);

//template
function templateDelete(req, res, next) {
    
        
    //console.log(req.query);
    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var query = connection.query("delete from template where templateSq=?  and shopSq=?",[req.params.templateSq,req.decoded.shopSq], function (err, rows) {
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
router.delete('/Template/:templateSq',  ensureAuthorized,ensureAdmin,templateDelete);

function templateList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'100');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where  A.shopSq = '+req.decoded.shopSq;
			//if(req.query.thingsSq) wsql+=' and A.thingsSq="'+req.query.thingsSq+'"';
			//if(req.query.tid) wsql+=' and A.tid="'+req.query.tid+'"';
			if(req.query.startDate) wsql+=' and A.regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and A.regDate<="'+req.query.endDate+'  23:59:59"';
			//console.log(wsql);
        	var query = connection.query('select count(*) cnt  from template A '+wsql+'; select  * from template A '+wsql+'   limit ? , ? ', [start*length,length], function(err, results) {
				// ...
				//console.log('select  * from things '+wsql+' order by regDate desc');
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
			
		}
	});
}
router.get('/Template',ensureAuthorized,ensureAdmin, templateList);


function templateUpdate(req, res, next) {
    
	var param={
		name:req.body.name,
		description:req.body.description
	};
	
	pool.getConnection(function (err, connection) {
		if (err) {
			
			throw err;
		}
		var jobs = [dbUpdate(connection,'template',param,{
									templateSq:req.params.templateSq,shopSq:req.decoded.shopSq})];
		Promise.all(jobs).then(function(res2){
			res.json({success:true});	
			connection.release();
			
		},function(err){
			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	}); 
	
	
} 
router.put('/Template/:templateSq', ensureAuthorized,templateUpdate);

function templateInsert(req, res, next) {
	var param={
		shopSq:req.decoded.shopSq,
		name:req.body.name,
		description:req.body.description
	};
	
	
	pool.getConnection(function (err, connection) {
		if (err) {
			//connectin.release();
			throw err;
		}
		
		var jobs=[ 
			dbInsert(connection,'template',param)];
		Promise.all(jobs).then(function(res2){
			
			res.json({templateSq:res2[0][0]});
			connection.release();
		},function(err){
			
			//
			console.log(err);

			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	}); 
		
	
}

router.post('/Template',  ensureAuthorized,ensureAdmin,templateInsert);


function templateSelect(req, res, next) {
	//console.log('aaaa1111');
	pool.getConnection(function (err, connection) {
		if (err) {
			//console.log(err);
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM template WHERE templateSq = ? and shopSq=?', [req.params.templateSq,req.decoded.shopSq], function(err, results) {
				console.log('1111');
				 if (err) {
					 //console.log(err);
					 //console.log('aaaaaa');
		         	//res.status(500).json({type:'error',message:err,code:500});
                    throw err;
		         }else{
					 
					if(results.length==0){
						res.status(404).json({type:'error',message:'not found',code:404});
					}else{
						res.json(results[0]);
					}
		        	 
		            
		         }
				 connection.release();
			});
			console.log(query);
		}
	});
}
router.get('/Template/:templateSq', ensureAuthorized,ensureAdmin,templateSelect);

//customer


function customerDelete(req, res, next) {
    
        
    //console.log(req.query);
    //console.log(req.body.addr);
    pool.getConnection(function (err, connection) {
        
        var query = connection.query("delete from customer where customerSq=?  and shopSq=?",[req.params.customerSq,req.decoded.shopSq], function (err, rows) {
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
router.delete('/Customer/:customerSq',  ensureAuthorized,ensureAdmin,customerDelete);

function customerList(req, res, next) {
	var start = parseInt(req.query.page||'1')-1;
	var length = parseInt(req.query.display||'100');
	
	pool.getConnection(function (err, connection) {
		if (err) {
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			
			var wsql='where  A.shopSq = '+req.decoded.shopSq;
			if(req.query.memberSq) wsql+=' and A.memberSq ="'+req.query.memberSq+'"';
			if(req.query.name) wsql+=' and A.name like "%'+req.query.name+'%"';
			if(req.query.hp) wsql+=' and A.hp like "%'+req.query.hp+'%"';
			if(req.query.startDate) wsql+=' and A.regDate>="'+req.query.startDate+'"';
			if(req.query.endDate) wsql+=' and A.regDate<="'+req.query.endDate+'  23:59:59"';
			console.log(wsql);
        	var query = connection.query('select count(*) cnt  from customer A '+wsql+'; select  * from customer A '+wsql+' order by regDate desc   limit ? , ? ', [start*length,length], function(err, results) {
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
		        		 one.addr=JSON.parse(one.addr);
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
router.get('/Customer',ensureAuthorized,ensureAdmin, customerList);


function customerUpdate(req, res, next) {
    
	var param={
		name:req.body.name,
		hp:req.body.hp,
		memberSq:req.body.memberSq,
		description:req.body.description,
		addr:JSON.stringify(req.body.addr)
	};
	
	pool.getConnection(function (err, connection) {
		if (err) {
			
			throw err;
		}
		var jobs = [dbUpdate(connection,'customer',param,{
									customerSq:req.params.customerSq,shopSq:req.decoded.shopSq})];
		Promise.all(jobs).then(function(res2){
			res.json({success:true});	
			connection.release();
			
		},function(err){
			connection.release();
			res.status(500).json({"code":10,"type":"error","message":err});
		});
		
	}); 
	
	
} 
router.put('/Customer/:customerSq', ensureAuthorized,customerUpdate);

function customerInsert(req, res, next) {
	var param={
		shopSq:req.decoded.shopSq,
		name:req.body.name,
		hp:req.body.hp,
		description:req.body.description,
		memberSq:req.body.memberSq,
		addr:JSON.stringify(req.body.addr)

	};
	
	
	pool.getConnection(function (err, connection) {
		if (err) {
			//connectin.release();
			throw err;
		}
		
		var jobs=[ 
			dbInsert(connection,'customer',param)];
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

router.post('/Customer',  ensureAuthorized,ensureAdmin,customerInsert);


function customerSelect(req, res, next) {
	//console.log('aaaa1111');
	pool.getConnection(function (err, connection) {
		if (err) {
			//console.log(err);
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM customer WHERE customerSq = ? and shopSq=?', [req.params.customerSq,req.decoded.shopSq], function(err, results) {
				
				 if (err) {
					 //console.log(err);
					 //console.log('aaaaaa');
					 //res.status(500).json({type:'error',message:err,code:500});
					 connection.release();
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
		        		 one.addr=JSON.parse(one.addr);
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

router.get('/Customer/:customerSq', ensureAuthorized,ensureAdmin,customerSelect);

function laundrySelect(req, res, next) {
	//console.log('aaaa1111');
	pool.getConnection(function (err, connection) {
		if (err) {
			//console.log(err);
         	res.status(500).json({type:'error',message:err,code:500});
		}else{
			var query = connection.query('SELECT * FROM laundry WHERE laundrySq = ? and shopSq=?', [req.params.laundrySq,req.decoded.shopSq], function(err, results) {
				
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
		        		 one.photos=JSON.parse(one.photos);
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
router.get('/Laundry/:laundrySq', ensureAuthorized,ensureAdmin,laundrySelect);

function geojson(req, res, next) {
	console.log(req.decoded);
	pool.getConnection(function (err, connection) {
			if (err) {
			res.status(500).json({type:'error',message:err,code:500});
			}else{

					//var wsql='where shopSq='+req.params.shopSq;
					var query = connection.query('select geometry from adm where adm_cd in(select adm_cd from admService where shopSq='+req.decoded.shopSq+')', [], function(err, results) {
					  // ...
							 if (err) {
							res.status(500).json({type:'error',message:err,code:500});
					 }else{
						   var rs= [];
							 _.each(results, function(it) {
								  try{
									 rs.push(JSON.parse(it.geometry));
								  }catch(X){}
							});

						 res.json({"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":rs})

					 }
					  connection.release();
					});
					//console.log(query);
			}
	});
}
router.get('/Geojson', ensureAuthorized,ensureAdmin,geojson);

module.exports = router;
