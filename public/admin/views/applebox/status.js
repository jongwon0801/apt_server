
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
  .controller('AppleboxStatusCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,$stateParams,$state,$modal,MyCache) {
	  
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
		$state.go('applebox.status',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Locker.query($stateParams).$promise,$scope.myCache.loadGCode(['locker.kind','locker.status'])]).then(function(results){
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
		$scope.sform.page='';
		$state.go('applebox.status',$scope.sform);
		
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
                 action: function(){
                     return 'view';
                 }   
	        	}
	     }).result.then(function (selectedItem) {
	    	 //$scope.doBuddyList(selectedItem);
	    	 $scope.doSearch()
	     }, function (err) {
	    	 
	     });
	}
	
	
	


	
}).controller('LockerCtrl', function($state,$rootScope,$scope,$http,$modalInstance,$resource,item,action,MyCache,Locker,$timeout){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.action= action;
    //console.log(item);
    
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;

    
	//$scope.point = 0;
    //console.log(item);
    //console.log(yid);
	$scope.trySave=function(){

        if(action=='save'){
            if($scope.item.kind=='A'){
                toastr.error('비워있는 보관함만 보관할 수 있습니다.');
                return;
            }
            if($scope.item.status!='B'){
                toastr.error('비워있는 보관함에만 보관할 수 있습니다.');
                return;
            }
            $http.post('/v1/OpenToSave/'+$scope.item.yid,$scope.item,{headers:{'applebox-host':'applebox-'+$scope.item.yid+'.apple-box.kr'}}).then(function(rs){
                if(rs.data.success==true){
                    toastr.success("ok");
                    $modalInstance.close($scope.item);
                }else{
                    ERROR($state,rs);
                }
            },function(err){
                ERROR($state,err);
            });
        }else if(action=='take'){
            $scope.item.hp = item.toHp;
            if($scope.item.kind=='A'){
                toastr.error('비워있슨 보관함만 보관할 수 있습니다.');
                return;
            }
            if($scope.item.status!='A'){
                toastr.error('보관중인 물건만 찾을 수 있습니다.');
                return;
            }
            $http.post('/v1/OpenToTake/'+$scope.item.yid,$scope.item,{headers:{'applebox-host':'applebox-'+$scope.item.yid+'.apple-box.kr'}}).then(function(rs){
                if(rs.data.success==true){
                    toastr.success("ok");
                    $modalInstance.close($scope.item);
                }else{
                    ERROR($state,rs);
                }
            },function(err){
                ERROR($state,err);
            });
        
        }else if(action=='view'){
            Locker.update($scope.item,function(res){
                toastr.success('성공적으로 수정하였습니다!!!');
                $modalInstance.close($scope.item);
                    
            },function(err){
                ERROR($state,err);
            });
        }
	}

	
});
	