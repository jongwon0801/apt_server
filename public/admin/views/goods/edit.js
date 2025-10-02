
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/jquery.steps/build/jquery.steps.min.js',
		         '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  '/css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
		  '/css/upload.css',
		  '/plugin/dropzone/dropzone.js',
		  //'/css/plugins/dropzone/basic.css',
		  '/plugin/dropzone/dropzone.css'
		  //'http://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js',
		  //'//rawgit.com/enyo/dropzone/master/dist/dropzone.js',
//		  '//rawgit.com/enyo/dropzone/master/dist/dropzone.css',
		  //'//rawgit.com/enyo/dropzone/master/dist/basic.css',

		  ],cache:true,serie: true}])
.controller('EditCtrl', function($scope,$http,$state,$modal,$stateParams,MyCache,Goods,CakeGoods) {
	
	

	$scope.MyCache=MyCache;
	MyCache.loadGCode(['goods.status','goods.category']);
	if($stateParams.goodsSq){
		Goods.get($stateParams,function(res){
	  		$scope.item= res;
	  		CakeGoods.get($stateParams,function(res){
	  	  		$scope.item.cakes= res;
	  	  		
	  	  	});
	  	});
	}else{
		$scope.item={category:'',kind:'B',customerYn:'N'}; //쿠폰상품
	}
	
  	$scope.dropzoneConfig = {
		    options: { // passed into the Dropzone constructor
		      url: '/upload',
		      paramName: "files[]",
		      addRemoveLinks:true,
		      dictDefaultMessage:'대표 상품사진 이미지를 선택해주세요.',
		      maxFiles:1,
		      uploadMultiple:false,
		      acceptedFiles: ".jpeg,.jpg,.png,.gif",
		      init:function(){
		    	  thisDropzone =this;
		    	  if($scope.item.thumbnail){
		    		  var mockFile = { name: $scope.item.thumbnail.originalname, size: $scope.item.thumbnail.size };
		                 
		                thisDropzone.options.addedfile.call(thisDropzone, mockFile);
		 
		                thisDropzone.options.thumbnail.call(thisDropzone, mockFile, $scope.item.thumbnail.url);
		    	  }               
		      }
		    },
		    eventHandlers: {
		      sending: function (file, xhr, formData) {
		      },
		      error:function(err){
		    	toasr.error(err);  
		      },
		      success: function (file, response) {
		    	        $scope.item.thumbnail=angular.fromJson(response);
		    		  //$scope.item.thumbnail=response;
		      },
		      addedfile:function(file){
		    	  
		      },
		      removedfile:function(file){
		    	  console('removed');
		    	  //delete $scope.item.image;
		      }
		      
		    }
	};
  	
  	//console.log($scope.item);
  	if(!$scope.item.descList)	$scope.item.descList=[];	
  	
  	$scope.itemNew=function(){ // 상품상세 추가 
		
  		var item = {kind:$('#descType').val(),sortOrder:$scope.item.descList.length+1};
		$modal.open({
			animation:true,
	        templateUrl: "views/goods/wizard/modal.desc.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'GoodsDescEditCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            }
	        }
	     }).result.then(function (selectedItem) {
	         //console.log(selectedItem);
	    	 //$scope.itemLoad();
	    	 $scope.item.descList.push(selectedItem);
	    	 
	     }, function () {
	    	 //$log.info('Modal dismissed at: ' + new Date());
	     });
		
	} 
  	$scope.descUp=function(item){
  		var sidx = $scope.item.descList.indexOf(item)
  		$scope.item.descList.swap1(sidx,sidx-1);
  		//console.log($scope.descList.indexOf(item));
  	}
  	$scope.descDown=function(item){
  		//console.log($scope.descList.indexOf(item));
  		var sidx = $scope.item.descList.indexOf(item)
  		$scope.descList.swap1(sidx,sidx+1);
  	}
  	
	$scope.descEdit=function(item){
		$modal.open({
			animation:true,
	        templateUrl: "views/goods/wizard/modal.desc.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'GoodsDescEditCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            }
	        }
	     }).result.then(function (selectedItem) {
	         //console.log(selectedItem);
	    	 //$scope.itemLoad();
	    	 var sidx = $scope.item.descList.indexOf(selectedItem)
	    	 $scope.item.descList[sidx]=selectedItem;
	     }, function () {
	    	 //$log.info('Modal dismissed at: ' + new Date());
	     });
	}
	$scope.descTrash=function(item){
		swal({
	        title: "삭제하시겠습니까?",
	        text: "삭제합니다.",
	        type: "warning",
	        showCancelButton: true,
	         cancelButtonText: "취소",
	        confirmButtonColor: "#DD6B55",
	        confirmButtonText: "네, 삭제할래요!",
	        
	        closeOnConfirm: false
	    }, function () {
	    	var sidx = $scope.item.descList.indexOf(selectedItem)
	    	 delete $scope.item.descList[sidx];
	    });
  	}
	$scope.goSecond=function(){
		//if($scope.title)
		
		$state.go('goods.edit.step_two');
	}
	
	$scope.trySave=function(){
		
		//$scope.item.stepList = $scope.stepList;
		
		if($scope.item.goodsSq){
			Goods.update($scope.item,function(res){
			    	toastr.success('수정하였습니다.');
			    
			},function(err){
				ERROR($state,err);
			});
		}else{
			
			Goods.save($scope.item,function(res){
			    	toastr.success('입력하였습니다.');
			    	$state.go('goods.list');
			    
			},function(err){
				ERROR($state,err);
			});
		}
	}
}).controller('GoodsDescEditCtrl',function($scope,$stateParams,$modalInstance,item,MyCache,$http) {
	
	
	//$scope.myCache = MyCache;
	$scope.item = item; 
	//console.log($scope.item);
	$scope.ok = function () {
		//if($scope.item.content && $scope.item.image){
			$modalInstance.close($scope.item);
		
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	
	$scope.dropzoneConfig = {
		    options: { // passed into the Dropzone constructor
		      url: '/upload',
		      paramName: "files[]",
		      addRemoveLinks:true,
		      dictDefaultMessage:'대표 상품사진 이미지를 선택해주세요.',
		      maxFiles:1,
		      uploadMultiple:false,
		      acceptedFiles: ".jpeg,.jpg,.png,.gif",
		      
		      
		    },
		    eventHandlers: {
		      sending: function (file, xhr, formData) {
		      
		      },
		      success: function (file, response) {
		    	 
		    		  //$scope.item.image=response;
		    	 $scope.item.image=angular.fromJson(response);
		      },
		      removedfile:function(file){
		    	  delete $scope.item.image;
		      }
		    }
		  };
	
}).controller('CakeSourceCtrl',function($scope,CakeGoods,CakeSource,CakePackage,$stateParams,MyCache,$http) {
	
	
	
	//console.log($scope.tabs);
	if($scope.item.goodsSq){ // update
		CakeGoods.get({goodsSq:$scope.item.goodsSq},function(res){
				$scope.item.cakes = data;
		},function(err){
			ERROR($state,err);
		})
	}else{
		//$scope.stepList = [{},{},{}]; // 3단
		
		$scope.item.cakes = {steps:3,packageYn:'Y',packageKind:'A',stepList:[{},{},{}]};
		
		
	}
	$scope.tabs = [{ active:$scope.item.cakes.packageYn=='N' },{ active:$scope.item.cakes.packageYn=='Y' }];
	
	
	CakeSource.query({sourceType:'A'},function(res){
		
		
		$scope.sourceAList = res;
		
	});
	CakeSource.query({sourceType:'B'},function(res){
		
		$scope.sourceBList = res;
		
	});
	$scope.stepChanged=function(){
		//console.log('ssssss');
		//$scope.stepList.splice(2,1);
		if($scope.item.cakes.steps>=$scope.item.cakes.stepList.length){
			for(var i=0; i<$scope.item.cakes.steps-$scope.item.cakes.stepList.length; i++){
				$scope.item.cakes.stepList.push({});
			}
		}else{
			//console.log($scope.steps.num,$scope.stepList.length-$scope.steps.num);
			$scope.item.cakes.stepList.splice($scope.item.cakes.steps,$scope.item.cakes.stepList.length-$scope.item.cakes.steps);
		}
	}
	
});


	