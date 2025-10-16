
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
  .controller('GoodsCtrl', function($rootScope,$scope,$http,$location,$filter,MyCache,$window) {
	  	//$scope.myCache=MyCache;
	    $scope.back=function(){
		  $window.history.back();  
	    } 
	  
	  //console.log('member');
 /* 
}).factory('GoodsDesc',function($resource){
	
	return $resource('/admin/CakePackage/:cakePackageSq', { cakePackageSq: '@cakePackageSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
	*/
}).factory('Goods',function($resource){
	
	return $resource('/admin/Goods/:goodsSq', { goodsSq: '@goodsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('CakePackage',function($resource){
	
	return $resource('/v1/CakePackage/:memberSq/:cakePackageSq', { cakePackageSq: '@cakePackageSq',memberSq: '@memberSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('CakeSource',function($resource){
	
	return $resource('/v1/CakeSource/:memberSq/:cakeSourceSq', { cakeSourceSq: '@cakeSourceSq' ,memberSq: '@memberSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('CakeGoods',function($resource){
	
	return $resource('/admin/CakeGoods/:goodsSq', { goodsSq: '@goodsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
})



	