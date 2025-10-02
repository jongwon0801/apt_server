
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
  .controller('AppleboxThingsListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Things,$stateParams,$state) {
	  
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
		$state.go('applebox.thingslist',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Things.query($scope.sform).$promise,$scope.myCache.loadGCode(['things.status'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  $scope.currentPage = $scope.sform.page;
			  console.log($scope.list);
		},function(err){
			ERROR($state,err);
			
		});
	}
	
	$scope.complete=function(item){
		
		var req= angular.copy(item);
		req.status='E';
		Things.update(req,function(rs){
			toastr.success('성공적으로 수정하였습니다!!!');
			item.status='E';
		});
	}
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('applebox.thingslist',$scope.sform);
		
	}
	$scope.doSearch(); 
});
	