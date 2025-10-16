
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
  .controller('AppleboxCtrl', function($rootScope,$scope,$http,$location,$filter,MyCache,$window) {
	  	$scope.myCache=MyCache;
	    $scope.back=function(){
		  $window.history.back();  
	    } 
	  
	  //console.log('member');
}).factory('Locker',function($resource){
	 
	return $resource('/admin/Locker', { }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('TakeLog',function($resource){
	
	return $resource('/admin/TakeLog/:takeSq', { takeSq: '@takeSq' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('SaveLog',function($resource){
	
	return $resource('/admin/SaveLog/:saveSq', { saveSq: '@saveSq' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Buyer',function($resource){
	
	return $resource('/admin/Buyer/:buyerSq', { buyerSq: '@buyerSq' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Things',function($resource){
	
	return $resource('/admin/Things/:thingsSq', { thingsSq: '@thingsSq' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Shop',function($resource){
	
	return $resource('/admin/Shop/:shopSq', { shopSq: '@shopSq' }, {
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
}).factory('AppleboxLog',function($resource){
	
	return $resource('/admin/AppleboxLog/:appleboxLogSq', { appleboxLogSq: '@appleboxLogSq' }, {
		update:{ method:'PUT'},
		get:{ cache:false},
		query: { method:'GET', cache: false, isArray:true }
	});
}).factory('AppleboxSetting',function($resource){
	
	return $resource('/admin/AppleboxSetting/:yid', { yid: '@yid' }, {
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
});