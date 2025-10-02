
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',[
   {files:[//'/bower_components/jquery-validation/dist/jquery.validate.min.js',
       	//'/bower_components/ocModal/dist/css/ocModal.animations.css',
    	//'/bower_components/ocModal/dist/css/ocModal.light.css',
    	//'/bower_components/ocModal/dist/ocModal.js',
    	//'/bower_components/sweetalert/dist/sweetalert.css',
    	//'/bower_components/sweetalert/dist/sweetalert.min.js',
        //'/bower_components/moment/min/moment.min.js',
 		//'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
 		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
 		],cache:false,serie: true}])
  .controller('BuyerCtrl', function($rootScope,$scope,$http,$location,$filter,MyCache,$window) {
	  	$scope.myCache=MyCache;
	    $scope.back=function(){
		  $window.history.back();  
	    } 
	  
	  //console.log('member');
}).factory('Buyer',function($resource){
	
	return $resource('/admin/Buyer/:buyerSq', { buyerSq: '@buyerSq'}, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Shop',function($resource){
	
	return $resource('/admin/Shop/:shopSq', { shopSq: '@shopSq'}, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});	
}).factory('Applebox',function($resource){
	
	return $resource('/admin/Applebox/:yid', { yid: '@yid' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Member',function($resource){
	
	return $resource('/admin/Member/:memberSq', { memberSq: '@memberSq' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Service',function($resource){
	
	return $resource('/admin/Service/:serviceSq', { serviceSq: '@serviceSq' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});	
});