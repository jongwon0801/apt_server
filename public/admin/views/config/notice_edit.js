angular.module('inspinia',
		[{files:[
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
                '/bower_components/sweetalert/dist/sweetalert.css',
    	'/bower_components/sweetalert/dist/sweetalert.min.js'
		  ],cache:true,serie: true}])
.controller('NoticeEditCtrl', function($rootScope,$scope,$state,$http,$location,$modal,$filter,$q,Notice,$stateParams) {
	function load(){
		$q.all([Notice.get($stateParams).$promise,$scope.myCache.loadGCode(['notice.status','notice.kind'])]).then(function(results){
			
			//console.log(results[0]);
			$scope.item=results[0];
			console.log($scope.item);
		},function(err){
			ERROR($state,err);
		});
    }
    
    if($stateParams.noticeSq){
        load();
    }else{
        $scope.item={kind:'A',status:'A'};
        $q.all([$scope.myCache.loadGCode(['notice.status','notice.kind'])]).then(function(results){
		},function(err){
			ERROR($state,err);
		});
    }
    $scope.updateUpload=function(){

        console.log('upload');
        $scope.initUpload();
    }
	$scope.doItemInsert=function(){
        Notice.save($scope.item,function(res){
            toastr.success('수정하였습니다.');
            $state.go('config.noticelist');
        },function(err){
            ERROR($state,err);
        })
        
    }
  $scope.doItemUpdate=function(){
	  Notice.update($scope.item,function(res){
		  toastr.success('수정하였습니다.');
	  },function(err){
		  ERROR($state,err);
	  })
	  
  }
  $scope.formSubmit=function(){
      if($scope.item.noticeSq){
		 swal({
		        title: "수정하시겠습니까?",
		        text: "데이타를 수정합니다.",
		        type: "warning",
		        showCancelButton: true,
		         cancelButtonText: "취소",
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: "네, 수정할래요!",
		        closeOnConfirm: false
		    }, function () {
                $scope.doItemUpdate();
                swal.close();
            });
        }else{
            swal({
		        title: "입력하시겠습니까?",
		        text: "데이타를 입력합니다.",
		        type: "warning",
		        showCancelButton: true,
		         cancelButtonText: "취소",
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: "네, 입력할래요!",
		        closeOnConfirm: false
		    }, function () {
                $scope.doItemInsert();
                swal.close();
            });
        }
	 }
  
     $scope.initUpload=function(){
        if($scope.item.kind=='A'){
            $('#fileupload').fileupload({
                url: '/upload',
                dataType: 'json',
                //autoUpload:true,
                formData: {group: '27'},
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                done: function (e, data) {
                    //console.log(data.result);
                    var file = data.result;
    
                    //console.log('dddddddd',file);
                    $scope.item.dataImg = file;
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
        }else{
            $('#fileupload').fileupload({
                url: '/movie',
                dataType: 'json',
                //autoUpload:true,
                formData: {group: '27'},
                acceptFileTypes: /(\.|\/)(mp3|jpe?g|png)$/i,
                done: function (e, data) {
                    //console.log(data.result);
                    var file = data.result;
    
                    //console.log('dddddddd',file);
                    $scope.item.dataImg = file;
                    $scope.$apply();
                    
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
	
});


