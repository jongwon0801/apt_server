
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',['ngResource','oc.modal',[
	'../routertest/bower_components/ocModal/dist/css/ocModal.animations.css',
	'../routertest/bower_components/ocModal/dist/css/ocModal.light.css',
	'../routertest/bower_components/ocModal/dist/ocModal.js',
	'../js/plugins/jasny/jasny-bootstrap.min.js',          
	'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/css/bootstrap-datepicker3.css',
	'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/js/bootstrap-datepicker.min.js',

	]]).controller('MyCtrl', function($scope,$http,Customer,$ocModal) {
        !function(a){a.fn.datepicker.dates.ko={days:["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],daysShort:["일","월","화","수","목","금","토"],daysMin:["일","월","화","수","목","금","토"],months:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],monthsShort:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],today:"오늘",clear:"삭제",format:"YYYY-MM-DD",titleFormat:"yyyy년mm월",weekStart:0}}(jQuery);
		$('#date').datepicker({
	        startView: 2,
	        language: 'ko',
	        todayBtn: "linked",
	        keyboardNavigation: false,
	        forceParse: false,
	        autoclose: true
	    });
		$scope.loadCustomer=function(){
			$http.get("/v1/getCustomer").then(function(res){
				console.log(res);
				if(res.data.success){
					
					$scope.customer=new Customer(res.data.data);
				}
			},function(err){
				alert(err);
			});
			
		}
		$scope.loadCustomer();
	  $scope.openModal=function(){
		  //console.log('ssss');
		  $ocModal.open({
            url: 'addr_search',
            cls: 'fade-in',
      	  onClose: function(a, b, c) {
      		  if(b==0){
      			  $scope.customer.addr=c.rnAdres;
      		  }else{
      			  
      			  $scope.customer.addr=c.lnmAdres;
      		  }
      		  $scope.customer.zipNo=c.zipNo;
      		  
      		  
      		  
      	  }
        });
	  };
	  $scope.trySave=function(){
		  
		   //console.log($scope.form);
		  //toastr[success]("ljlsdflsdjfljds", "sdfsdf");
		  if(true) return;
			$scope.customer.$update(function(res){
				//console.log(res);
				if(res.success){
					//$modalInstance.dismiss('cancel');
					//
					//$modalInstance.close(true);
					$scope.loadCustomer();
					alert('성공하였습니다.');
					
				}else{
					alert(res.msg);
				}
			},function(msg){
				ERROR(msg);
			});
			
	  }
}).config(function() {
  
}).config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
  
}]).run(function() {
  
}).factory('Customer',function($resource){
	
	return $resource('/Customer/Customer/:customerSq', { customerSq: '@customerSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
});


	