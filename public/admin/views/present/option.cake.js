
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/sweetalert/dist/sweetalert.css',
			//'/bower_components/sweetalert/dist/sweetalert.min.js',
		  ],cache:false,serie: true}])
.controller('OptionCakeCtrl', function($scope,$http,$location,$state,Goods,$resource,$timeout,$stateParams,MyCache,Seller,$q,$window) {
//	console.log($scope.item);
	Goods.get({goodsSq:$scope.item.goods.goodsSq},function(res){
		//console.log(res);
		//console.log(res.option.packageKind);
		$http.get('/v1/CakePackage/'+$scope.item.goods.goodsSq+'/'+res.option.packageKind).then(function(res1){
			
			
			$scope.packageList = res1.data;
		//	console.log(res1.data);
		},function(err){
			ERROR($state,err);
		});	
	})
	
	
	$scope.goNext = function(){
		//console.log($scope.packageList);
		$scope.item.goods.option.package = getSelectedItem();
		$state.go('present.gift.step2');
	}
	function getSelectedItem(){
		for(var i=0; i<$scope.packageList.length; i++)
			if($scope.packageList[i].active)return $scope.packageList[i];
	}
	
})

	