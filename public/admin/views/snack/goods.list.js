
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
        '/bower_components/sweetalert/dist/sweetalert.css',
    	'/bower_components/sweetalert/dist/sweetalert.min.js'
		  ],cache:true,serie: true}])
  .controller('SnackGoodsListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,SnackGoods,$stateParams,$state,MyCache,SnackPackage) {
    $scope.myCache=MyCache;
	$scope.maxSize=5;
    $scope.display = 10;
	$scope.sform=$location.search();
	$scope.sform.page=$scope.sform.page ||1
	$scope.sform.memberType=$scope.sform.memberType ||''
	//$scope.sform.gubun=$scope.sform.gubun ||''
	
	$scope.sform.display=$scope.display;
	SnackPackage.query(function(res){
        $scope.pkgList=res;
    });
	
	//페이지이동
	$scope.pageChanged = function(p) {
		$scope.sform.page=p;
		$state.go($state.current,$scope.sform); 
    };

	
	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([SnackGoods.query($scope.sform).$promise,MyCache.loadGCode([])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  //$scope.list=fromJson(results[0].data,['thumbnail','descList']);
			  $scope.list=results[0].data;
			  $scope.currentPage = $scope.sform.page;
			  
			  //angular.forEach($scope.list, function(value, key){
			  //console.log(angular.fromJson($scope.list[0].thumbnail));
			  //console.log($scope.list);
			  
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go($state.current,$scope.sform);
		
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
	$scope.doSearch();
    
    $scope.onRegister=function(item){
        swal({
		        title: "간식데이 예약상품등록",
		        text: '등록하면 사용자에게 간식데이 예약배송상품으로 보여집니다.',
		        type: "warning",
		        showCancelButton: true,
		         cancelButtonText: "취소",
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: "네, 등록할래요!",
		        closeOnConfirm: false
		    }, function () {
		    	updateSnackPackage(item);
		    });
    } 
    function updateSnackPackage(item){
        console.log(item);
        SnackPackage.update(item,function(res){
            toastr.success('성공적으로 등록하였습니다.');
			swal.close();
        },function(err){
            
        });
    }
		
}).factory('AutoOrder',function($resource){
	return $resource('/admin/AutoOrder/:autoOrderSq', { autoOrderSq: '@autoOrderSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
}).factory('SnackPackage',function($resource){
	return $resource('/admin/SnackPackage/:gubun', { gubun: '@gubun' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:true }
	});	    
}).factory('SnackGoods',function($resource){
	return $resource('/admin/SnackGoods/:snackGoodsSq', { snackGoodsSq: '@snackGoodsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
})



	