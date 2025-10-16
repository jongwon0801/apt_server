angular.module('inspinia',
		[{files:[
            '/bower_components/summernote/dist/summernote.css',
            '/bower_components/summernote/dist/summernote.min.js',
            '/bower_components/angular-summernote/dist/angular-summernote.min.js',
            '/bower_components/summernote/dist/lang/summernote-ko-KR.js',
                '/bower_components/sweetalert/dist/sweetalert.css',
        '/bower_components/sweetalert/dist/sweetalert.min.js',
        '/css/upload.css',
		  	'/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
			'/bower_components/upload/vendor/jquery.ui.widget.js',
			'/bower_components/upload/jquery.iframe-transport.js',
            '/bower_components/upload/jquery.fileupload.js',
            '/bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
                '/bower_components/magnific-popup/dist/magnific-popup.css',
		  ],cache:true,serie: true}])
.controller('LaundryNoticeEditCtrl', function($rootScope,$scope,$state,$http,$location,$modal,$filter,$q,LaundryNotice,$stateParams) {
	function load(){
		$q.all([LaundryNotice.get($stateParams).$promise,$scope.myCache.loadGCode(['notice.status','notice.kind'])]).then(function(results){
			
			//console.log(results[0]);
			$scope.item=results[0];
			console.log($scope.item);
		},function(err){
			ERROR($state,err);
		});
    }
    
    if($stateParams.laundryNoticeSq){
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
        LaundryNotice.save($scope.item,function(res){
            toastr.success('수정하였습니다.');
            $state.go('laundry.noticelist');
        },function(err){
            ERROR($state,err);
        })
        
    }
  $scope.doItemUpdate=function(){
    LaundryNotice.update($scope.item,function(res){
		  toastr.success('수정하였습니다.');
	  },function(err){
		  ERROR($state,err);
	  })
	  
  }
  $scope.initUpload=function(){
        console.log(1234);
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
  $scope.formSubmit=function(){
      console.log($scope.item);
      if($scope.item.laundryNoticeSq){
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
  
     
    
	
});


