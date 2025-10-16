
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/jquery.steps/build/jquery.steps.min.js',
		         '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
                 '/bower_components/moment/min/moment.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  '/bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
		  '/css/upload.css',
		  	'/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
			'/bower_components/upload/vendor/jquery.ui.widget.js',
			'/bower_components/upload/jquery.iframe-transport.js',
			'/bower_components/upload/jquery.fileupload.js',
			'/bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
			'/plugin/dropzone/dropzone.js',
			'/plugin/dropzone/dropzone.css',
			'/bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
				'/bower_components/magnific-popup/dist/magnific-popup.css',
				'/bower_components/summernote/dist/summernote.css',
           '/bower_components/summernote/dist/summernote.min.js',
           '/bower_components/angular-summernote/dist/angular-summernote.min.js',
           '/bower_components/summernote/dist/lang/summernote-ko-KR.js'
		  ],cache:true,serie: true}])
.controller('ProductEditCtrl', function($scope,$http,$timeout,$state,$modal,$stateParams,MyCache,Product,Shop,$q,$location) {
	
	

	$scope.MyCache=MyCache;
	
	//MyCache.loadGCode(['product.status','product.saleType','pcode','yn']);
	var jobs=[Shop.query({kind:'B'}).$promise,MyCache.loadGCode(['product.status','product.saleType','pcode','yn'])];
	
	


	
	if($stateParams.productSq){
		jobs.push(Product.get($stateParams).$promise);	
		/*Product.get($stateParams,function(res){
	  		$scope.item= res;
	  		
	  	});*/
	}else{
		$scope.item={categoryCode:'',status:'A',saleType:'A', saleYn:'Y'}; //쿠폰상품
	}
	$q.all(jobs).then(function(results){
		//console.log('bbbbbbb');
		$scope.shopList = results[0].data;
		if($stateParams.productSq){
			$scope.item= results[2].data;
			//console.log($scope.item);
			$timeout(function(){
				procImage();
			});
			$scope.item.cate = $scope.item.categoryCode.substring(0,2);
			var myDropzone = Dropzone.forElement("#dropzone");
				
			if($scope.item.detailUrl){
				for(var i=0; i<$scope.item.detailUrl.length; i++){
					var item = $scope.item.detailUrl[i];
				var mockFile = { name: item.originalname, size: item.size,fileKey:item.fileKey };
				myDropzone.options.addedfile.call(myDropzone, mockFile);
				myDropzone.files.push(mockFile); 
				myDropzone.options.thumbnail.call(myDropzone, mockFile,'/upload/'+item.fileKey+'/300x300');
				}
		    }
			
			if($scope.item.saleSDate)
				$scope.cb(moment($scope.item.saleSDate),moment($scope.item.saleSDate));
		}else{
			$scope.cb(moment(moment().startOf('month').format('YYYY-MM-DD'), 'YYYY-MM-DD'), 
    		moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'));
		}
	},function(err){
		//console.log('aaaaaa');
		//console.log(err);
		ERROR($state,err);
		
		
	});
	$scope.initUpload=function(){
	  $('#fileupload').fileupload({
	        url: '/upload',
	        dataType: 'json',
	        //autoUpload:true,
			formData: {group: '11'},
	        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
	        done: function (e, data) {
	        	//console.log(data.result);
	        	var file = data.result;

				//console.log('dddddddd',file);
	        	$scope.item.preUrl = file;
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
	//	console.log($('.image-popup-no-margins'));
	  $('.image-popup-no-margins').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			closeBtnInside: true,
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
		    	        
						photo = angular.fromJson(response);
						//console.log(photo);
						file.fileKey = photo.fileKey;
						if($scope.item.detailUrl){
							$scope.item.detailUrl.push(photo);
							
						}else{
							$scope.item.detailUrl=[photo];
						}
		      },
		      addedfile:function(file){
				  
		      },
		      removedfile:function(file){
				  //console.log('removed',file);
				  //console.log('imageUrl',$scope.item.imageUrl);
				  for(var i=0; i<$scope.item.detailUrl.length; i++){
					  //console.log($scope.item.imageUrl[i]);
					  if($scope.item.detailUrl[i] && $scope.item.detailUrl[i].fileKey==file.fileKey){
						  console.log('found');
						  if($scope.item.detailUrl[i].path.indexOf("temp")>-1){
							  delete $scope.item.detailUrl[i];
						  }else{
							  $scope.item.detailUrl[i].isDeleted=true;
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
  	
  	dropzoneInit();
	
	$scope.formSubmit=function(){
		
		//$scope.item.stepList = $scope.stepList;
		
		if($scope.item.productSq){
			Product.update($scope.item,function(res){
			    	toastr.success('수정하였습니다.');
			    
			},function(err){
				ERROR($state,err);
			});
		}else{
			
			Product.save($scope.item,function(res){
			    	toastr.success('입력하였습니다.');
			    	$state.go('shop.productlist');
			    
			},function(err){
				ERROR($state,err);
			});
		}
	}
	$scope.$watch(
            "item.cate",
            function( newValue, oldValue ){
            	//$scope.selectedRegion=[];
            	//console.log(newValue,oldValue);
				if(newValue){
					$q.all([MyCache.loadGCode(['pcode.'+newValue])]).then(function(results){
						$scope.category2List =MyCache.get('pcode.'+newValue);
					});
				}
            }
    );
	$scope.cb = function(start, end,label) {
		//alert(start+":"+end);
		$scope.item.saleSDate = start.format('YYYY-MM-DD');
		//alert($scope.item.saleSDate);
		$scope.item.saleEDate=end.format('YYYY-MM-DD');
		$('#daterange span').html($scope.item.saleSDate + ' ~ ' + $scope.item.saleEDate);
		//$('#daterange span').html('ddddddd');

		//console.log($('#daterange span'));
    }
	$('#daterange').daterangepicker(
		{
			ranges: {
	           '오늘': [new Date(), new Date()],
	           //'어제': [moment().subtract('days', 1), moment().subtract('days', 1)],
	           //'최근 일주일': [moment().subtract('days', 6), new Date()],
	           //'최근 한달': [moment().subtract('days', 29), new Date()],
			   '일주일': [new Date(),moment().add('days', 6)],
	           '이번달': [moment().startOf('month'), moment().endOf('month')],
	           //'지난달': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
			},
			opens: 'left',
			locale: {
				format: 'YYYY-MM-DD',
                applyLabel: '확인',
                cancelLabel: '취소',
                fromLabel: '부터',
                toLabel: '까지',
                customRangeLabel: '사용자 지정',
                daysOfWeek: ['일', '월', '화', '수', '목', '금','토'],
                monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                firstDay: 1
            }
		}, 
		$scope.cb
	);
	
	
	
});
	