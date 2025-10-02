
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/shared/controller/modal.addr.new.js'

		  ],cache:true,serie: true}])
.controller('OrderEditCtrl', function($scope,$http,$state,$modal,$stateParams,MyCache,Order,Shop,$q,$location) {
	
	

	$scope.MyCache=MyCache;
	
	//MyCache.loadGCode(['product.status','product.saleType','pcode','yn']);
	var jobs=[Shop.query({kind:'B'}).$promise,MyCache.loadGCode(['order.status','pcode','yn'])];
	
	


	
	if($stateParams.productSq){
		jobs.push(Order.get($stateParams).$promise);	
		/*Product.get($stateParams,function(res){
	  		$scope.item= res;
	  		
	  	});*/
	}else{
		$scope.item={categoryCode:'',status:'A'}; //
	}
	$q.all(jobs).then(function(results){
		//console.log(results);
		$scope.shopList = results[0].data;
		if($stateParams.orderSq){
			$scope.item= results[2].data;
			
		}
	},function(err){
		console.log(err);
	});
	
	
	$scope.formSubmit=function(){
		
		//$scope.item.stepList = $scope.stepList;
		
		if($scope.item.orderSq){
			Order.update($scope.item,function(res){
			    	toastr.success('수정하였습니다.');
			    
			},function(err){
				ERROR($state,err);
			});
		}else{
			
			Order.save($scope.item,function(res){
			    	toastr.success('입력하였습니다.');
			    	$state.go('shop.orderlist');
			    
			},function(err){
				ERROR($state,err);
			});
		}
	}
    $scope.addrOpen=function(){
		//console.log('openmodal');
		$modal.open({
			animation:true,
			templateUrl: "/shared/views/modal.addr.new.html",
			//backdrop: false,
			//windowClass: 'right fade',
			//keyboard: true,
			controller: 'ModalAddrNewCtrl',
			resolve: {
				item: function () {
					return {};
					}
				}
			}).result.then(function (selectedItem) {
				if ($scope.item.addr ==undefined)$scope.item.addr={};
				
				$scope.item.addr.zipNo=selectedItem.zipNo;
				$scope.item.addr.roadAddrPart1=selectedItem.roadAddrPart1;
				$scope.item.addr.roadAddrPart2=selectedItem.roadAddrPart2;
				//$scope.item.addr.roadAddr=selectedItem.roadAddr;
			}, function () {
				//$log.info('Modal dismissed at: ' + new Date());
			});
		
	} 
	
}).controller('ModalAddrNewCtrl', function($scope,$http,$ocModal,$init) {
	
	 $scope.goSearch= function(){
		  $http.get('/v1/addr_new', {
		        params:  {query: $scope.query},
		    }
		)
		.then(function(response) {
			console.log(response.data)
		}, function(x) {
		    
		})
		return false;
	  };
	  
	  $scope.close=function(idx,item){
		$ocModal.close('addr_search', idx, item);
	  }
});
	