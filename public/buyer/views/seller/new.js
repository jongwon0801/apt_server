angular.module('inspinia',
		[[//'/bower_components/bootstrap-select/bootstrap-select.min.css',
		  //'/bower_components/bootstrap-select/bootstrap-select.min.js',
		  //'/bower_components/angular-bootstrap-select/build/angular-bootstrap-select.min.js'
		  '/shared/controller/modal.addr.js',
		  '/css/upload.css',
          '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
          '/bower_components/upload/vendor/jquery.ui.widget.js',
		  '/bower_components/upload/jquery.iframe-transport.js',
		  '/bower_components/upload/jquery.fileupload.js'
		]])
    .controller('NewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Seller,$stateParams,$timeout,$window,$modal) {
  
 // $scope.myCache=MyCache;
  $scope.myCache.loadGCode(['seller.status']);
  $scope.item={status:'A',commission:30};
  
  $scope.formSubmit=function(){
      
      if($scope.myForm.$invalid){
		    toastr.error('입력필드를 체크해주세요!');
	        return;
	  }
            
	  Seller.save($scope.item,function(res){
		  	$location.path('/seller/list');
				toastr.success('등록하였습니다!!!');
			
		},function(err){
			ERROR($state,err);
		});
  };
			 
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



