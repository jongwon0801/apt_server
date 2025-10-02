
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',['ngResource',
   {files:[//'/bower_components/jquery-validation/dist/jquery.validate.min.js',
       	//'/bower_components/ocModal/dist/css/ocModal.animations.css',
    	//'/bower_components/ocModal/dist/css/ocModal.light.css',
    	//'/bower_components/ocModal/dist/ocModal.js',
    	//'/bower_components/sweetalert/dist/sweetalert.css',
    	//'/bower_components/sweetalert/dist/sweetalert.min.js',
        '/bower_components/moment/min/moment.min.js',
 		'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
 		'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
 		],cache:true,serie: true}])
  .controller('OrderCtrl', function($rootScope,$scope,$http,$location,$filter,MyCache,$window) {
	  	$scope.myCache=MyCache;
	    $scope.back=function(){
		  $window.history.back();  
	    } 
	  
	  //console.log('member');
  
}).factory('Order',function($resource){
	
	return $resource('/admin/Order/:orderCd', { orderCd: '@orderCd' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Things',function($resource){
	
	return $resource('/admin/Things/:thingsSq', { thingsSq: '@thingsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Shop',function($resource){
	
	return $resource('/admin/Shop/:shopSq', { shopSq: '@shopSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('ThingsPrices',function($resource){
	
	return $resource('/admin/ThingsPrices/:thingsSq', { thingsSq: '@thingsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
});




	