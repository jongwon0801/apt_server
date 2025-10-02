
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
		         //
                 
                 //'http://bigspotteddog.github.com/ScrollToFixed/jquery-scrolltofixed-min.js',
                 //'/bower_components/masonry/dist/masonry.pkgd.min.js'
                 //'/bower/components/jquery-infinite-scroll/jquery-infinite-scroll.min.js'
		  ],cache:false,serie: true}])
  .controller('GoodsCategoryListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Goods,$stateParams,$state,MyCache,$modal,$window) {
	
	//console.log('----');
	$scope.myCache=MyCache;
	$scope.maxSize=5;
    $scope.display = 10;
    $scope.sform=$location.search();
	$scope.sform.category=$stateParams.category;
	$scope.sform.page=$scope.sform.page ||1
	//$scope.sform.memberType=$scope.sform.memberType ||''
	//$scope.sform.status=$scope.sform.status ||''
	$scope.sform.status='B';
	$scope.sform.display=$scope.display;
    
    //$('.nav-tabs').scrollToFixed();
	//alert(1);
	//console.log($stateParams);
	/*
	if($stateParams.cate=='00'){
		$scope.sform.category=['0006','0101','0301','0300','0103'];
	}else if($stateParams.cate=='01'){
		$scope.sform.category=['0100','0101','0102','0103'];
	}else if($stateParams.cate=='02'){
		$scope.sform.category=['0400','0401','0402'];
	}else if($stateParams.cate=='03'){
		$scope.sform.category=['0400','0401','0402'];
	}else if($stateParams.cate=='04'){
		$scope.sform.category=['0301','0303'];
	}else if($stateParams.cate=='05'){
		$scope.sform.category=['0302'];
	}*/
    $scope.pageChanged = function(p) {
		$scope.sform.page=p;
		$state.go('present.gift.step1.cate',$scope.sform); 
    };
	$scope.sform.category=[$stateParams.cate];
	//console.log($stateParams);
	// 초기 데이타로드
    
    //console.log($('body')); 
     
    //$scope.totalItems=100;
  
	$scope.doSearch=function(){
		
		$q.all([Goods.query($scope.sform).$promise,$scope.myCache.loadGCode(['goods.productType','goods.status','goods.cate'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
              
              console.log(results[0].data);
			  $scope.list=results[0].data;
			  $scope.currentPage = $scope.sform.page;
              
              $window.setTimeout(function(){$('[data-toggle="tooltip"]').tooltip();});
			  //console.log($scope.sform.page);
		},function(err){
			ERROR($state,err);
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('goods.list.category',$scope.sform);
		//present.gift.step1.cate
	}
	
	
	$scope.doSearch();
	
	/*$scope.onView=function(item){
		if(item.kind=='A'){
			$state.go('present.gift.step1',item);
			
		}else{
			$state.go('present.gift.step2',item);
		}
	}*/
	$scope.onView=function(item){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/present/modal.goods.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        size:'lg',
	        scope:$scope,
	        controller: 'GoodsViewModalCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            	}
	        	}
	     }).result.then(function (gtype) {
	    	 
             $scope.item.gubun=gtype;
		     $scope.goStep2(item);
	     }, function (err) {
	    	 
	     });
	}
	$( ".steps>ul>li" ).removeClass("current");
	$( ".steps>ul>li:nth-child(1)" ).addClass("current");
    
    /*$('#content').infinitescroll({
 
        navSelector  : "div.navigation",            
                    // selector for the paged navigation (it will be hidden)
        nextSelector : "div.navigation a:first",    
                    // selector for the NEXT link (to page 2)
        itemSelector : "#content div.post"          
                    // selector for all items you'll retrieve
    });*/
        
}).controller('GoodsViewModalCtrl', function($scope,$modalInstance,item,MyCache,$q,$resource){
	//console.log(item);
	
	$scope.item = item;
	$scope.myCache = MyCache;
	//MyCache.loadGCode(['goods.productType','yn','goods.status','goods.kind','goods.cate','goods.cate.'+$scope.item.category.substring(0,2)])
	MyCache.loadGCode(['goods.productType','yn','goods.status','goods.kind'])
		.then(function(rss){
			
	})
		
	$scope.onGift=function(gtype){
		$modalInstance.close(gtype);
		
	}
	$scope.close = function () {
	    $modalInstance.close('cancel');
	};
	 
});


	