
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
  .controller('BuyerListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Buyer,$stateParams,$state) {
	  
	  //console.log(ViewCtrl);
	//$scope.myCache=MyCache;
	$scope.maxSize=5;
    $scope.display = 10;
	$scope.sform=$location.search();
	$scope.sform.page=$scope.sform.page ||1
	//$scope.sform.memberType=$scope.sform.memberType ||''
	$scope.sform.status=$scope.sform.status ||''
	
	$scope.sform.display=$scope.display;
	
	
	//페이지이동
	$scope.pageChanged = function(p) {
		$scope.sform.page=p;
		$state.go('buyer.list',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Buyer.query($scope.sform).$promise,$scope.myCache.loadGCode(['buyer.status'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  $scope.currentPage = $scope.sform.page;
			  //console.log($scope.list);
			  angular.forEach($scope.list, function (value, index) {
            		//console.log(value,index);
					$http.get('/admin/AppleboxCount/'+value.buyerSq).then(function(rs){
							$scope.list[index].appleboxCnt = rs.data; 
							//console.log($scope.list[index]);
							//$scope.$apply();
						},function(err){

					})
        	  });
			    

		},function(err){
			ERROR($state,err);
			
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('buyer.list',$scope.sform);
		
	}
	$scope.doSearch(); 
	
	
	
	
	

});
	