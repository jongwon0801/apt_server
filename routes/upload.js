var express = require('express');
var router = express.Router({caseSensitive:true});
var fs = require('fs');

/// Include ImageMagick
var im = require('imagemagick');

/// Post files
var dateFormat = require('dateformat');

var location="/mnt/a/uploads/";
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, location+'temp/')
  },
  filename: function (req, file, cb) {
    //cb(null, file.fieldname + '-' + Date.now())
	//var filekey = req.code?
	//console.log('bbb',req.body,req.body.group);
	var key=req.body.group+dateFormat(new Date(), "yymmddHHMMssl")+randomString(2,'N');
	
	cb(null,key);
	
  }
});
function randomString(len, an){
    an = an&&an.toLowerCase();
    var str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
    for(;i++<len;){
      var r = Math.random()*(max-min)+min <<0;
      str += String.fromCharCode(r+=r>9?r<36?55:61:48);
    }
    return str;
}
//gm('11170308162149717').resize(240, 240).write('d.jpg', function (err) {if (!err) console.log('done')});
//gm('11170308162149717').gravity('Center').resize(100,100 + "^>").quality(100).crop(100, 100).write('e.jpg', function (err) {if (!err) console.log('done')});
//var upload = multer({ dest: './uploads/' });
var upload = multer({ storage: storage })
var gm = require('gm').subClass({imageMagick: true});  
var imageWidth=400; imageHeight=220;

//console.log(config.secret);
function uploadForm(req,res){
	//console.log(req);
	//console.log('lsjdlsjdflsdlfsjflsf');

	//console.log(req.headers); 
	//console.log(req.body.group); 
	if(!req.body.group){
		res.status(500).json({type:'error',code:500, message:'group code missing!!!'});
	}else{
		var fileObj={size: req.file.size,
			//encoding: req.file.encoding,
			size: req.file.size,
			group: req.body.group,
			fileKey: req.file.filename,
			originalname:req.file.originalname,
			//url:'/upload/'+req.file.filename,
			//tmpUrl:'/upload/tmp/'+req.file.filename,
			//thumbnailUrl:'/upload/thumbs/'+req.file.filename,
			//deleteUrl:'/'+req.file.path,
			path:'/uploads/temp/',
			type:req.file.mimetype
		};
		//console.log(fileObj);
		//console.log({group:req.body.group}); 
		fs.writeFile(location+'temp/'+req.file.filename+'.json', JSON.stringify(fileObj) , 'utf-8',function(err){
			if(err){
				console.log(err);
				res.status(500).json({type:'error',code:500, message:err});
				
			}else{
				res.json(fileObj);
			
			}
		});
	}

}

router.post('/',upload.single('files[]'), uploadForm);
//router.post('/1',upload.single('files[]'), function(req, res) {

	//console.log(req.body) // form fields
    //console.log(req.file) // form files
    //res.status(204).end()
	
	/*
	 * { fieldname: 'files[]',
  originalname: 'winki512.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: 'uploads/',
  filename: '9c971c658bffb3ed598868ad6a3d9691',
  path: 'uploads/9c971c658bffb3ed598868ad6a3d9691',
  size: 272235 }
	 * 
	 * item.put("name",fileName);
    	 		item.put("size", uploadfile.getSize());
    	 		item.put("deleteType", "DELETE");
    	 		item.put("url", "/ad/file/image/"+newFileName);
    	 		item.put("thumbnailUrl", "/ad/file/image/"+newFileName+"?width=100");
    	 		item.put("deleteUrl", "/ad/file/image/"+newFileName);
    	 		item.put("type","image/"+extension);
    	 		//com.mbagix.jc.model.Driver
    	 		List array =  new ArrayList();
    	 		array.add(item);
    	 		jsonResult.put("files", array);
	 */
	 //console.log(req.file);
/*	  var newPath =req.file.path;
	  if (fs.existsSync(newPath)) {
		    // Do something
		  
		  //console.log('ddddddddddddddddddd');
	  }
	  //console.log(__dirname);
	  var thumbPath = 'uploads/thumbs/' + req.file.filename;

	  /// write file to uploads/fullsize folder
	  //fs.writeFile(newPath, data, function (err) {

	  	/// write file to uploads/thumbs folder
		  /*im.resize({
			  srcPath: newPath,
			  dstPath: thumbPath,
			  width:   200
			}, function(err, stdout, stderr){
			  if (err) {
				  console.log(err);
				  throw err;
			  }
			  //console.log('resized image to fit within 200x200px');
			  res.json({files:[{size:req.file.size,
					deleteType:'DELETE',
					url:'/'+req.file.path,
					thumbnailUrl:'/upload/thumbs/'+req.file.filename,
					deleteUrl:'/'+req.file.path,
					type:req.file.mimetype
			  	}]});
			});
			*/
	  /* gm(newPath)
	  .options({imageMagick: true})
	  .resize(200, 200)
	  .write(thumbPath, function (err) {
		  res.json({files:[{size:req.file.size,
			    fileKey:req.file.filename,
				deleteType:'DELETE',
				url:'/'+req.file.path,
				thumbnailUrl:'/upload/thumbs/'+req.file.filename,
				deleteUrl:'/'+req.file.path,
				type:req.file.mimetype
		  	}]});
		  fs.writeFile('uploads/'+req.file.filename+'.tmp', JSON.stringify({size:req.file.size,
			  	fileKey:req.file.filename,
				deleteType:'DELETE',
				url:'/'+req.file.path,
				thumbnailUrl:'/upload/thumbs/'+req.file.filename,
				deleteUrl:'/'+req.file.path,
				type:req.file.mimetype
		  	}) , 'utf-8',function(err){
			  if(err){
				  console.log(err);
			  }
		  });
	      //if (!err) console.log('done');
	      if(err){
	         console.log(err);   
	      }
	  });

		   //res.redirect("/uploads/fullsize/" + imageName);
		  	
	  //});
	
});
*/

function createThumbnail(fileKey,width,height){
	return new Promise(function(resolve,reject){
		try{
			var group = fileKey.substring(0,2);
			var dir = fileKey.substring(2,8);
			var toFullDir= location+'files/'+group+'/'+dir+'/'+fileKey+'/';
		
			var fileObj = JSON.parse(fs.readFileSync(toFullDir + fileKey+'.json'));
			//console.log(fileObj.type);
			//if(fileObj.type.indexOf('image')>-1){
    			///if(req.file.mimetype.indexOf('image')>-1){
    		    //fileObj.thumbnailUrl = '/upload/thumbs/'+req.file.filename;
    		    //}
				var newPath =toFullDir+fileObj.fileKey;
				var thumbPath = toFullDir + fileObj.fileKey+'_'+width+'x'+height;
                /*
				gm(newPath)
				.options({imageMagick: true})
                .resize(width, '!')
                .gravity('Center')
                .crop(width, height)
				.write(thumbPath, function (err) {
					
				      if(err){
                          reject(false);
				      }else{
				    	  resolve(true);
				      }
				  });*/
				  gm(newPath)
				  //.noProfile()
				  .gravity('Center')
				.resize(width, height + "^>")
				.quality(100)
				.crop(width, height)
				.write(thumbPath,function (err) { 
						console.log(err);
				      if(err){
                          reject(false);
				      }else{
				    	  resolve(true);
				      }
				  });
				
			//}else{
			//	reject(true);
			//}
		}catch(ex){
			console.log(ex);
			reject(ex);
		}
	});
}

function deleteFile(fileKey){
	var group = fileKey.substring(0,2);
	var dir = fileKey.substring(2,8);
	var toFullDir= location+'files/'+group+'/'+dir+'/'+fileKey+'/';
	if( fs.existsSync(toFullDir) ) {
		fs.readdirSync(toFullDir).forEach(function(file,index){
			var curPath = toFullDir  + file;
			fs.unlinkSync(curPath);
		});
		fs.rmdirSync(toFullDir);
	}
	
}
function savePermantFiles(array){

	//console.log('aaaaa',array);
	return new Promise(function (resolve, reject) {
		try{
			if(!array) reject('no file');
			if(Array.isArray(array)){
				if (array.length==0){
					resolve([]);
					return;
				}

				preDatas=[];
				array.forEach(function(dt) {
					if(dt.isDeleted && dt.isDeleted==true)
						deleteFile(dt.fileKey);	
					else
						preDatas.push(savePermantFile(dt.fileKey)); 
				});
				Promise.all(preDatas).then(function(rsdata){
					rsdata.forEach(function(dt) {
						array.forEach(function(sdt) {
							if( dt.fileKey ==sdt.fileKey && sdt.desc){
								dt.desc = sdt.desc;
							}
						});
					});
					resolve(rsdata);
				},function(err){
					reject(err);
				});

			}else if(typeof(array)=='string'){
			
				savePermantFile(array).then(function (text) {
					resolve(text);
				}, function (err) {
					reject(err);
				});
				
			}else if(typeof(array)=='object'){
				if(array.isDeleted && array.isDeleted==true) {
						deleteFile(array);	
						resolve(null);
				}else {
					savePermantFile(array.fileKey).then(function (text) {
						if(array.desc){
							text.desc=array.desc;
						}
						resolve(text);
					}, function (err) {
						reject(err);
					});
				}
			}
		}catch(ex){
			console.log(ex);
			reject(ex);
		}
	});
}
function savePermantFile(fileKey) {

	//console.log('filekey:'+fileKey);
	return new Promise(function (resolve, reject) {
		try{

			
			
			var tempFile = location+'temp/' + fileKey+'.json';
			
			if (!fs.existsSync(tempFile)) {
			//if (!tmp) {
				
				
				var group = fileKey.substring(0,2);
				var dir = fileKey.substring(2,8);
				var toFullDir= location+'files/'+group+'/'+dir+'/'+fileKey+'/';
				
				if (fs.existsSync(toFullDir+fileKey+'.json')) {
					var tmp = fs.readFileSync(toFullDir + fileKey+'.json');
					resolve(JSON.parse(tmp));
				}else{
					reject( 'not found file');	
				}
			}else{
				var tmp = fs.readFileSync(tempFile);		
				var meta = JSON.parse(tmp);
				var group = fileKey.substring(0,2);
				var dir = fileKey.substring(2,8);
				meta.path='/uploads/files/'+group+'/'+dir+'/'+fileKey+'/';
				
				var toFullDir= location+'files/'+group+'/'+dir+'/'+fileKey+'/';
				var mkdirp = require('mkdirp');
				mkdirp.sync(toFullDir);
				//fs.renameSync(location+'temp/' + fileKey + '.json', toFullDir+fileKey+'.json');

				fs.writeFileSync(toFullDir+fileKey+'.json', JSON.stringify(meta) , 'utf-8');
				fs.renameSync(location+'temp/' + fileKey  , toFullDir+fileKey);
				fs.unlinkSync(location+'temp/' + fileKey +'.json');
				resolve(meta);
			}
		}catch(E){
			console.log(E);
			reject( E);
		}
	});
}

function save(req, res){
	
	var fileKey = req.params.fileKey;
	savePermantFile(fileKey)
	.then(function (text) {
		// 성공시
		//console.log(text);
		res.json({});
	}, function (err) {
		// 실패시 
		//console.error(error);
		res.status(500).json({type:'error',code:500,message:err});
	});
	
}
//router.get('/save/:fileKey', save);

/// Show files
router.get('/save/:fileKey', function (req, res){
	var fileKey = req.params.fileKey;
	
	savePermantFile(fileKey).then(function (text) {
		res.json({success:true});
	}, function (err) {
		// 실패시 
		//console.error(error);
		res.status(500).json({type:'error',code:500,message:err});
	});

});
router.get('/info/:fileKey', function (req, res){
	var fileKey = req.params.fileKey;
	var img = fs.readFileSync('uploads/' + fileKey+'.json');
	//res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.json(img);

});
router.get('/:fileKey', function (req, res){
	var fileKey = req.params.fileKey;
	//var meta;
	try {

		
		var group = fileKey.substring(0,2);
		var dir = fileKey.substring(2,8);
		var toFullDir= location+'files/'+group+'/'+dir+'/'+fileKey+'/';
		if (fs.existsSync(toFullDir+'/'+fileKey)) {
			meta = JSON.parse(fs.readFileSync(toFullDir+fileKey+'.json'));
			var data = fs.readFileSync(toFullDir+fileKey);
			res.writeHead(200, {'Content-Type': meta.type });
			res.end(data, 'binary');
		    
			
	    }else{
			var tempFile= location+'temp/'+fileKey;
			if (fs.existsSync(tempFile)){
				meta = JSON.parse(fs.readFileSync(tempFile+'.json'));
				var data = fs.readFileSync(tempFile);
				res.writeHead(200, {'Content-Type': meta.type });
				res.end(data, 'binary');
			}else{
				res.status(404).send('Not found');	
			}
			//
		}
		//var meta = JSON.parse(fs.readFileSync('uploads/' + fileKey+'.json'));
	
	
		
	}catch(X){
		res.status(404).end();
	}
});
router.get('/:fileKey/:size', function (req, res){
	var fileKey = req.params.fileKey;

	//var meta;
	//console.log('sljfljsf');
	try {
		var size = req.params.size;
		
		var group = fileKey.substring(0,2);
		var dir = fileKey.substring(2,8);
		var toFullDir= location+'files/'+group+'/'+dir+'/'+fileKey+'/';
		if (fs.existsSync(toFullDir+fileKey)) {
			if (fs.existsSync(toFullDir+fileKey+'_'+size)) {
				meta = JSON.parse(fs.readFileSync(toFullDir+fileKey+'.json'));
				var data = fs.readFileSync(toFullDir+fileKey+'_'+size);
				res.writeHead(200, {'Content-Type': meta.type });
				res.end(data, 'binary');
				
				
			}else{
				var sizes = size.split('x');
				if(isContainsSize(group,parseInt(sizes[0]), parseInt(sizes[1]))){
					createThumbnail(fileKey, parseInt(sizes[0]), parseInt(sizes[1])).then(function (text) {
						
						meta = JSON.parse(fs.readFileSync(toFullDir+fileKey+'.json'));
						var data = fs.readFileSync(toFullDir+fileKey+'_'+size);
						res.writeHead(200, {'Content-Type': meta.type });
						res.end(data, 'binary');
					}, function (err) {
						
						res.status(500).json({type:'error',code:500,message:err});
					});
				}else{
					res.status(404).send('no size');
				}
				
			}
		
		}else{
			var tempFile= location+'temp/'+fileKey;
			var sizes = size.split('x');
			width=parseInt(sizes[0]);
			height=parseInt(sizes[1]);
			if (fs.existsSync(tempFile)){
				gm(tempFile)
				  //.noProfile()
				.gravity('Center')
				.resize(width, height + "^>")
				.quality(100)
				.crop(width, height)
				.stream(function (err, stdout, stderr) {
					stdout.pipe(res);
					//console.log('wrrrr');
				});
			}else{
				res.status(404).send('Not found');	
			}
			//res.status(404).send('Not found');
		}
	
		
	}catch(X){
		console.log(X);
		res.status(404).end();
	}
});
function isContainsSize(group,width,height){
	try{
		var fileObj = JSON.parse(fs.readFileSync(location+group+'.json'));
		for(var i=0; i<fileObj.thumbs.length; i++){
			if(fileObj.thumbs[i].width==width && fileObj.thumbs[i].height==height)
				return true;
		}
	}catch(ex){
		console.log(ex);
		return true;
	}
	return false;
}
router.get('/temp/:fileKey', function (req, res){
	var fileKey = req.params.fileKey;
	var meta = JSON.parse(fs.readFileSync(location+'temp/' + fileKey+'.json'));
	
	var data = fs.readFileSync(location+'temp/' + fileKey);
	res.writeHead(200, {'Content-Type': meta.type });
	res.end(data, 'binary');

});

/*
router.delete('/thumbs/:file', function (req, res){
	
});
*/
module.exports = router;
module.exports.savePermantFiles = savePermantFiles;
module.exports.savePermantFile= savePermantFile;