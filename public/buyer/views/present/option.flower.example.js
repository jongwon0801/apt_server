
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/sweetalert/dist/sweetalert.css',
			//'/bower_components/sweetalert/dist/sweetalert.min.js',
		  ],cache:false,serie: true}])
.controller('OptionFlowerExampleCtrl', function($scope,$http,$location,$state,Goods,$resource,$timeout,$stateParams,MyCache,Seller,$q,$window) {
    /*    
	console.log($state.current.name);
	$scope.onOptionComplete=function(){
		$state.go('present.gift.step2');
	}*/
	//console.log
	
	var idx= 0;
	if($stateParams.id){
		idx= parseInt($stateParams.id);
	}
	$scope.list = $scope.rebonList[idx].list;
	//$scope.list = 
	//console.log('OptionFlowerExampleCtrl');
	
	
})

	