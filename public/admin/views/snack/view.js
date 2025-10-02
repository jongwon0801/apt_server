
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
		  ],cache:true,serie: true}])
  .controller('SnackViewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,AutoOrder,$stateParams,$state,MyCache,$resource,$modal) {
    $scope.myCache=MyCache;
	
	/*$q.all([GiftEvent.query($scope.sform).$promise]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  $scope.stat = results[0].stat;
			  console.log($scope.list);
			  $scope.currentPage = $scope.sform.page;
			  
		});
      */  	
      //console.log($resource('/admin/GiftEvent'));
     /* $http.get('/admin/GiftEvent',{params:{a:1}}).then(function(res){
        console.log(res.data.data);  
      });*/
    $q.all([AutoOrder.get($stateParams).$promise,MyCache.loadGCode([])]).then(function(results){
        
//        console.log(results[0]);
            //$scope.totalItems = results[0].recordsTotal;
            //$scope.list=fromJson(results[0].data,['thumbnail','descList']);
            //$scope.list=results[0].data;
            //$scope.currentPage = $scope.sform.page;
            
            //angular.forEach($scope.list, function(value, key){
            //console.log(angular.fromJson($scope.list[0].thumbnail));
            //console.log($scope.list);
            $scope.autoOrder = results[0];
            //console.log(results[0]);
            /*$.each($scope.autoOrder.goods,function(idx,item){
                $http.get('/admin/GiftEvent',{params:{memberSq:item.memberSq,gubun:item.gubun}}).then(function(res){
                    $scope.autoOrder.goods[idx].giftEvent = res.data.data;
                })  
            });*/
            
            $.each($scope.autoOrder.goods,function(idx,item){
                item.memberSq = $scope.autoOrder.memberSq;
                item.salePrice = item.cnt*item.price;
                 
            });
            
            //$scope.list = results[1].data.data;
            //console.log($scope.list.data);
            var start = moment($scope.autoOrder.regDate);
                $scope.startDate = start.format('YYYY-MM-DD');
                $scope.endDate = start.add(1,'year').add(-1,'day').format('YYYY-MM-DD');
                
        //$scope.open=true;       
    });
    $scope.status = {
        open: false
    };
    $scope.$watch('status.open', function(isOpen,isOpen1){
        //console.log(isOpen);
        if (isOpen==true) {
            loadHistory();
        }    
    });
    function loadHistory(){
        $http.get('/admin/GiftEvent',{params:{memberSq:$scope.autoOrder.memberSq,gubun:'C'}}).then(function(res){
                $scope.giftEventList = res.data.data;
        }) 
    }
    
    $scope.popupGift=function(item,e){
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        $modal.open({
                animation:true,
                templateUrl: "views/snack/modal.gift.html",
                //backdrop: false,
                //windowClass: 'right fade',
                //keyboard: true,
                //size:'lg',
                scope:$scope,
                controller: 'ModalGiftCtrl',
                resolve: {
                    item: function () {
                        //item.salePrice = item.cnt*item.price;
                        //console.log(item.price);
                        //console.log(item);
                        item.shipping = $scope.autoOrder.shipping;
                        return item;
                        }
                    }
            }).result.then(function (item) {
                
            }, function (err) {
                
      });
    }
	
	
  }).controller('ModalGiftCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,item,$state,$resource,MyCache,$modalInstance,$ocLazyLoad) {
    //parameter >고객사(memberSq),패키지상품조류(A\B\C) === (고객사(대상),  패키지 신청정보, 보낼패키지상품) 
    //item ==> 패키지신청정보 
    $scope.item = item;
    
    // 회원정보 조회
    $http.get('/admin/Member/'+$scope.item.memberSq).then(function(res){
       $scope.item.shipping.to= {name:res.data.name,hp:res.data.hp};         
    }); 
    //console.log(item);
    /*if(item.goods){ // 상품 목록조회
        $scope.item=item;
    }else{ 
        var SnackPackage = $resource('/v1/SnackPackage/:gubun', {gubun:'@gubun'});
        SnackPackage.get(item, function(res){
            //console.log(res);
            $scope.item=res.snackGoods;
        });
    }*/
    var SnackPackage = $resource('/v1/SnackPackage/:gubun', {gubun:'@gubun'});
        SnackPackage.get(item, function(res){
            $scope.item.snackGoods=res.snackGoods;
    });
        
	$scope.close = function () {
	    //$modalInstance.close('cancel');
        $modalInstance.dismiss('cancel');
	};
    $scope.formSubmit=function(){
        //console.log($scope.item);
        
        //if(true) return;
        $http.post('/admin/SnackPresent', $scope.item).success(function (response) {
            //callback(response);
            $modalInstance.dismiss('cancel');
            toastr.success('성공적으로 보냈습니다.');
        })
        .error(function(err){
            toastr.error(err.message);
        });
    }
		
}).factory('AutoOrder',function($resource){
	return $resource('/admin/AutoOrder/:autoOrderSq', { autoOrderSq: '@autoOrderSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
})


	