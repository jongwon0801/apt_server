angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:false,serie: true}])
.controller('GiftEventViewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$state,GiftEvent,Gift,MyCache,Order,$timeout) {
	$scope.myCache=MyCache;
	
	//$q.all([])
    
	$q.all([GiftEvent.get($stateParams).$promise,Gift.query({target:'from',giftEventSq:$stateParams.giftEventSq}).$promise,MyCache.loadGCode(['goods.kind','pay.method','pay.type',]).promise]).then(function(results){
		  $scope.item  = results[0];
		  
		  //console.log($scope.item.option);
		  $scope.item.gift =results[1].data;
		  
		  console.log($scope.item);
		  console.log($scope.item.gift);
		  
		  //console.log($scope.item);
		  if($scope.item.gubun=='A'){ // 배송선물  B:핸드폰선물 
			  Order.query({target:'from',giftEventSq:$scope.item.giftEventSq},function(res){
				  //console.log(res);
				  //$timeout(function() {
					  $scope.item.order = res.data[0];
					  //console.log($scope.item.order);
				  //});
				  //$scope.$apply();
			  },function(err){
				  ERROR($state,err);
			  })
		  }else if($scope.item.gubun=='C'){ // 간식
              //console.log('1');
              $http.get('/admin/SnackOrder?giftEventSq='+$scope.item.giftEventSq).then(function(res){
                  //console.log(res.data.data);
                  $scope.item.order= res.data.data[0];
                  
                  //console.log($scope.item.order);
              });
          }
		  $http.get('/admin/Member/'+$scope.item.memberSq).then(function(res){
             $scope.item.member = res.data;
			 if($scope.item.member.memberType=='B') {
				 $http.get('/admin/getCustomer/'+$scope.item.memberSq).then(function(res){
					$scope.item.member.customer = res.data;	 
				 });
			 }
			  
             //console.log(res);
          },function(err){
              //console.log(err);
          });
		  
	},function(err){
		ERROR($state,err);
	});
}).factory('Order',function($resource){
	return $resource('/admin/Order/:orderSq', {orderSq: '@orderSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
}).factory('GiftEvent',function($resource){
	return $resource('/admin/GiftEvent/:giftEventSq', { giftEventSq: '@giftEventSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});

	
}).factory('Gift',function($resource){
	return $resource('/admin/Gift/:giftSq', { giftSq: '@giftSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
});


	