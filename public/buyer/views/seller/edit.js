angular.module('inspinia',
		['ngResource',[//'/bower_components/bootstrap-select/bootstrap-select.min.css',
		  //'/bower_components/bootstrap-select/bootstrap-select.min.js',
		  //'/bower_components/angular-bootstrap-select/build/angular-bootstrap-select.min.js'
		  //'/shared/controller/modal.addr.js'
		               '/css/upload.css',
		               '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
		               '/bower_components/upload/vendor/jquery.ui.widget.js',
		     		  '/bower_components/upload/jquery.iframe-transport.js',
		     		  '/bower_components/upload/jquery.fileupload.js',
		     		  
		]])
.controller('EditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Seller,Member) {
  
  //console.log('Seller EditCtrl reload');
  $scope.loadData=function(){
	  //console.log('loadData');
	  $q.all([Seller.get($stateParams).$promise,MyCache.loadGCode(['seller.status'])]).then(function(results){
			$scope.item=results[0];
			Member.get({memberSq:$scope.item.memberSq},function(res){
				$scope.item.userId=res.userId;
				  
			 },function(err){
				 ERROR($state,err);
			 })
		
		},function(err){
			ERROR($state,err);
		});
  }
  $scope.loadData();
  
  $scope.formSubmit=function(){ // 수정하기 
	  
	  Seller.update($scope.item,function(res){

				toastr.success('성공적으로 수정하였습니다!!!');
			
		},function(err){
			ERROR($state,err);
		});
  };
  $scope.initUpload=function(){
	  $('#fileupload').fileupload({
	        url: '/upload',
	        dataType: 'json',
	        //autoUpload:true,
	        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
	        done: function (e, data) {
	        	//console.log(data.result);
	        	var file = data.result;
	        	//$scope.item.thumbnail = file.thumbnailUrl;
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
  $scope.addrOpen=function(){
		console.log('openmodal');
		$modal.open({
			animation:true,
	        templateUrl: "/shared/views/modal.addr.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'ModalAddrCtrl',
	        resolve: {
	            item: function () {
	                return {};
	            	}
	        	}
	     }).result.then(function (selectedItem) {
	    	 if(selectedItem.idx==0){
   			  	$scope.item.addr=selectedItem.rnAdres;
	   		  }else{
	   			  $scope.item.addr=selectedItem.lnmAdres;
	   		  }
	   		  $scope.item.zipNo=selectedItem.zipNo;
	     }, function () {
	    	 //$log.info('Modal dismissed at: ' + new Date());
	     });
		
	} 	
}).directive('validPasswordC', function () {
	    return {
	        require: 'ngModel',
	        link: function (scope, elm, attrs, ctrl) {
	            ctrl.$parsers.unshift(function (viewValue, $scope) {
	                var noMatch = viewValue != scope.myForm.password.$viewValue
	                ctrl.$setValidity('noMatch', !noMatch)
	            })
	        }
	    }
});



