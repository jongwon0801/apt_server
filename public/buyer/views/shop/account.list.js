angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:false,serie: true}])
.controller('AccountListCtrl', function($state,$rootScope,$scope,$http,$location,$filter,$q,$stateParams,$state,MyCache,Order,$timeout,$ocLazyLoad,$modal) {
	$scope.myCache=MyCache;
	
	//$q.all([])
	/*$q.all([Order.get($stateParams).$promise,MyCache.loadGCode(['order.status','goods.kind']).promise]).then(function(results){
		  $scope.item  = results[0];
		  console.log($scope.item);
		  //$scope.item.gift =results[1].data;
	},function(err){
		ERROR($state,err);
	});
	*/
    console.log('aaa',$state);
    $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			//console.log(toState);
			
			//if(toState.name=='present.gift.step2'){
    });
	$scope.updateStatus=function(){
		Order.update($scope.item,function(res){
			toastr.success("성공적으로 수정하였습니다.");
		},function(err){
			ERROR($state,err);
		})
	}
	$scope.trySave=function(){
		Order.update($scope.item,function(res){
			toastr.success("성공적으로 수정하였습니다.");
		},function(err){
			ERROR($state,err);
		})
	}
    $scope.onProductView=function(item){
		$ocLazyLoad.load(['/shared/controller/modal.product.view.js']).then(function(){
            $modal.open({
                animation:true,
                templateUrl: "/shared/views/modal.product.view.html",
                //backdrop: false,
                //windowClass: 'right fade',
                //keyboard: true,
                size:'lg',
                scope:$scope,
                controller: 'ModalProductViewCtrl',
                resolve: {
                    item: function () {
                        return item;
                        }
                    }
            }).result.then(function (item) {
                
            }, function (err) {
                
            });
        });
	}
});


	