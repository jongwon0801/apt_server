var express = require('express');
var router = express.Router({caseSensitive:true});
var fs = require('fs');

/// Include ImageMagick
var im = require('imagemagick');

/// Post files
var dateFormat = require('dateformat');

var location="/opt/node-locker/uploads/";
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, location+'movie/')
  },
  filename: function (req, file, cb) {
    //cb(null, file.fieldname + '-' + Date.now())
	//var filekey = req.code?
	//console.log('bbb',req.body,req.body.group);
	var key=req.body.group+dateFormat(new Date(), "yymmddHHMMssl");
	
	cb(null,key);
	
  }
});
//gm('11170308162149717').resize(240, 240).write('d.jpg', function (err) {if (!err) console.log('done')});
//gm('11170308162149717').gravity('Center').resize(100,100 + "^>").quality(100).crop(100, 100).write('e.jpg', function (err) {if (!err) console.log('done')});
//var upload = multer({ dest: './uploads/' });
var upload = multer({ storage: storage })
var gm = require('gm').subClass({imageMagick: true});  
var imageWidth=400; imageHeight=220;

//console.log(config.secret);
function uploadForm(req,res){
	//console.log('lsjdlsjdflsdlfsjflsf');

	//console.log(req.body); 
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
			path:'/uploads/movie/',
			type:req.file.mimetype
		};
		//console.log(fileObj);
		//console.log({group:req.body.group}); 
		fs.writeFile(location+'movie/'+req.file.filename+'.json', JSON.stringify(fileObj) , 'utf-8',function(err){
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
				if(array.isDeleted==true) {
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
router.get('/:fileKey', function (req, res){
	var fileKey = req.params.fileKey;
	//var meta;
	try {

		
		var group = fileKey.substring(0,2);
		var dir = fileKey.substring(2,8);
		
        var tempFile= location+'movie/'+fileKey;
        if (fs.existsSync(tempFile)){
            meta = JSON.parse(fs.readFileSync(tempFile+'.json'));
            //var data = fs.readFileSync(tempFile);
            fs.readFile(tempFile, function(err, data) {
                if (err) throw err;
                //console.log('reading file...', data.toString('base64'));
                //res.send(data);
                res.end(data, 'binary');
                res.end();
            });
            res.writeHead(200, {'Content-Type': meta.type });
            //
        }else{
            res.status(404).send('Not found');	
        }
			//
		
		//var meta = JSON.parse(fs.readFileSync('uploads/' + fileKey+'.json'));
	
	
		
	}catch(X){
		res.status(404).end();
	}
});

module.exports = router;