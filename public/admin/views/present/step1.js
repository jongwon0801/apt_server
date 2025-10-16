angular.module('inspinia',
	
	[{files:[//'/bower_components/moment/min/moment.min.js',
			  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
			//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
	        // '/bower_components/datetimepicker/jquery.datetimepicker.css',
	        // '/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js',
			 //	'/shared/controller/modal.addr.js'
             
			  ],cache:true,serie: true}])
.controller('PresentStep1Ctrl', function($scope,$http,$state,$modal,$timeout,$stateParams,MyCache) {
        
       // console.log('ssss');
        
        if(!$stateParams.cate){
            $state.go('.list',{page:1,cate:$stateParams.gcate+'00'});
        }
        $scope.$stateParams = $stateParams;
        MyCache.loadGCode(['goods.cate.'+$stateParams.gcate]).then(function(rss){
		
	        	//console.log(MyCache.get('cakePackage.cakeType'));
	        	$scope.menuList = MyCache.get('goods.cate.'+$stateParams.gcate);
			
	    });
        
        
            
		
});



