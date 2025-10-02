
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:false,serie: true}])
  .controller('SaveLogCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,SaveLog,$stateParams,$state,$modal,MyCache) {
	  
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
		$state.go('applebox.saveloglist',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([SaveLog.query($stateParams).$promise,$scope.myCache.loadGCode(['locker.kind','locker.status','locker.usage'])]).then(function(results){
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
		$state.go('applebox.saveloglist',$scope.sform);
		
	}
	$scope.doSearch(); 
	$scope.viewDetail=function(item){
		//console.log(angular.isObject(item));
		//console.log(angular.isObject(item.thingsSq));
		//console.log(item.thingsSq);
		//console.log(item);
		if(item.usage=='A'){ // 보관 

		}else if(item.usage=='B'){ //택배 
			$rootScope.onOrderView({orderCd:item.thingsSq})
		}else if(item.usage=='C'){ //세탁 
			$rootScope.onThingsView(item)
		}else if(item.usage=='D'){ //슈퍼
			$rootScope.onOrderView({orderCd:item.thingsSq})
		}
			
	}

    $scope.viewLog=function(item){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/applebox/modal.log.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'SaveLogViewCtrl',
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
	$scope.viewUuid=function(item){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/applebox/modal.uuid.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'UuidLogViewCtrl',
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
	
}).controller('UuidLogViewCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache,Locker,$http){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['fcmPush.senderType']);
		$http.get('/v1/Uuid/'+item.uuid).then(function(response) {
			//console.log(response.data);
			$scope.item=response.data.data;
			//console.log($scope.item.fcmPush.fcmData);

			$scope.item.fcmPush.fcmData = angular.fromJson($scope.item.fcmPush.fcmData);
			$scope.item.fcmPush.smsData = angular.fromJson($scope.item.fcmPush.smsData);
			//console.log($scope.item.fcmPush.fcmData);
			//console.log($scope.item);
		}, function(x) {
			console.log(x);
		});
	$scope.resendSms=function(sdata){

		
		if(confirm('문자를 재전송 하시겠습니까?')){

			$http.post('/admin/SendSms', {hp:sdata.DEST_PHONE,content:sdata.MSG_BODY}).then(function(res){
				toastr.success('성공적으로 보냈습니다.');
			},function(err){
				toastr.error("error"+err);
			});
		}
	};

	$scope.resendPush=function(sdata){
		if(confirm('푸시를 재전송 하시겠습니까?')){

			$http.post('/admin/SendFcm', sdata).then(function(res){
				toastr.success('성공적으로 보냈습니다.');
			},function(err){
				toastr.error("error"+err);
			});
		}
	};
	
	

	
}).controller('SaveLogViewCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache,Locker){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;
	


	
});