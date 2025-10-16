
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
.controller('OrderPayListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Things,$stateParams,$state,Shop) {

    //console.log(ViewCtrl);
    //$scope.myCache=MyCache;
    $scope.maxSize=5;
    $scope.display = 10;
    $scope.sform=$location.search();
    $scope.sform.page=$scope.sform.page ||1
    $scope.sform.mode='1';
    //$scope.sform.memberType=$scope.sform.memberType ||''
    $scope.sform.status=$scope.sform.status ||''
    $scope.sform.name=$scope.sform.name ||''
    $scope.sform.hp=$scope.sform.hp ||''
    $scope.sform.display=$scope.display;


    //페이지이동
    $scope.pageChanged = function(p) {
    $scope.sform.page=p;
    $state.go('.',$scope.sform); 
    };	
    // 초기 데이타로드 
    $scope.doSearch=function(){

        $q.all([$http.get('/admin/Paylist',{params:$scope.sform,cache: false}),Shop.query().$promise,$scope.myCache.loadGCode(['order.status.B','things.method','things.payMethod'])]).then(function(results){
            //$scope.totalItems = results[0].recordsTotal;

            console.log(results);
            $scope.list=results[0].data;
            $scope.shopList=results[1].data;
            //$scope.currentPage = $scope.sform.page;
            //$scope.totalPrice=results[0].totalPrice;
            //$scope.shopList = results[1].data;
            //console.log($scope.list);
            $scope.totalPrice=0;
            $scope.total={date:$scope.sform.startDate.substring(0,7) };
            $scope.total.cardAmount=0;
            $scope.total.cardCnt=0;
            $scope.total.passbookAmount=0;
            $scope.total.passbookCnt=0;
            $scope.total.moneyAmount=0;
            $scope.total.moneyCnt=0;
            $scope.total.phoneAmount=0;
            $scope.total.phoneCnt=0;
            $scope.total.totalCnt=0;
            $scope.total.totalAmount=0;
            for(var i=0; i<$scope.list.length; i++){
                $scope.totalPrice+=$scope.list[i].totalPrice;
                $scope.total.cardAmount+=$scope.list[i]['카드'];
                $scope.total.cardCnt+=$scope.list[i]['카드건'];
                $scope.total.passbookAmount+=$scope.list[i]['무통장'];
                $scope.total.passbookCnt+=$scope.list[i]['무통장건'];
                $scope.total.moneyAmount+=$scope.list[i]['현금'];
                $scope.total.moneyCnt+=$scope.list[i]['현금건'];
                $scope.total.phoneAmount+=$scope.list[i]['핸드폰'];
                $scope.total.phoneCnt+=$scope.list[i]['핸드폰'];
                $scope.total.totalCnt+=$scope.list[i]['cnt'];;
                $scope.total.totalAmount+=$scope.list[i]['totalPrice'];
            }
            console.log($scope.total)
        },function(err){
            ERROR($state,err);
            
        });
    }

    $scope.complete=function(item,status){

        var req= angular.copy(item);
        req.status=status;
        Things.update(req,function(rs){
            toastr.success('성공적으로 수정하였습니다!!!');
            item.status=status;
        });
    }
    //검색버튼 눌렀을
    $scope.formSubmit=function(){

        //console.log(111);
        $scope.sform.page='';
        $state.go('order.paylist',$scope.sform);

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
});
