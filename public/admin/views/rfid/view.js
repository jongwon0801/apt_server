
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          '/bower_components/datetimepicker/jquery.datetimepicker.css',
	      '/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js',
          '/js/lockerScript.js'
		  ],cache:false,serie: true}])
  .controller('RfidViewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Rfid,$stateParams,$state,$modal,MyCache) {
	    
     Rfid.get($stateParams,function(res){
		$scope.item=res;		  
     },function(err){
        ERROR($state,err);
     });

	
});
	



	