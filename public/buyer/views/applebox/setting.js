
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
  .controller('AppleboxSettingCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,$stateParams,$state,$modal,MyCache) {
	  
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
		$state.go('applebox.setting',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Locker.query($stateParams).$promise,$scope.myCache.loadGCode(['locker.kind','locker.status'])]).then(function(results){
			  //$scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0];
			  //$scope.currentPage = $scope.sform.page;
			  //console.log($scope.list);
		},function(err){
			ERROR($state,err);
			
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('applebox.setting',$scope.sform);
		
	}
	$scope.doSearch(); 
	
	$scope.editLocker=function(item){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/applebox/modal.locker.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'LockerCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            	 },
                 yid: function(){
                     return $stateParams.yid;
                 }   
	        	}
	     }).result.then(function (selectedItem) {
	    	 //$scope.doBuddyList(selectedItem);
	    	 $scope.doSearch()
	     }, function (err) {
	    	 
	     });
	}
	
	
	

}).controller('LockerCtrl', function($rootScope,$scope,$modalInstance,$resource,item,yid,MyCache,Locker){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;
	//$scope.point = 0;
    //console.log(item);
    //console.log(yid);
	$scope.trySave=function(){

        if(item){
            Locker.update($scope.item,function(res){
                    
                toastr.success('성공적으로 수정하였습니다!!!');

                $modalInstance.close($scope.item);
                    
            },function(err){
                //ERROR($state,err);
            });
        }else{
            $scope.item.yid = yid;
            Locker.save($scope.item,function(res){
                
            toastr.success('성공적으로 입력하였습니다!!!');
            $modalInstance.close($scope.item);
                    
            },function(err){
                //ERROR($state,err);
            });
        }
	}

	
});
	