
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  '/bower_components/sweetalert/dist/sweetalert.css',
			'/bower_components/sweetalert/dist/sweetalert.min.js'
		  ],cache:false,serie: true}])
.controller('TicketPayCtrl', function($scope,$http,$location,$state,Goods,$resource,$timeout,$stateParams,MyCache,Seller,$q,$window) {
        
		
	
	//console.log($scope.item.pay);
	Seller.get({goodsSq:$scope.item.goods.goodsSq},function(res){
		  $scope.item.seller =res;
		  //console.log(res);
		  initPrice();

	});
	$timeout(function(){
			$( ".steps>ul>li" ).removeClass("current");
			$( ".steps>ul>li:nth-child(4)" ).addClass("current");
		 	
	});
	function initPrice(){
		//var shippingPrice=parseInt($scope.getShippingPrice());
		var shippingPrice=0;
		var salePrice = $scope.item.goods.salePrice;
		$scope.item.pay={
			//goodsPrice:$scope.item.goods.salePrice,
			method:'card',
			shippingPrice:shippingPrice,
			useTicket:[],
			usePoint:0,
			fillPrice:salePrice*$scope.item.userList.length*$scope.item.cnt
		};
		
	}
	$scope.openPoint=function(){ // 상품상세 추가 
		
  		//var item = {kind:$('#descType').val(),sortOrder:$scope.item.descList.length+1};
		
		
		$modal.open({
			animation:true,
	        templateUrl: "views/present/modal.point.html",
	        backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'PointCtrl',
	        resolve: {
	            item: function () {
	                return {fillPrice:$scope.item.pay.fillPrice,usePoint:$window.Math.abs($scope.item.pay.usePoint)};
	            }
	        }
	     }).result.then(function (usePoint) {
	    	 //var oldUsePoint = $scope.item.pay.usePoint
	    	 
	    	// $scope.initPrice();
	    	 if(usePoint>0){
	    		 //console.log($scope.getShippingPrice());
	    		 $scope.item.pay.fillPrice=$scope.getShippingPrice();
		    	 if($scope.item.pay.fillPrice<$window.Math.abs(usePoint)){
		    		 usePoint = -$scope.item.pay.fillPrice;
		    	 }
		    	 $scope.item.pay.usePoint=-usePoint;
				 
	        	 $scope.item.pay.fillPrice-=usePoint; 
		         
	        	 //$scope.item.pay.usePoint+=usePoint;
				 
		         //$scope.item.pay.fillPrice+=usePoint;
	    	 }
	    	 
	     }, function () {
	    	 //$log.info('Modal dismissed at: ' + new Date());
	     });
		
	} 	
		
}).controller('PointCtrl',function($scope,$stateParams,$modalInstance,item,MyCache,$http,Member) {
	Member.get({},function(res){
		//console.log(res);
		$scope.myPoint= res.point-item.usePoint;
		//$scope.myPoint=0;
		$scope.usePoint = item.usePoint;
		$scope.fillPrice=item.fillPrice;
		
	},function(err){
		
	});
	$scope.useTotalPoint=function(){
		if($scope.myPoint==0 || $scope.fillPrice==0){
			return;
		}
		if($scope.fillPrice>$scope.myPoint){
			$scope.usePoint+=$scope.myPoint;
			$scope.myPoint=0;
			$scope.fillPrice+=$scope.usePoint;
		}else{
			$scope.usePoint+=$scope.fillPrice;
			$scope.myPoint-=$scope.fillPrice;
			$scope.fillPrice = 0;
		}
	}
	$scope.ok = function () {
		
		$modalInstance.close($scope.usePoint);
	
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
})

	