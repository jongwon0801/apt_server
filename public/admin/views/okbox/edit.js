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
.controller('OkboxEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Donation,$resource,$state) {
	function dropzoneInit(){
   		$scope.dropzoneConfig = {
		    options: { // passed into the Dropzone constructor
			  //previewTemplate: document.querySelector('#template-container').innerHTML,
		      url: '/upload',
		      paramName: "files[]",
		      addRemoveLinks:true,
		      dictDefaultMessage:'대표 상품사진 이미지를 선택해주세요.',
		      maxFiles:10,
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
                  var myDropzone =this;
                  if($stateParams.donationSq){
                    $q.all([Donation.get($stateParams).$promise,MyCache.loadGCode(['donation.status'])]).then(function(results){
        
                        $scope.item=results[0];
                        //var myDropzone = Dropzone.forElement("#dropzone");
                        
                          if($scope.item.photos){
                              for(var i=0; i<$scope.item.photos.length; i++){
                                  var item = $scope.item.photos[i];
                                  var mockFile = { name: item.originalname, size: item.size,fileKey:item.fileKey };
                                //myDropzone.options.addedfile.call(myDropzone, mockFile);
                                 myDropzone.files.push(mockFile); 
                                //myDropzone.options.thumbnail.call(myDropzone, mockFile,'/upload/'+item.fileKey+'/300x300');
                                myDropzone.emit("addedfile", mockFile);
                                myDropzone.emit("thumbnail", mockFile, '/upload/'+item.fileKey+'/300x300');
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
                    
                    $q.all([MyCache.loadGCode(['donation.status'])]).then(function(results){
                        //dropzoneInit();
                    },function(err){
                        ERROR($state,err);
                    });
                }

				  //console.log($scope.item.imageUrl);
				  
		    	  /*if($scope.item){
					  for(var i=0; i<$scope.item.photos.length; i++){
						  var item = $scope.item.photos[i];
		    		  	var mockFile = { name: item.originalname, size: item.size };
		                 
		                thisDropzone.options.addedfile.call(thisDropzone, mockFile);
		 
		                thisDropzone.options.thumbnail.call(thisDropzone, mockFile,'/upload/'+item.fileKey+'/300x200');
					  }
                  }*/  
                            
		      }
		    },
			
		    eventHandlers: {
			  
		      sending: function (file, xhr, formData) {
				  formData.append("group", "19");
		      },
		      error:function(err){
		    		//toastr.error(err);  
					console.log(err);
		      },
			  maxfilesexceeded:function(file){
				alert('3장까지만 등록할 수 있습니다.');
				this.removeFile(file);
              },
              thumbnail: function(file){
                  //console.log(file);
              },
		      success: function (file, response) {
		    	        //$scope.item.thumbnail=angular.fromJson(response);

						//console.log(response);
						photo = angular.fromJson(response);
						//console.log(photo);
						file.fileKey = photo.fileKey;
						if($scope.item.photos){
							$scope.item.photos.push(photo);
							
						}else{
							$scope.item.photos=[photo];
						}
						
		    		    //console.log('success',file);
						//console.log('imageUrl',$scope.item.imageUrl);
		      },
		      addedfile:function(file){
				  //console.log('aaaaa',file);
		    	  //console.log('added',file);
				  //console.log('imageUrl',$scope.item.imageUrl);
                  //console.log(file);
                  
                  file.previewElement.addEventListener("click", function (e) {
                        //console.log(e);
                        var modal = document.getElementById('myModal');

                        // Get the image and insert it inside the modal - use its "alt" text as a caption
                        //var img = document.getElementById('myImg');
                        var modalImg = document.getElementById("img01");
                        var captionText = document.getElementById("caption");
                        //img.onclick = function(){
                            modal.style.display = "block";
                            modalImg.src = '/upload/'+file.fileKey;
                            captionText.innerHTML = file.name;
                        //}

                        // Get the <span> element that closes the modal
                        var span = document.getElementsByClassName("close")[0];

                        // When the user clicks on <span> (x), close the modal
                        span.onclick = function() { 
                            modal.style.display = "none";
                        }
                  });
		      },
		      removedfile:function(file){
				  //console.log('removed',file);
				  //console.log('imageUrl',$scope.item.imageUrl);
				  for(var i=0; i<$scope.item.photos.length; i++){
					  //console.log($scope.item.imageUrl[i]);
					  if($scope.item.photos[i] && $scope.item.photos[i].fileKey==file.fileKey){
						  //console.log('found');
						  if($scope.item.photos[i].path.indexOf("temp")>-1){
							  delete $scope.item.photos[i];
						  }else{
							  $scope.item.photos[i].isDeleted=true;
						  }
						  
						  break;
					  }
				  }
		    	  

				  //console.log('imageUrl',$scope.item.imageUrl);
		    	  //delete $scope.item.image;
		      }
		      
		    }
	};
	}
  $scope.item={};
  dropzoneInit();
  /*
  $scope.loadData=function(){
	  
	  if($stateParams.donationSq){
			$q.all([Donation.get($stateParams).$promise,MyCache.loadGCode(['donation.status'])]).then(function(results){

				$scope.item=results[0];
				var myDropzone = Dropzone.forElement("#dropzone");
				
		    	  if($scope.item.photos){
					  for(var i=0; i<$scope.item.photos.length; i++){
						  var item = $scope.item.photos[i];
		    		  	var mockFile = { name: item.originalname, size: item.size,fileKey:item.fileKey };
		                myDropzone.options.addedfile.call(myDropzone, mockFile);
		 				myDropzone.files.push(mockFile); 
                        myDropzone.options.thumbnail.call(myDropzone, mockFile,'/upload/'+item.fileKey+'/300x300');
                        myDropzone.emit("complete", mockFile);
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
		  
			$q.all([MyCache.loadGCode(['donation.status'])]).then(function(results){
                //dropzoneInit();
			},function(err){
				ERROR($state,err);
			});
	  }
  }
  $scope.loadData();
  */
  $scope.formSubmit=function(){ // 수정하기 
	 //console.log('dddd');

	 if($scope.item.donationSq){
		Donation.update($scope.item,function(res){

				
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
				$location.path('/okbox/list');
					
				
		},function(err){
			ERROR($state,err);
		});
	 }
  }
  
});
