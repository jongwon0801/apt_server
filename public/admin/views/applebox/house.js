
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
  .controller('HouseCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,SaveLog,$stateParams,$state,$modal,MyCache) {
	  
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
	$scope.sform.yid=$stateParams.yid
	$scope.eform={};
	//페이지이동
	$scope.pageChanged = function(p) {

        console.log(p);
		$scope.sform.page=p;
		$state.go('applebox.house',$scope.sform); 
    };	
	// 초기 데이타로드 
	$scope.doSearch=function(){
        console.log('dSearch');
        $http.get('/admin/House',{
            params:  $scope.sform,
        }).then(function(response) {
            //console.log(response);
            $scope.totalItems = response.data.recordsTotal;
            $scope.currentPage = $scope.sform.page;
            
            $scope.list = response.data.data;
            
        }, function(x) {
            console.log(x);
        });
	}
	$scope.createHouse=function(){
        $http.post('/admin/House/'+$stateParams.yid, $scope.eform).then(function(rs){
            console.log(rs);
            toastr.success('성공적으로 등록하였습니다.');
            $scope.doSearch();
            
        },function(err){
            toastr.success('실패하였습니다.');
            console.log(err);
            ERROR($state,err);
        });
    }
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		//console.log('formsubmit');
		//$scope.sform.page='';
        //$state.go('applebox.house',$scope.sform);
        $scope.createHouse();
		
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
	$scope.toLocalDateString=function(s){
		moment(new Date(s)).format('YYYY-MM-DD')
	}
    
	
});