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
.controller('BuyerEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Buyer,Member,$resource,$state,Shop) {
  
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
	  
	  //if($stateParams.buyerSq){
			$q.all([Shop.query({kind:['A','C']}).$promise,Buyer.get($stateParams).$promise,MyCache.loadGCode(['buyer.status'])]).then(function(results){
				$scope.item=results[1];
				$scope.parcelList=[];
				$scope.laundryList=[];
				for (var key in results[0].data) {
					
					var kind = results[0].data[key].kind;
					if(kind=='A'){ //세탁소
						$scope.laundryList.push(results[0].data[key]);
					}else if(kind=='C'){ //택배 
						$scope.parcelList.push(results[0].data[key]);
					}
				}
				//$scope.shopList=results[0].data;
				
			},function(err){
				ERROR($state,err);
			});
	  /*}else{
			$q.all([Shop.query({kind:'C'}).$promise,MyCache.loadGCode(['buyer.status'])]).then(function(results){
				//console.log(results[0]);
				$scope.shopList=results[0].data;
			},function(err){
				ERROR($state,err);
			});
	  }*/
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
  }
  
}).controller('ModalAddrNewCtrl', function($scope,$http,$ocModal,$init) {
	
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

