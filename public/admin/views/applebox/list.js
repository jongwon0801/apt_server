
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
  .controller('AppleboxListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Applebox,$stateParams,$state) {
	  
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
		$state.go('applebox.list',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Applebox.query($scope.sform).$promise,$scope.myCache.loadGCode(['applebox.status','yn','applebox.useType'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  $scope.currentPage = $scope.sform.page;
			  console.log($scope.list);
		},function(err){
			ERROR($state,err);
			
		});
	}
	
	$scope.syncRfid=function(item){
		$http.post('/v1/RfidSync/'+item.yid,null,{headers:{'applebox-host':'applebox-'+item.yid+'.apple-box.kr'}}).then(function(results){
			toastr.success("성공");
		},function(err){
        	ERROR($state,err);
    	});
	}
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('applebox.list',$scope.sform);
		
	}
	$scope.doSearch(); 
	
	
	
	
	

});
	