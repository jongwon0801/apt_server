angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:true,serie: true}])
.controller('OrderViewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$state,MyCache,Order,$timeout) {
	$scope.myCache=MyCache;
	
	//$q.all([])
	$q.all([Order.get($stateParams).$promise,MyCache.loadGCode(['order.status','goods.kind']).promise]).then(function(results){
		  $scope.item  = results[0];
		  //console.log($scope.item);
		  //$scope.item.gift =results[1].data;
          
          $http.get('/admin/getCustomer/'+$scope.item.memberSq).then(function(res){
             $scope.item.customer = res.data; 
             //console.log(res);
          },function(err){
              //console.log(err);
          });
	},function(err){
		ERROR($state,err);
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
}).factory('Order',function($resource){
	return $resource('/seller/Order/:orderSq', {orderSq: '@orderSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
});


	