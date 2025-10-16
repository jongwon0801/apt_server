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
					   '/shared/controller/modal.addr.new.js',
					   '/plugin/dropzone/dropzone.js',
		  			   '/plugin/dropzone/dropzone.css'
			           ],cache:true,serie: true}])
.controller('ShopEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Shop,Member,$resource,$state) {
	function dropzoneInit(){
   		$scope.dropzoneConfig = {
		    options: { // passed into the Dropzone constructor
			  //previewTemplate: document.querySelector('#template-container').innerHTML,
		      url: '/upload',
		      paramName: "files[]",
		      addRemoveLinks:true,
		      dictDefaultMessage:'대표 상품사진 이미지를 선택해주세요.',
		      maxFiles:2,
		      uploadMultiple:false,
		      //acceptedFiles: ".jpeg,.jpg,.png,.gif",
			  accept: function (file, done) {
                //console.log(file)
                if ((file.type).toLowerCase() != "image/jpg" &&
                        (file.type).toLowerCase() != "image/gif" &&
                        (file.type).toLowerCase() != "image/jpeg" &&
                        (file.type).toLowerCase() != "image/png"
                        ) {
                    done("Invalid file");
                }
                else {
                    done();
                }
              },
		      init:function(){
		    	  thisDropzone =this;
				  //console.log($scope.item.imageUrl);
				  /*
		    	  if($scope.item.imageUrl){
					  for(var i=0; i<$scope.item.imageUrl.length; i++){
						  var item = $scope.item.imageUrl[i];
		    		  	var mockFile = { name: item.originalname, size: item.size };
		                 
		                thisDropzone.options.addedfile.call(thisDropzone, mockFile);
		 
		                thisDropzone.options.thumbnail.call(thisDropzone, mockFile,'/upload/'+item.fileKey+'/300x200');
					  }
		    	  } */              
		      }
		    },
			
		    eventHandlers: {
			  
		      sending: function (file, xhr, formData) {
				  formData.append("group", "10");
		      },
		      error:function(err){
		    		//toastr.error(err);  
					console.log(err);
		      },
			  maxfilesexceeded:function(file){
				alert('3장까지만 등록할 수 있습니다.');
				this.removeFile(file);
			  },
		      success: function (file, response) {
		    	        //$scope.item.thumbnail=angular.fromJson(response);

						//console.log(response);
						photo = angular.fromJson(response);
						//console.log(photo);
						file.fileKey = photo.fileKey;
						if($scope.item.imageUrl){
							$scope.item.imageUrl.push(photo);
							
						}else{
							$scope.item.imageUrl=[photo];
						}
						
		    		    console.log('success',file);
						console.log('imageUrl',$scope.item.imageUrl);
		      },
		      addedfile:function(file){
				  console.log('aaaaa',file);
		    	  //console.log('added',file);
				  //console.log('imageUrl',$scope.item.imageUrl);
				  //console.log(file);
		      },
		      removedfile:function(file){
				  //console.log('removed',file);
				  //console.log('imageUrl',$scope.item.imageUrl);
				  for(var i=0; i<$scope.item.imageUrl.length; i++){
					  //console.log($scope.item.imageUrl[i]);
					  if($scope.item.imageUrl[i] && $scope.item.imageUrl[i].fileKey==file.fileKey){
						  console.log('found');
						  if($scope.item.imageUrl[i].path.indexOf("temp")>-1){
							  delete $scope.item.imageUrl[i];
						  }else{
							  $scope.item.imageUrl[i].isDeleted=true;
						  }
						  
						  break;
					  }
				  }
		    	  

				  console.log('imageUrl',$scope.item.imageUrl);
		    	  //delete $scope.item.image;
		      }
		      
		    }
	};
	}
  $scope.item={};
  dropzoneInit();
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
				$scope.item.addr=$scope.item.addr||{};
				
				$scope.item.addr.zipNo=selectedItem.zipNo;
				$scope.item.addr.roadAddrPart1=selectedItem.roadAddrPart1;
				$scope.item.addr.roadAddrPart2=selectedItem.roadAddrPart2;
				//$scope.item.addr.roadAddr=selectedItem.roadAddr;
			}, function () {
				//$log.info('Modal dismissed at: ' + new Date());
			});
		
	} 
	
  $scope.loadData=function(){
	  
	  if($stateParams.shopSq){
			$q.all([Shop.get($stateParams).$promise,MyCache.loadGCode(['shop.status','shop.kind','yn'])]).then(function(results){

				$scope.item=results[0];
				var myDropzone = Dropzone.forElement("#dropzone");
				
		    	  if($scope.item.imageUrl){
					  for(var i=0; i<$scope.item.imageUrl.length; i++){
						  var item = $scope.item.imageUrl[i];
		    		  	var mockFile = { name: item.originalname, size: item.size,fileKey:item.fileKey };
		                myDropzone.options.addedfile.call(myDropzone, mockFile);
		 				myDropzone.files.push(mockFile); 
		                myDropzone.options.thumbnail.call(myDropzone, mockFile,'/upload/'+item.fileKey+'/300x300');
					  }
		    	  }  
				  //myDropzone.removeAllFiles();
				  //console.log(myDropzone);
				  //dropzoneInit();
				 //myDropzone.files=[];
			},function(err){
				ERROR($state,err);
			});
	  }else{
		  
			$q.all([MyCache.loadGCode(['shop.status','shop.kind','yn'])]).then(function(results){
			
			},function(err){
				ERROR($state,err);
			});
	  }
  }
  $scope.loadData();
  
  $scope.formSubmit=function(){ // 수정하기 
	 //console.log('dddd');

	 if($scope.item.shopSq){
		Shop.update($scope.item,function(res){

				
			toastr.success('성공적으로 수정하였습니다!!!');
			var myDropzone = Dropzone.forElement("#dropzone");
			myDropzone.removeAllFiles();
			$scope.loadData();
				
		},function(err){
			ERROR($state,err);
		});
	 }else{
		Shop.save($scope.item,function(res){
			toastr.success('성공적으로 입력하였습니다!!!');
				$location.path('/shop/list');
					
				
		},function(err){
			ERROR($state,err);
		});
	 }
  }
  
}).controller('ModalAddrNewCtrl', function($scope,$http,$ocModal,$init) {
	
	 $scope.goSearch= function(){
		  $http.get('/v1/addr_new', {
		        params:  {query: $scope.query},
		    }
		)
		.then(function(response) {
			console.log(response.data)
		}, function(x) {
		    
		})
		return false;
	  };
	  
	  $scope.close=function(idx,item){
		$ocModal.close('addr_search', idx, item);
	  }
});

