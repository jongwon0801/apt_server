
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
		  ],cache:true,serie: true}])
  .controller('SnackPackageListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,SnackGoods,$stateParams,$state,MyCache,SnackPackage,$ocLazyLoad,$modal) {
    $scope.myCache=MyCache;
	
		$q.all([SnackPackage.query().$promise]).then(function(results){
			  //$scope.totalItems = results[0].recordsTotal;
			  //$scope.list=fromJson(results[0].data,['thumbnail','descList']);
			  $scope.list=results[0];
			  //$scope.currentPage = $scope.sform.page;
			  
			  //angular.forEach($scope.list, function(value, key){
			  //console.log(angular.fromJson($scope.list[0].thumbnail));
			  //console.log($scope.list);
			  
		});
	
	
	//검색버튼 눌렀을
	$scope.updateItem=function(item){
		
        SnackPackage.update(item,function(res){
            
        },function(err){
            ERROR(err,$state);
        })
		
	}
   
	$scope.onViewSnack=function(item){
		$ocLazyLoad.load(['/shared/controller/modal.snack.view.js']).then(function(){
            $modal.open({
                animation:true,
                templateUrl: "/shared/views/modal.snack.view.html",
                //size:'lg',
                controller: 'ModalSnackGoodsViewCtrl',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            }).result.then(function (items) {
            }, function () {
            });
        });	
        
        
    } 
		
}).factory('AutoOrder',function($resource){
	return $resource('/admin/AutoOrder/:autoOrderSq', { autoOrderSq: '@autoOrderSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
}).factory('SnackGoods',function($resource){
	return $resource('/admin/SnackGoods/:snackGoodsSq', { snackGoodsSq: '@snackGoodsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
}).factory('SnackPackage',function($resource){
	return $resource('/admin/SnackPackage/:gubun', { gubun: '@gubun' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:true }
	});	
})




	