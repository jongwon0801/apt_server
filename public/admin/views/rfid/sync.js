
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:true,serie: true}])
  .controller('RfidSyncCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Rfid,$stateParams,$state) {
	  
		
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Rfid.query($scope.sform).$promise,$scope.myCache.loadGCode(['rfid.status','rfid.subject'])]).then(function(results){
			  //$scope.totalItems = results[0].recordsTotal;
			  //$scope.list=results[0].data;
			  //$scope.currentPage = $scope.sform.page;
			  //console.log($scope.list);
			  
		},function(err){
			ERROR($state,err);
			
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		//$state.go('shop.list',$scope.sform);
		
	}
	$scope.doSearch(); 
});
	