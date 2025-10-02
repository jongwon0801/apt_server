angular.module('inspinia',
	
	['localytics.directives',{files:[//'/bower_components/moment/min/moment.min.js',
			  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
			//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
	         '/bower_components/datetimepicker/jquery.datetimepicker.css',
	         '/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js',
             //'http://mbenford.github.io/ngTagsInput/css/ng-tags-input.min.css',
             //'http://mbenford.github.io/ngTagsInput/js/ng-tags-input.min.js',
			 	'/shared/controller/modal.addr.js',
                '/bower_components/chosen/chosen.css',
                '/bower_components/chosen/chosen.jquery.js',
                '/bower_components/angular-chosen-localytics/dist/angular-chosen.js'
			  ],cache:false,serie: true}])
.controller('PresentStep2Ctrl', function($scope,$http,$state,$modal,Customer,MyCache,Seller,$timeout,$window,$q,$resource) {
        /*
		if(!$scope.item.goods){
			$state.go('present.gift.step1',{gcate:'03'});
			return;
		}
        $q.all([Seller.get({goodsSq:$scope.item.goods.goodsSq}).$promise,MyCache.loadGCode(['goods.kind','pay.method','pay.type']).promise]).then(function(res){
				
            //console.log(res[0]);
            //console.log(res[1]);
               // console.log(res[0]);
                $scope.item.seller =res[0];
                $scope.item.customer={payYn:'N'};
                $scope.changeShippingPrice();
            
        },function(err){
            console.log(err);
            ERROR($state,err);
        });
            
		//console.log($scope.item.gubun);
		$timeout(function(){
			$( ".steps>ul>li" ).removeClass("current");
			$( ".steps>ul>li:nth-child(2)" ).addClass("current");
		 	$.datetimepicker.setLocale('ko');
		 	$('#datetimepicker').datetimepicker({
		 			timepicker:$scope.item.goods.productType=='C', // 케익만
		 			format:'Y.m.d'	,
		 			minDate:0
		 	});
		});
        */
        $timeout(function () {
         //   $scope.myHeader = "How are you today?";
            //$('.chosen-select').chosen({});
        });
	 	//$scope.loadTags = function(query) {
        //    return $resource('/admin/Customer',{query:query}).$promise;
        //};
        
        Customer.query({display:1000},function(res){
           $scope.customers = res.data;
            
        });
	 	$scope.calNum=function(){
			var userList=[];
			
			
            
		}
	  
	 	//$scope.changeShippingPrice();
	  	$scope.goStep3=function(){
	  		
			//console.log($scope.item);
			$scope.calNum();
			
			if($scope.item.userList.length==0){
				toastr.error('선물 보낼 대상을 추가해주세요.');
				
			}else{
			
				if($scope.item.gubun=='A'){
					if($scope.item.userList.length!=1){
						
						toastr.error('배송선물은 1명만 선택해야 합니다.');
					}else{
						if(checkField())
							$state.go('present.gift.step3');
					}
				}else{
					if(checkField())
						$state.go('present.gift.step3');
				}
			}
			
			//console.log($scope.item);
		}
	  	function checkField(){
	  		
	  		if($scope.item.gubun=='A') {
		  		if($scope.item.seller.shipping.kind=='B'&&
		  				!$scope.item.shipping.region){
		  			toastr.error('배송지역을 선택해주세요.');
		  			return false;
		  		}
		  		if(!$scope.item.shipping.to.name){
		  			toastr.error('수취인을 입력해주세요.');
		  			return false;
		  		}
		  		if(!$scope.item.shipping.to.hp){
		  			toastr.error('수취인 연락처를 입력해주세요.');
		  			return false;
		  		}
		  		if(!$scope.item.shipping.addr.addr){
		  			toastr.error('배송주소를 입력해주세요.');
		  			return false;
		  		}
		  		if(!$scope.item.shipping.addr.addrDetail){
		  			toastr.error('배송상세 주소를 입력해주세요.');
		  			return false;
		  		}
		  		if(!$scope.item.shipping.deliveryDate){
		  			toastr.error('배송날짜를 입력해주세요.');
		  			return false;
		  		}
	  		}
	  		return true;
	  	}
	  	$scope.addrOpen=function(){
			//console.log('openmodal');
			$modal.open({
				animation:true,
		        templateUrl: "/shared/views/modal.addr.html",
		        //backdrop: false,
		        //windowClass: 'right fade',
		        //keyboard: true,
		        controller: 'ModalAddrCtrl',
		        resolve: {
		            item: function () {
		                return {};
		            	}
		        	}
		     }).result.then(function (selectedItem) {
		    	 if(!$scope.item.shipping.addr) $scope.item.shipping.addr={};
		    	 if(selectedItem.idx==0){
	   			  	$scope.item.shipping.addr.addr=selectedItem.rnAdres;
		   		  }else{
		   			  $scope.item.shipping.addr.addr=selectedItem.lnmAdres;
		   		  }
		   		  $scope.item.shipping.addr.zipNo=selectedItem.zipNo;
		     }, function () {
		    	 //$log.info('Modal dismissed at: ' + new Date());
		     });
			
		} 
});



