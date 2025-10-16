
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          '/bower_components/datetimepicker/jquery.datetimepicker.css',
	      '/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js',
          '/js/lockerScript.js'
		  ],cache:false,serie: true}])
  .controller('AppleboxViewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,$stateParams,$state,$modal,MyCache) {
	    //init_viewport('/v1/AppleboxAll/'+$stateParams.yid, '#child');

    //console.log(new Date().toISOString());

    
    
    //$scope.someDate = new Date().toISOString();

    //a = JSON.stringify(new Date());
    //a=  JSON.parse(null);
    //console.log(a);
    //console.log(a);
    //console.log($scope.someDate);
        //console.log(typeof new Date() );
    //console.log(Date.parse(a));
    
    $http.post('/v1/'+$stateParams.yid+'/AppleboxAll').then(function(res1){
        console.log(res1.data.data);
        
        init_viewport(res1.data.data, '#child');    
         
        
        CabinetClickListener(function(data){
            //consle.log(data);
            $scope.editLocker(data);
        });
    },function(err){
        ERROR($state,err);
    });

    
        
    $scope.editLocker=function(item){
    
        $modal.open({
            animation:true,
            templateUrl: "views/applebox/modal.locker.html",
            //backdrop: false,
            //windowClass: 'right fade',
            //keyboard: true,
            controller: 'LockerCtrl',
            resolve: {
                item: function () {
                    return item;
                    },
                yid: function(){
                    return $stateParams.yid;
                }   
                }
        }).result.then(function (selectedItem) {
            //$scope.doBuddyList(selectedItem);
            //$scope.doSearch()
        }, function (err) {
            
        });
    }

}).controller('LockerCtrl', function($rootScope,$scope,$modalInstance,$resource,item,yid,MyCache,Locker,$timeout){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    console.log(item);
    $timeout(function(){
        $('#datetimepicker').datetimepicker({
                    timepicker:true,
                    format:'Y.m.d H:i'	
                    //inline:true,
                    //minDate:0
        });
    });
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind']);
	$scope.item=item;
	//$scope.point = 0;
    //console.log(item);
    //console.log(yid);
	$scope.trySave=function(){
        //console.log($scope.item);
        //if(true) return;    
        $scope.item.isSync='Y';
        Locker.update($scope.item,function(res){
                
            toastr.success('성공적으로 수정하였습니다!!!');

            $modalInstance.close($scope.item);
                
        },function(err){
            //ERROR($state,err);
        });
    
	}

	
});
	



	