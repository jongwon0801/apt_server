
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  '/admin/js/FileSaver.js',
		  '/admin/js/json-to-excel.js',
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
	//$scope.sform.saveDate = $scope.sform.saveDate || moment().format('YYYY-MM-DD')
	//console.log(moment().format('YYYY-MM-DD HH'));
	$scope.sform.display=$scope.display;
	
	$scope.exportExcel = function() {

		//2 execute the hidden button 
		var formd = angular.copy($scope.sform);
		formd.display=2000;
		$q.all([SaveLog.query(formd).$promise]).then(function(results){
			//$scope.totalItems = results[0].recordsTotal;
			$scope.list1=results[0].data;
			//$scope.currentPage = $scope.sform.page;
				//console.log($scope.list);
			document.getElementById('btnExport').click();	
		},function(err){
			ERROR($state,err);
			
		});

		
	
	}
	//페이지이동
	$scope.pageChanged = function(p) {
		$scope.sform.page=p;
		$state.go('applebox.saveloglist',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([SaveLog.query($scope.sform).$promise,$scope.myCache.loadGCode(['locker.kind','locker.status','locker.usage'])]).then(function(results){
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
		//console.log('formsubmit');
		$scope.sform.page='';
		$state.go('applebox.saveloglist',$scope.sform);
		
	}
	
	$scope.cb = function(start, end,label) {
		//console.log(start);
		//console.log(end);
		$scope.sform.startDate = start.format('YYYY-MM-DD');
		$scope.sform.endDate= end.format('YYYY-MM-DD');
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
	//$scope.cb(moment($location.search().startDate || moment().startOf('month').format('YYYY-MM-DD'), 'YYYY-MM-DD'), 
	$scope.cb(moment($location.search().startDate || moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'), 
    		moment($location.search().endDate || moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'));
	
	/*
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
		$('input[name="saveDate"]').html(start.format('YYYY MM DD'));
      //console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');
	});
	*/
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
	$scope.toLocalDateString=function(s){
		moment(new Date(s)).format('YYYY-MM-DD')
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