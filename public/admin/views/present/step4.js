angular.module('inspinia',
	
	[{files:[//'/bower_components/moment/min/moment.min.js',
			  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
			//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
	         //'/bower_components/datetimepicker/jquery.datetimepicker.css',
	         //'/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js',
			 //	'/shared/controller/modal.addr.js',
			  ],cache:false,serie: true}])
.controller('PresentStep4Ctrl', function($scope,$http,$state,$modal,$timeout) {

	
	 	
	if(!$scope.item.goods){
		$state.go('present.gift.step1.cate',{cate:'0300'});
		return;
	}
 	function initPrice(){
		var shippingPrice=($scope.item.shipping.shippingPrice);
		//var shippingPrice=0;
		if(!shippingPrice) shippingPrice=0;
		var salePrice = $scope.item.goods.salePrice;
		$scope.item.pay={
			//goodsPrice:$scope.item.goods.salePrice,
			method:'card',
			shippingPrice:shippingPrice,
			useTicket:[],
			usePoint:0,
			fillPrice:salePrice*$scope.item.userList.length*$scope.item.cnt+shippingPrice
		};
		
	}
 	initPrice();
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
	                return {fillPrice:$scope.item.pay.fillPrice,usePoint:$scope.item.pay.usePoint};
	            }
	        }
	     }).result.then(function (usePoint) {
	    	 //var oldUsePoint = $scope.item.pay.usePoint
	    	 
	    	 initPrice();
	    	 usePoint = -usePoint;
	    	 $scope.item.pay.usePoint=0;;
			 
        	 //$scope.item.pay.fillPrice-=$scope.item.pay.usePoint; 
	         
        	 $scope.item.pay.usePoint+=usePoint;
			 
	         $scope.item.pay.fillPrice+=usePoint;
	         
	    	 
	     }, function () {
	    	 //$log.info('Modal dismissed at: ' + new Date());
	     });
		
	} 
 	$timeout(function(){
		$( ".steps>ul>li" ).removeClass("current");
		$( ".steps>ul>li:nth-child(4)" ).addClass("current");
	 	
	});
}).controller('PointCtrl',function($scope,$stateParams,$modalInstance,item,MyCache,$http,Member) {
	Member.get({},function(res){
		console.log(res);
		$scope.myPoint= res.point-item.usePoint;
		//$scope.myPoint=0;
		$scope.usePoint = item.usePoint;
		$scope.fillPrice=item.fillPrice;
		
	},function(err){
		
	});
	$scope.useTotalPoint=function(){
		if($scope.fillPrice==0){
			return;
		}
		if($scope.fillPrice>$scope.myPoint){
			$scope.usePoint=$scope.myPoint;
			$scope.myPoint=0;
			$scope.fillPrice-=$scope.usePoint;
		}else{
			$scope.usePoint=$scope.fillPrice;
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
});



