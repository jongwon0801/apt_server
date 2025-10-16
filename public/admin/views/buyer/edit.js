angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
						'/css/upload.css',
		               '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
					   '/bower_components/upload/vendor/jquery.ui.widget.js',
		               '/bower_components/upload/jquery.iframe-transport.js',
		               '/bower_components/upload/jquery.fileupload.js',
		               'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/css/bootstrap-datepicker3.css',
		               'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/js/bootstrap-datepicker.min.js',
		               '/bower_components/sweetalert/dist/sweetalert.css',
		               '/bower_components/sweetalert/dist/sweetalert.min.js',
		               '/bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
			           '/bower_components/magnific-popup/dist/magnific-popup.css',
					   '/shared/controller/modal.addr.new.js'
			           ],cache:true,serie: true}])
.controller('BuyerEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Buyer,Member,$resource,$state,Shop,Service) {
  
  $scope.item={};
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

  $scope.loadData=function(){
	  
	  if($stateParams.buyerSq){
			$q.all([Shop.query({kind:['A','C'],display:'100'}).$promise,Buyer.get($stateParams).$promise,Service.get($stateParams).$promise, MyCache.loadGCode(['buyer.status','shop.kind'])]).then(function(results){
				$scope.item=results[1];
				$scope.parcelList=[];
				$scope.laundryList=[];
				$scope.serviceList=results[2].data;
				console.log($scope.serviceList);
				for (var key in results[0].data) {
					
					var kind = results[0].data[key].kind;
					if(kind=='A'){ //세탁소
						$scope.laundryList.push(results[0].data[key]);
					}else if(kind=='C'){ //택배 
						$scope.parcelList.push(results[0].data[key]);
					}
				}
				//console.log($scope.laundryList);
				//$scope.shopList=results[0].data;
				
			},function(err){
				ERROR($state,err);
			});
	  }else{
			$q.all([Shop.query({kind:['A','C'],display:'100'}).$promise,MyCache.loadGCode(['buyer.status'])]).then(function(results){
				//console.log(results[0]);
				//$scope.shopList=results[0].data;
				$scope.item={};
				$scope.parcelList=[];
				$scope.laundryList=[];
				//console.log(results[0].data);
				for (var key in results[0].data) {
					//console.log(key);
					var kind = results[0].data[key].kind;
					if(kind=='A'){ //세탁소
						$scope.laundryList.push(results[0].data[key]);
					}else if(kind=='C'){ //택배 
						$scope.parcelList.push(results[0].data[key]);
					}
				}
				//console.log($scope.laundryList);
			},function(err){
				ERROR($state,err);
			});
	  }
  }
  $scope.loadData();
  
  $scope.formSubmit=function(){ // 수정하기 
	 //console.log('dddd');

	 if($scope.item.buyerSq){
		Buyer.update($scope.item,function(res){

				
			toastr.success('성공적으로 수정하였습니다!!!');

			$location.path('/buyer/list');
				
		},function(err){
			ERROR($state,err);
		});
	 }else{
		Buyer.save($scope.item,function(res){

				
					toastr.success('성공적으로 입력하였습니다!!!');
				
		},function(err){
			ERROR($state,err);
		});
	 }
	};
	$scope.onServiceDelete=function(item){
		Service.delete(item,function(res){

				
			toastr.success('성공적으로 삭제하였습니다!!!');
			$state.reload();
		},function(err){
			ERROR($state,err);
		});
	};

	$scope.onService=function(){
		$modal.open({
			animation:true,
					templateUrl: "./views/buyer/modal.service.new.html",
					//backdrop: false,
					//windowClass: 'right fade',
					//keyboard: true,
					controller: 'ModalServiceNewCtrl',
					resolve: {
							item: function () {
									return {};
								}
						}
			 }).result.then(function (selectedItem) {
				console.log(selectedItem);
				selectedItem.buyerSq=$scope.item.buyerSq;
				Service.save(selectedItem,function(res){

				
					toastr.success('성공적으로 입력하였습니다!!!');
					$state.reload();
				},function(err){
					ERROR($state,err);
				});

			 }, function () {
				 //$log.info('Modal dismissed at: ' + new Date());
			 });
	};

}).controller('ModalServiceNewCtrl', function(Shop,$q,$scope,$http,$modalInstance,MyCache) {
		//console.log(MyCache.cache.get('locker.usage'));
		$scope.myCache=MyCache;
		$scope.item={};
		$scope.item1={};
		$q.all([Shop.query({display:'100'}).$promise,MyCache.loadGCode(['shop.kind'])]).then(function(results){
			
			for (var key in results[0].data) {
				
				var kind = results[0].data[key].kind;

				//console.log($scope.item);
				//console.log($scope.item[kind]);
				itemList = $scope.item1[kind]||[];
				//console.log(itemList);

				
				itemList.push(results[0].data[key]);
				$scope.item1[kind]=itemList;
			}
			//console.log($scope.laundryList);
			//$scope.shopList=results[0].data;
			
		},function(err){
			ERROR($state,err);
		});
		$scope.itemSelect=function(){
			$scope.item.shopSq=$scope.shopInfo.shopSq;
			$scope.item.name=$scope.shopInfo.companyName;
			$scope.item.hp=$scope.shopInfo.hp;
			console.log($scope.shopInfo);
		}
	$scope.usageChange=function(){
		//console.log('usage chanage');
	}
	 $scope.close=function(){
			$modalInstance.dismiss('cancel');
	 }
	 $scope.trySave=function(){
			$modalInstance.close($scope.item);
	 };
  
}).controller('ModalAddrNewCtrl', function($scope,$http,$init) {
	
	 $scope.goSearch= function(){
		  $http.get('/v1/addr_new', {
		        params:  {query: $scope.query},
		    }
		)
		.then(function(response) {
			console.log(response.data)
		  /*if(response.data.NewAddressListResponse.newAddressListAreaCdSearchAll instanceof Array)
				$scope.list=  response.data.NewAddressListResponse.newAddressListAreaCdSearchAll;
			else
				$scope.list=  [response.data.NewAddressListResponse.newAddressListAreaCdSearchAll];
		  */		
		}, function(x) {
		    
		})
		return false;
	  };
	  
	  $scope.close=function(idx,item){
		$ocModal.close('addr_search', idx, item);
	  }
});

