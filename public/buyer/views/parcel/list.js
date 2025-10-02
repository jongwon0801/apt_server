
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
  .controller('ParcelListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Order,$stateParams,$state,Shop) {
	  
	  //console.log(ViewCtrl);
	//$scope.myCache=MyCache;
	$scope.maxSize=5;
    $scope.display = 10;
	
	$scope.sform=$location.search();
	$scope.sform.page=$scope.sform.page ||1;
	$scope.sform.status=$scope.sform.status ||''
	$scope.sform.kind='B';
	$scope.sform.display=$scope.display;
	
	
	//페이지이동
	$scope.pageChanged = function(p) {
		$scope.sform.page=p;
		$state.go('parcel.list',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Order.query($scope.sform).$promise,Shop.query({kind:'C'}).$promise,$scope.myCache.loadGCode(['order.status','order.payType','order.status.A'])]).then(function(results){
			//console.log(results);
			$scope.totalItems = results[0].recordsTotal;
			$scope.list=results[0].data;
			$scope.currentPage = $scope.sform.page;
			$scope.shopList = results[1].data;

		},function(err){
			ERROR($state,err);
			
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('parcel.list',$scope.sform);
		
	}
	$scope.doSearch(); 
	
	
	
	
	

});
	