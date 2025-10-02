angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:false,serie: true}])
.controller('AccountWeekCtrl', function($state,$rootScope,$scope,$http,$location,$filter,$q,$stateParams,$state,MyCache,Order,$timeout,$ocLazyLoad,$modal) {
	$scope.myCache=MyCache;
	
    console.log('week',$state);
   
});


	