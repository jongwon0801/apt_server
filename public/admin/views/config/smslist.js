
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
		  ],cache:true,serie: true}])
  .controller('SmsListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,UdsMsg,$stateParams,$state,$modal,MyCache) {
	//$scope.myCache=MyCache;
	$scope.maxSize=5;
    $scope.display = 10;
	$scope.sform=$location.search();
	$scope.sform.page=$scope.sform.page ||1
	//$scope.sform.memberType=$scope.sform.memberType ||''
	//$scope.sform.status=$scope.sform.status ||''
	//$scope.sform.request_time = $scope.sform.request_time || moment().format('YYYY-MM-DD')
	$scope.sform.display=$scope.display;
	
	
	//페이지이동
	$scope.pageChanged = function(p) {

		console.log($scope.sform);
		$scope.sform.page=p;
		$state.go('config.smslist',$scope.sform); 
    };

	
	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([UdsMsg.query($scope.sform).$promise,$scope.myCache.loadGCode(['uds.status'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  //console.log($scope.list);
			  $scope.currentPage = $scope.sform.page;
			  //MyCache.patch($scope.list,results[1]);
			  
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('config.smslist',$scope.sform);
		
	}
	/*
	$scope.cb = function(start, end,label) {
		$scope.sform.startDate = start.format('YYYY-MM-DD');
		$scope.sform.endDate=end.format('YYYY-MM-DD');
		$('#daterange span').html(start.format('YYYY MM DD') + ' ~ ' + end.format('YYYY MM DD'));
    }
	$('#daterange').daterangepicker(
		{
			ranges: {
	           '오늘': [new Date(), new Date()],
	           '어제': [moment().subtract('days', 1), moment().subtract('days', 1)],
	           '최근 일주일': [moment().subtract('days', 6), new Date()],
	           '최근 한달': [moment().subtract('days', 29), new Date()],
	           '이번달': [moment().startOf('month'), moment().endOf('month')],
	           '지난달': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
			},
			opens: 'right',
			
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
		}, 
		$scope.cb
	);
	$scope.cb(moment($location.search().startDate || moment().startOf('month').format('YYYY-MM-DD'), 'YYYY-MM-DD'), 
    		moment($location.search().endDate || moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'));
	*/
	$('input[name="request_time"]').daterangepicker({
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
        $scope.sform.regDate= start.format('YYYY-MM-DD');
		$('input[name="request_time"]').html(start.format('YYYY MM DD'));
      //console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');
    });
	$scope.doSearch(); 
	$scope.onErrorCode=function(){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/config/modal.errorcode.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'ErrorCodeCtrl',
	        resolve: {
	            item:{}
	        	}
	     }).result.then(function (selectedItem) {
	    	 
	     }, function (err) {
	    	 
	     });
	}

}).controller('ErrorCodeCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.myCache = MyCache;
    //$scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;
});


	