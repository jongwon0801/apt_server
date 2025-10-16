
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
        '/bower_components/sweetalert/dist/sweetalert.css',
    	'/bower_components/sweetalert/dist/sweetalert.min.js'
		  ],cache:false,serie: true}])
  .controller('OrderListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Order,$stateParams,$state,$modal) {
	//$scope.myCache=MyCache;
	$scope.maxSize=5;
    $scope.display = 10;
	$scope.sform=$location.search();
	$scope.sform.page=$scope.sform.page ||1
	$scope.sform.memberType=$scope.sform.memberType ||''
	$scope.sform.status=$scope.sform.status ||'';
	$scope.sform.stype=$scope.sform.stype ||'A';
	
	$scope.sform.display=$scope.display;
	
	
	//페이지이동
	$scope.pageChanged = function(p) {
		$scope.sform.page=p;
		$state.go('shop.orderlist',$scope.sform); 
    };
    $scope.updateToShipping=function(item){
        Order.update({orderSq:item.orderSq,status:'B'},function(res){
            toastr.success('수정하였습니다.');
            item.status='B';
        },function(err){
            ERROR($state,err);
        });
    }

	$scope.updateToShipped=function(item){
        Order.update({orderSq:item.orderSq,status:'C'},function(res){
            toastr.success('수정하였습니다.');
            item.status='C';
        },function(err){
            ERROR($state,err);
        });
    }
    /*
    $scope.cancelOrder=function(item){
        Order.update({orderSq:item.orderSq,status:'E'},function(res){
            toastr.success('수정하였습니다.');
            item.status='E';
            
        },function(err){
            ERROR($state,err);
        });
    }*/
    $scope.cancelOrder=function(item){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/shop/modal.order.cancel.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'OrderCancelCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            }
            }
	     }).result.then(function (selectedItem) {
	    	 //$scope.doBuddyList(selectedItem);
	    	 //load();
             swal({
		        title: "주문취소 하시겠습니까?",
		        text: "데이타를 수정합니다.",
		        type: "warning",
		        showCancelButton: true,
		         cancelButtonText: "취소",
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: "네, 취소할래요!",
		        closeOnConfirm: false
		    }, function () {
		    	//$scope.doItemUpdate(item)
                Order.update({orderSq:item.orderSq,status:'E',cancelDesc:selectedItem.cancelDesc},function(res){
                    toastr.success('수정하였습니다.');
                    swal.close();
                    item.status='E';
                },function(err){
                    ERROR($state,err);
                });
		    });
	     }, function (err) {
	    	 
	     });
	}
    
	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Order.query($scope.sform).$promise,$scope.myCache.loadGCode(['order.status','pcode'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  //$scope.list=fromJson(results[0].data,['thumbnail','descList']);
			  $scope.list=results[0].data;
			  //console.log($scope.list);
			  $scope.currentPage = $scope.sform.page;
			  
			  //angular.forEach($scope.list, function(value, key){
			  //console.log(angular.fromJson($scope.list[0].thumbnail));
			  //console.log($scope.list);
			  
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('shop.orderlist',$scope.sform);
		
	}
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
	
	$scope.doSearch(); 
		
}).controller('OrderCancelCtrl', function($rootScope,$scope,$modalInstance,$resource,item){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
	$scope.item=item;
	console.log(item);
	$scope.ok=function(){
		
        $modalInstance.close($scope.item);
	}
	
});


	