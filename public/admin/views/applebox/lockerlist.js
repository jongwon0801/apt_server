
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:true,serie: true}])
  .controller('AppleboxLockerListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,$stateParams,$state,$modal) {
	  
	  //console.log(ViewCtrl);
	//$scope.myCache=MyCache;
	$scope.maxSize=5;
    $scope.display = 10;
	$scope.sform=$location.search();
	$scope.sform.page=$scope.sform.page ||1
    //$scope.sform.memberType=$scope.sform.memberType ||''
    $scope.sform.saveDate = $scope.sform.saveDate || moment().format('YYYY-MM-DD')
	$scope.sform.status=$scope.sform.status ||''
	$scope.sform.dwhere=$scope.sform.dwhere ||'A'
	$scope.sform.display=$scope.display;
	$scope.dwheres=[{key:'A',name:'당일'},{key:'B',name:'이전'}];
	
	//console.log($scope.sform);
	//페이지이동
	$scope.pageChanged = function(p) {
		$scope.sform.page=p;
		$state.go('applebox.lockerlist',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Locker.query($scope.sform).$promise,$scope.myCache.loadGCode(['locker.status','yn'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  $scope.currentPage = $scope.sform.page;
			  //console.log($scope.list);
		},function(err){
			ERROR($state,err);
			
		});
	}
	$('input[name="saveDate"]').daterangepicker({
		"singleDatePicker": true,
		"autoUpdateInput": false,
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: '확인',
                cancelLabel: '취소',
                fromLabel: '부터',
                toLabel: '까지',
                customRangeLabel: '사용자 지정',
                daysOfWeek: ['일', '월', '화', '수', '목', '금','토'],
                monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                firstDay: 1
        }
    }, function(start, end, label) {
        $scope.sform.saveDate= start.format('YYYY-MM-DD');
		$('input[name="regDate"]').html(start.format('YYYY MM DD'));
      //console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');
    });
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('applebox.lockerlist',$scope.sform);
		
	}
	$scope.doSearch(); 
	
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
	
	
	

}).controller('SaveLogViewCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache,Locker){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;
	


	
});
	