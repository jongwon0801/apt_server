
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
        '/bower_components/ng-sortable/dist/ng-sortable.min.js',
        '/bower_components/ng-sortable/dist/ng-sortable.min.css',
        '/bower_components/ng-sortable/dist/ng-sortable.style.min.css',
        '/shared/controller/modal.goods.list.js',
		'/bower_components/datetimepicker/jquery.datetimepicker.css',
	    '/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js'
    ],cache:true,serie: true}])
  .controller('SnackGoodsEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,AutoOrder,$stateParams,$state,MyCache,$modal,SnackPackage,SnackGoods,$timeout) {
    $scope.myCache=MyCache;
    SnackPackage.query(function(res){
        $scope.pkgList=res;
    });
	
    
    if($stateParams.snackGoodsSq){ // 조회
        $q.all([SnackGoods.get($stateParams).$promise,MyCache.loadGCode([])]).then(function(results){
                $scope.item = results[0];
                $scope.item.goods=$scope.item.goods||[];
                //var start = moment($scope.autoOrder.regDate);
                //$scope.startDate = start.format('YYYY-MM-DD');
                //$scope.endDate = start.add(1,'year').add(-1,'day').format('YYYY-MM-DD');
                    
                
        });
    }else{ // 신규
        $scope.item={gubun:'A',goods:[]};    
    }
	$scope.sortableOptions = {
        containment: '#grid-container'
    };
    $scope.onGoodsDelete=function(idx){
        $scope.item.goods.splice(idx,1);
    }
	$scope.chooseGoods=function(){
			
			$modal.open({
				animation:true,
		        templateUrl: "/shared/views/modal.goods.list.html",
		        //backdrop: false,
		        //windowClass: 'right fade',
		        //keyboard: true,
                size:'lg',
		        controller: 'ModalGoodsListCtrl',
		        resolve: {
		            item: function () {
		                return {};
		            	}
		        	}
		     }).result.then(function (items) {
                 //$scope.item.goods=$scope.item.goods||[];
                 $scope.item.goods= $scope.item.goods.concat(items);
		    	 //$scope.items.push(angular.copy(items));
		     }, function () {
		    	 //$log.info('Modal dismissed at: ' + new Date());
		     });
			
    }
    $scope.formSubmit=function(){
        if($scope.item.snackGoodsSq){ //수정 
            SnackGoods.update($scope.item,function(res){
                //$state.go('snack.goods.list');
                toastr.success('수정 성공!!!');
            },function(err){
                ERROR($state,err);
            });
        }else{ // 신규입력
            SnackGoods.save($scope.item,function(res){
                $state.go('snack.goods.list');
                toastr.success('입력 성공!!!');
            },function(err){
                ERROR($state,err);
            });
        }
    } 
	$timeout(function(){
        //$.datetimepicker.setLocale('ko');
        
        $('#datetimepicker').datetimepicker({
                timepicker:false, // 꽂상품
                format:'Y.m.d'	,
                //inline:true,
                minDate:0
        });
            
    });
		
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


	