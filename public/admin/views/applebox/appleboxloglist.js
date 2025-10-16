
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		  ],cache:true,serie: true}])
  .controller('AppleboxLogListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Applebox,AppleboxLog,$stateParams,$state) {
	  
	  //console.log(ViewCtrl);
	//$scope.myCache=MyCache;
	$scope.item={yid:$stateParams.yid};
    
	// 초기 데이타로드 
	$scope.loadData=function(){
		
		$q.all([AppleboxLog.query($stateParams).$promise]).then(function(results){

            console.log(results);
			  $scope.list=results[0];
		},function(err){
			ERROR($state,err);
			
		});
	}
	
	$scope.logDelete=function(item){
        
		AppleboxLog.delete(item,function(res){
            toastr.success('성공적으로 삭제하였습니다.');
            $scope.loadData();    
        },function(err){
            ERROR($state,err);
        });
	}
	//검색버튼 눌렀을
	$scope.formSubmit=function(){

        AppleboxLog.save($scope.item,function(res){
            toastr.success('성공적으로 입력하였습니다!!!');
            $scope.loadData();        
        },function(err){
            ERROR($state,err);
        });
        //$scope.sform.page='';
        
        //$state.go('applebox.appleboxloglist',$scope.sform);
        

		
	}
	$scope.loadData(); 
	
	
	
	
	

});
	