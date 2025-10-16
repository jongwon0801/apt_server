angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
						'/css/upload.css',
		               '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
					   '/bower_components/upload/vendor/jquery.ui.widget.js',
		               '/bower_components/upload/jquery.iframe-transport.js',
		               '/bower_components/upload/jquery.fileupload.js',
		               'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/css/bootstrap-datepicker3.css',
		               'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/js/bootstrap-datepicker.min.js',
		               '/bower_components/sweetalert/dist/sweetalert.css',
		               '/bower_components/sweetalert/dist/sweetalert.min.js',
		               '/bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
			           '/bower_components/magnific-popup/dist/magnific-popup.css',
					   '/bower_components/angucomplete-alt/angucomplete-alt.css',
					   '/bower_components/angucomplete-alt/angucomplete-alt.js',
						 '/shared/controller/modal.addr.new.js',
						 //'/js/lockerScript.js'
			           ],cache:true,serie: true}])
.controller('AppleboxEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Applebox,AppleboxSetting,Buyer,Member,$resource,$state) {
  


	var HSCApplebox = function(data, cabinetColor,width,height) {
		this.data = data;
		this.width = width;
		this.height = height;
		this.dconvert = function(origin, originTarget,screen){
			var widthRatio = screen.width/origin.width;
			var heightRatio = screen.height/origin.height;
			return new HSCRect((originTarget.left*widthRatio),(originTarget.top*heightRatio),
				(originTarget.right*widthRatio), (originTarget.bottom*heightRatio));
	
		}
		this.getRatio=function(ow,oh,tw,th){ // fit size(tw,th 중 하나에 fit)
			//console.log(ow,oh,tw,th);
			r1 = tw/ow;
			r2 = th/oh;
			
			var mv = Math.min(r1,r2);
			//console.log(ow*mv,oh*mv);
			var v =new HSCRect(0,0,ow*mv,oh*mv);
			//console.log(v);
			return v;
		};
		//this.target_id_str= target_id_str;
		this.cabinetColor = cabinetColor;
		/*
		this.getKioskWidth=function(){ // 키오크키 폭 
			for(i =0; i<this.data.cabinet.length; i++){
				for(j=0; j<this.data.cabinet[i].box.length; j++){
					if(this.data.cabinet[i].box[j].kind=='A') // kisok box
						return this.data.cabinet[i].box[j].width;
				}
			}
			
		};
		this.columnWidth = this.getKioskWidth();  // 키오스키의 폭 
		*/
		this.getMaxHeight=function(){ // 열중 제일 긴 높이 
			maxHeight=0;
			for(i =0; i<this.data.cabinet.length; i++){
				var vHeight=0;
				cwidth=0;
				var cw = 0;
				for(j=0; j<this.data.cabinet[i].box.length; j++){
					var box = this.data.cabinet[i].box[j];
					if(j==0) cw= box.width;
					cwidth +=box.width;
					if(cw==cwidth){
						vHeight+= box.height;
						cwidth=0;
					}
				}
			   // console.log(vHeight);
				if(maxHeight < vHeight){
					maxHeight=vHeight;
				}
			}
		   
			return maxHeight;
		};
		this.controlPoint=function(){ // 열중 제일 긴 높이 
			//var maxHeight=0;
			var arr = new Array(this.data.cabinet.length);
	  
			var currentJumper;
			var startCol=0;
	  
			for(var i =0; i<this.data.cabinet.length; i++){
			
				
				var jumper = this.data.cabinet[i].box[0].jumper;
				if(currentJumper){
					if(jumper==currentJumper){
	  
					}else{
						arr[startCol+Math.floor((i-startCol)/2)]=true;
						startCol=i;
						currentJumper=jumper;
					}
				}else{
					currentJumper=1;
					startCol=0;
				}
				if(i==this.data.cabinet.length-1){
					arr[startCol+Math.floor((i-startCol)/2)]=true;
				}
			}
       
			return arr;
		};
		/*this.getMaxWidth=function(cols){
			var maxWidth=0;
			for(i =0; i<cols.length; i++){
				var box = cols[i];
				if(box.width>maxWidth){
					maxWidth = box.width;
				}
			}
			return maxWidth;
		}*/
		this.maxHeight = this.getMaxHeight(); // 열중 제일 큰 거의 높이
		//console.log('hiehgt',this.maxHeight);
		
		this.calc = function(){

			//var cpoints=this.controlPoint();
			var pTotalWidth=0;
			var sTotalWidth = 0;
			for(i =0; i<this.data.cabinet.length; i++){
				pTotalWidth+= this.data.cabinet[i].box[0].width;
				sTotalWidth+= this.data.cabinet[i].box[0].width*pTotalWidth/this.width;
			}
			// label height;
			var TOP_LABEL_HEIGHT=30; 
			 //locker's physical size
			var realRect = new HSCRect(0,0,pTotalWidth,this.maxHeight);
	
			// user defined screen size 
			var screen = new HSCRect(0,0,sTotalWidth,this.height-TOP_LABEL_HEIGHT);
	
			// user defiend screen size to  fit size
			var sout = this.getRatio(realRect.getWidth(),realRect.getHeight(),screen.width,screen.height);
			
			//sout.height:realRect.height=TOP_LABEL_HEIGHT
	
			//val = realRect.height*TOP_LABEL_HEIGHT/sout.height;
			
			//var LEFT_MARGIN = parseInt(Math.abs(screen.getWidth()-sout.getWidth())/2); // physical size;
			var LEFT_MARGIN=0;
			
			 
			
			this.cabinets =[]; 
			self= this;
			var l = 0;
			for(i =0; i<this.data.cabinet.length; i++){
				var addedWidth = 0,vHeight=0;
				var cw= this.data.cabinet[i].box[0].width;
				
				var source =new HSCRect(l,0,l+cw,realRect.height*TOP_LABEL_HEIGHT/sout.height);
				result = this.dconvert(realRect,source,sout);
				result.shift(LEFT_MARGIN,0);
				self.cabinets.push(new HSCCabinet(result,{label:this.data.cabinet[i].label},this.color = 'white'));
				for(j=0; j<this.data.cabinet[i].box.length; j++){
					var box = this.data.cabinet[i].box[j];
					if(addedWidth==0){
						vHeight += box.height;
					}
					
					t = this.maxHeight - vHeight;  // top
					r = l+addedWidth + box.width; // 베이스 오른쪽 라인 // right
					b = t + box.height; // bottom
					
					var source =new HSCRect(l+addedWidth,t,r,b);
					result = this.dconvert(realRect,source,sout); // left, top right bottom
					//result.shiftRight(LEFT_MARGIN);
					//result.shiftBottom(TOP_LABEL_HEIGHT);
					result.shift(LEFT_MARGIN,TOP_LABEL_HEIGHT);
					addedWidth+=box.width;
					
					if(addedWidth == cw) {
						addedWidth=0;
					}
					self.cabinets.push(new HSCCabinet(result,box,this.color = this.cabinetColor[box.status.charCodeAt(0)-65]));
					
				}
				l = l+cw;
				
			}
	
			//console.log(this.cabinets);
			return this.cabinets;
		};
	   
		
	};
	
	var HSCCabinet = function(location,box,color){
		this.loc=location;
		this.box=box;
		this.color=color;
		
	};
	var HSCRect =  function(left,top, right,bottom){
		this.left = left;
		this.top=top;
		this.right=right;
		this.bottom=bottom;
		this.getWidth=function(){
			return this.right-this.left;
		};
		this.getHeight=function(){
			return this.bottom-this.top;
		}
		this.width = this.getWidth();
		this.height=this.getHeight();
		this.shift=function(x,y){
			this.shiftRight(x);
			this.shiftBottom(y);
		}
		this.shiftRight=function(av){
			this.left+=av;
			this.right+=av;
		};
		this.shiftBottom = function(av){
			this.top+=av;
			this.bottom+=av;
		}
	
	}
	
	
	
	
	
	function init_viewport(j_data, cc,width, height)
	{
		//console.log(width*j_data.cabinet.length);
		return new HSCApplebox(j_data,cc,width,height).calc();
	}

		cc = ['#ff0000','#00ffff','#ff00ff','#ffff00','#0000ff'];

        //$scope.list = init_viewport(cabinets,cc,500,900);

        // 키오스크 칸의 컬럼 크기 
        var sw=500/2.5;
		var wh=1800/2.5;
		$scope.data={
            applebox:[],
            cabinet:[]
        }
        $scope.list = init_viewport($scope.data,cc,sw,wh);

		//$scope.list = init_viewport(cabinets,cc,sw,wh);

		$http.get('/admin/Boxtypes')
		.then(function(response) {
			console.log(response.data)
			$scope.boxtypes=response.data;
		}, function(x) {
			
		});
		$scope.boxtypes={};

function addBoxCol(result){

	//console.log(result);
	addItem=$scope.boxtypes[result.boxtype];

	console.log(addItem);
	var labelIndex=(result.key=='A'?addItem.length-1: addItem.length);
	for(var i=0; i<addItem.length; i++){

		it=addItem[i];
		if(it['kind']=='B'){
			it.label=String.fromCharCode(65+$scope.data.cabinet.length)+labelIndex;
			labelIndex--;
		}else{
			it.label="Main";
		}
	}
	$scope.data.cabinet.push({
		label:String.fromCharCode(65+$scope.data.cabinet.length),
		width:500,
		box:JSON.parse(JSON.stringify(addItem))
	});
	cc = ['#ff0000','#00ffff','#ff00ff','#ffff00','#0000ff'];

	var sw=500/2.5;
	var wh=1800/2.5;
	
	$scope.list = init_viewport($scope.data,cc,sw,wh);
}

$scope.choiceCol=function(){

	//console.log('openmodal');
	$modal.open({
		animation:true,
		templateUrl: "views/applebox/modal.locker.col.html",
		//backdrop: false,
		//windowClass: 'right fade',
		//keyboard: true,
		controller: 'ModalLockerColCtrl',
		resolve: {
			item: function () {
				return {};
				}
			}
		}).result.then(function (selectedItem) {
			if(selectedItem){
				addBoxCol(selectedItem);
			}
			console.log(selectedItem);
		}, function () {
			//$log.info('Modal dismissed at: ' + new Date());
		});
	

}
$scope.addrOpen=function(){
		//console.log('openmodal');
		$modal.open({
			animation:true,
			templateUrl: "/shared/views/modal.addr.new.html",
			//backdrop: false,
			//windowClass: 'right fade',
			//keyboard: true,
			controller: 'ModalAddrNewCtrl',
			resolve: {
				item: function () {
					return {};
					}
				}
			}).result.then(function (selectedItem) {

				//console.log(selectedItem);
				console.log($scope.item);
				$scope.item.addr=$scope.item.addr||{};
				

				$scope.item.addr.zipNo=selectedItem.zipNo;
				$scope.item.addr.roadAddrPart1=selectedItem.roadAddrPart1;
				$scope.item.addr.roadAddrPart2=selectedItem.roadAddrPart2;
				
				//$scope.item.addr.roadAddr=selectedItem.roadAddr;
			}, function () {
				//$log.info('Modal dismissed at: ' + new Date());
			});
		
	} 
	
  //$scope.buyer={'companyName':'sdfsdf'}

  $scope.list=[];
  $scope.loadData=function(){
	  
	  if($stateParams.yid){
			$q.all([Applebox.get($stateParams).$promise,AppleboxSetting.get($stateParams).$promise,MyCache.loadGCode(['applebox.status','yn','applebox.useType'])]).then(function(results){
				$scope.item=results[0];
				$scope.cdata=results[1];
				Buyer.get({buyerSq:results[0].buyerSq},function(rs){
					//console.log(rs);
					$scope.buyer = rs;


					//$scope.bleName=getBleName($stateParams.yid);
				},function(err){

				});
			},function(err){
				ERROR($state,err);
			});
	  }else{

			$scope.item={};
			$q.all([MyCache.loadGCode(['applebox.status','yn','applebox.useType'])]).then(function(results){
			
			},function(err){
				ERROR($state,err);
			});
	  }
  }
  $scope.loadData();
	
	
	$scope.formSubmitSetting=function(){ // 수정하기 
		$scope.cdata.yid=$stateParams.yid;
		AppleboxSetting.update($scope.cdata,function(res){

				
			toastr.success('성공적으로 수정하였습니다!!!');
			$scope.loadData();
			//$location.path('/applebox/list');
				
		},function(err){
			ERROR($state,err);
		});
	}
	 //console.log('dddd');
	 $scope.formSubmit=function(){ // 수정하기 
	if($stateParams.yid){
		Applebox.update($scope.item,function(res){

				
			toastr.success('성공적으로 수정하였습니다!!!');

			$location.path('/applebox/list');
				
		},function(err){
			ERROR($state,err);
		});
	 }else{
			console.log($scope.list);
			
		if($scope.buyer) {

			idx=0;
			for(i =0; i<$scope.data.cabinet.length; i++){
				idx++;
				for(j=0; j<$scope.data.cabinet[i].box.length; j++){
					//if(j==0) continue;
					//console.log($scope.list[idx++])			
					$scope.data.cabinet[i].box[j].jumper=$scope.list[idx].jumper;
					$scope.data.cabinet[i].box[j].serial=$scope.list[idx].serial;
					idx++;
				}
				 
			
			
			}

			$scope.item.buyerSq = $scope.buyer.buyerSq;
			$scope.data['applebox']=$scope.item;
			
			$http.post('/admin/AppleboxAll', $scope.data).then(function(res){
				toastr.success('성공적으로 입력했습니다.');
				$location.path('/applebox/list');
			},function(err){
				toastr.error("error"+err);
			});

			/*
			Applebox.save($scope.item,function(res){


				toastr.success('성공적으로 입력하였습니다!!!');
					
			},function(err){
				ERROR($state,err);
			});*/
		}else{
			toastr.success('구매자를 선택해주세요.');
		}
	 }
  }
  $scope.initUpload=function(){

	  //console.log(1111);
	  $('#fileupload').fileupload({
	        url: '/upload',
	        dataType: 'json',
	        //autoUpload:true,
	        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
	        
	        done: function (e, data) {
	        	//console.log(data.result);
	        	var file = data.result;
	        	//$scope.item.thumbnail = file.thumbnailUrl;
	        	$scope.item.thumbnail = file;
                $scope.$apply();
                procImage();
	            /*$.each(data.result.files, function (index, file) {
	            	$scope.item.thumbnail = file.thumbnailUrl;
	                $scope.$apply();
	                
	            });*/
	        },
	        progressall: function (e, data) {
	            /*var progress = parseInt(data.loaded / data.total * 100, 10);
	            $('#progress .progress-bar').css(
	                'width',
	                progress + '%'
	            );*/
	        }
	   });
    }	
 function procImage (){
	  $('.image-popup-no-margins').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			closeBtnInside: false,
			fixedContentPos: true,
			mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
			image: {
				verticalFit: true
			},
			zoom: {
				enabled: true,
				duration: 300 // don't foget to change the duration also in CSS
			}
		});

  }


  /////////////



  ///////////////
}).directive('ngAutocomplete', function($parse) {
    return {

      scope: {
        details: '=',
        ngAutocomplete: '=',
        options: '='
      },

      link: function(scope, element, attrs, model) {

        //options for autocomplete
        var opts

        //convert options provided to opts
        var initOpts = function() {
          opts = {}
          if (scope.options) {
            if (scope.options.types) {
              opts.types = []
              opts.types.push(scope.options.types)
            }
            if (scope.options.bounds) {
              opts.bounds = scope.options.bounds
            }
            if (scope.options.country) {
              opts.componentRestrictions = {
                country: scope.options.country
              }
            }
          }
        }
        initOpts()

        //create new autocomplete
        //reinitializes on every change of the options provided
        var newAutocomplete = function() {
          scope.gPlace = new google.maps.places.Autocomplete(element[0], opts);
          google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
            scope.$apply(function() {
//              if (scope.details) {
                scope.details = scope.gPlace.getPlace();
//              }
              scope.ngAutocomplete = element.val();
            });
          })
        }
        newAutocomplete()

        //watch options provided to directive
        scope.watchOptions = function () {
          return scope.options
        };
        scope.$watch(scope.watchOptions, function () {
          initOpts()
          newAutocomplete()
          element[0].value = '';
          scope.ngAutocomplete = element.val();
        }, true);
      }
    };
  }).controller('ModalAddrNewCtrl', function($scope,$http,$init) {
	
	 $scope.goSearch= function(){
		  $http.get('/v1/addr_new', {
		        params:  {query: $scope.query},
		    }
		)
		.then(function(response) {
			//console.log(response.data)
		}, function(x) {
		    
		})
		return false;
	  };
	  
	  $scope.close=function(idx,item){
		$ocModal.close('addr_search', idx, item);
	  }
}).controller('LockerCtrl', function($rootScope,$scope,$modalInstance,$resource,item,yid,MyCache,Locker){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;
	//$scope.point = 0;
    //console.log(item);
    //console.log(yid);
	$scope.trySave=function(){

        if(item){
            Locker.update($scope.item,function(res){
                    
                toastr.success('성공적으로 수정하였습니다!!!');

                $modalInstance.close($scope.item);
                    
            },function(err){
                //ERROR($state,err);
            });
        }else{
            $scope.item.yid = yid;
            Locker.save($scope.item,function(res){
                
            toastr.success('성공적으로 입력하였습니다!!!');
            $modalInstance.close($scope.item);
                    
            },function(err){
                //ERROR($state,err);
            });
        }
	}

	
}).controller('ModalLockerColCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache,Locker){
	$scope.close = function () {
		$modalInstance.dismiss('cancel');
	};
	$scope.myCache = MyCache;
	$scope.myCache.loadGCode(['boxtype']);
	$scope.item=item;
	//$scope.point = 0;
	//console.log(item);
	//console.log(yid);
	
	$scope.trySave=function(){
		$modalInstance.close($scope.item);
	}
});

