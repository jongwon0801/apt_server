
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
  .controller('TakeLogCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,TakeLog,$stateParams,$state,$modal,MyCache) {
	  
	  //console.log(ViewCtrl);
	$scope.myCache=MyCache;
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
		$state.go('applebox.takeloglist',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([TakeLog.query($stateParams).$promise,$scope.myCache.loadGCode(['locker.kind','locker.status','locker.usage'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  $scope.currentPage = $scope.sform.page;
			  //console.log($scope.list);
		},function(err){
			ERROR($state,err);
			
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		console.log('formsubmit');
		$scope.sform.page='';
		$state.go('applebox.takeloglist',$scope.sform);
		
	}
	$scope.doSearch(); 
	

	$scope.viewLog=function(item){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/applebox/modal.log.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'TakeLogViewCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            	 }
	        	}
	     }).result.then(function (selectedItem) {
	    	 //$scope.doBuddyList(selectedItem);
	    	 //$scope.doSearch()
	     }, function (err) {
	    	 
	     });
	}
	
}).controller('TakeLogViewCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache,Locker){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;
	

	
});
	