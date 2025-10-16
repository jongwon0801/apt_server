
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          '/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.min.css',
          '/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.min.js',
          '/bower_components/jQuery-contextMenu/dist/jquery.ui.position.min.js',
          '/bower_components/datetimepicker/jquery.datetimepicker.css',
	      '/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js',
          //'/bower_components/angular-bootstrap-contextmenu/contextMenu.js',
          '/js/lockerScript.js'
		  ],cache:false,serie: true}])
  .controller('AppleboxViewCtrl', function($timeout,$rootScope,$scope,$http,$location,$filter,$q,Locker,Applebox,$stateParams,$state,$modal,MyCache) {
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
    $scope.lockMerge=function(cabinets,lockerStatus){
        
        //var datas = [];
        angular.forEach(cabinets.cabinet, function(value, index) {
            angular.forEach(value.box, function(val, ind) {
                angular.forEach(lockerStatus, function(value1, index1) {
                    if(val.serial == value1.serial && val.jumper==value1.jumper){
                        val.closed=value1.closed;
                        return false;
                    }
                });
            });
        });
        //return datas;
    };
    //$q.all([$http.post('/v1/AppleboxAll/'+$stateParams.yid,{checkStatus:true},{headers:{'applebox-host':'applebox-'+$stateParams.yid+'.apple-box.kr'}})
    //    ]).then(function(results){
    //$q.all([$http.post('/v1/AppleboxAll/'+$stateParams.yid,null,{headers:{'applebox-host':'applebox-'+$stateParams.yid+'.apple-box.kr'}}),
    //    $http.post('/v1/Status/'+$stateParams.yid,null,{headers:{'applebox-host':'applebox-'+$stateParams.yid+'.apple-box.kr'}})]).then(function(results){
            
    $q.all([$http.get('/v1/AppleboxAll/'+$stateParams.yid,null),
        ]).then(function(results){

//$q.all([$http.get('/v1/AppleboxAll/'+$stateParams.yid)]).then(function(results){	
        //$http.post('/v1/'+$stateParams.yid+'/AppleboxAll').then(function(res1){
        //console.log(res1.data.data);
        console.log(results); 
        //var cabinets = results[0].data;
        //console.log(cabinets);

       // var cabinets = results[0].data;
	var cabinets = results[0].data.data;
	//$scope.title = cabinets.data.applebox.name;
        $scope.title = cabinets.applebox.name;
        //console.log(results[0].data);
        
        //var lockerStatus = results[1].data.data;

        //console.log(lockerStatus);
        //$scope.lockMerge(cabinets,lockerStatus);

        //console.log(cabinets);
        //console.log(lockerStatus);
        //console.log(list);

        cc = ['#ff0000','#00ffff','#ff00ff','#ffff00','#0000ff'];

        //$scope.list = init_viewport(cabinets,cc,500,900);

        // 키오스크 칸의 컬럼 크기 
        var sw=500/2.5;
        var wh=1800/2.5;
        $scope.list = init_viewport(cabinets,cc,sw,wh);

        //console.log($scope.list);
        //$('#child').style.width=sw+'px';    
        //$('#child').style.height=sh+'px';
        //console.log($scope.list);
        /*$scope.itemClick(function(data){
            //consle.log(data);
            $scope.editLocker(data);
        });*/
        $.contextMenu({
            selector: "d",
            items:{
                name:'ljsdljlsdjfljsdf'
            }
        });
        $timeout(function(){
            $.contextMenu({
                // define which elements trigger this menu
                selector: ".cabinet_panel",
                trigger:'left',
                // define the elements of the menu
                callback: function(key, opt){ 
                    var locker = $(opt.$trigger).data('locker');
                    
                    if(key=='open'){
                        
                        $http.post('/v1/OpenToAdmin/'+locker.yid,locker,{headers:{'applebox-host':'applebox-'+$stateParams.yid+'.apple-box.kr'}}).then(function(rs){
                            console.log(rs);
                            //toastr.success('성공적으로 수정하였습니다!!!');
                        },function(err){
                            console.log(err);
                            toastr.success(err.message);
                        });
                    }else{
                        $scope.editLocker(locker,key);
                    }
                },
                items: {
                    
                    view: {
                        name: "상세정보"
                    },
                    save: {
                        name: "열기-보관",
                        disabled: function(key, opt) { 
                            var locker = $(opt.$trigger).data('locker');
                            if(locker.closed && locker.status=='B'){
                                return false;
                            }
                            return true;
                        }
                    },
                    take: {
                        name: "열기-수령",
                        disabled: function(key, opt) { 
                            var locker = $(opt.$trigger).data('locker');
                            if(locker.closed && locker.status=='A'){
                                return false;
                            }
                            return true;
                        } 
                    },
                    open: {
                        name: "열기-관리",
                        disabled: function(key, opt) { 
                            var locker = $(opt.$trigger).data('locker');
                            if(locker.closed){
                                return false;
                            }
                            return true;
                        }
                    }
                }
                
            });
        });
    },function(err){
        ERROR($state,err);
    });

    
    /*Applebox.get($stateParams,function(rs){
        $scope.item = rs;
    });*/
    
    $scope.onDeleteAll=function(){

        if(conform('전체가 삭제됩니다.삭제하시겠습니까?')){
            $http.delete('/v1/AppleboxAllDelete/'+$stateParams.yid,null).then(function(results){

                alert('성공적으로 삭제하였습니다.');

            },function(err){
                alert(err);
            });
        }
    }    
    $scope.editLocker=function(item,action){
    
        $modal.open({
            animation:true,
            templateUrl: action=='view'?"views/applebox/modal.locker.html":"views/applebox/modal.locker.open.html",
            //backdrop: false,
            //windowClass: 'right fade',
            //keyboard: true,
            controller: 'LockerCtrl',
            resolve: {
                item: function () {
                    return item;
                    },
                action: function(){
                    return action;
                }   
                }
        }).result.then(function (selectedItem) {
            //$scope.doBuddyList(selectedItem);
            //$scope.doSearch()
        }, function (err) {
            
        });
    }
    $scope.onInstallFile=function(){
        
        $modal.open({
            animation:true,
            templateUrl: "views/applebox/modal.install.file.html",
            //backdrop: false,
            //windowClass: 'right fade',
            //keyboard: true,
            controller: 'InstallFileCtrl',
            resolve: {
                item: function () {
                    return $stateParams;
                    }
                }
        }).result.then(function (selectedItem) {
            //$scope.doBuddyList(selectedItem);
            //$scope.doSearch()
        }, function (err) {
            
        });
    }
}).controller('InstallFileCtrl', function($state,$rootScope,$scope,$http,$modalInstance,$resource,item,MyCache,Locker,$timeout){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
    };

    $http.get('/v1/AppleboxAll/'+item.yid,null).then(function(results){
        $scope.item = results.data;

        angular.forEach($scope.item.cabinet, function (value, index) {

            angular.forEach(value.box, function (box, idx) {
                delete box.yid;
                delete box.saveHp;
                delete box.saveName;
                delete box.saveDate;
                delete box.pwd;
                delete box.toHp;
                delete box.toName;
                delete box.usage;
                delete box.thingsSq;
                delete box.uuid;
            });
      });
    },function(err){

    });
    
}).controller('LockerCtrl', function($state,$rootScope,$scope,$http,$modalInstance,$resource,item,action,MyCache,Locker,$timeout){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    $scope.action= action;
    //console.log(item);
    
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['locker.status','locker.kind','locker.usage']);
	$scope.item=item;

    
	//$scope.point = 0;
    //console.log(item);
    //console.log(yid);
	$scope.trySave=function(){

        if(action=='save'){
            if($scope.item.kind=='A'){
                toastr.error('비워있는 보관함만 보관할 수 있습니다.');
                return;
            }
            if($scope.item.status!='B'){
                toastr.error('비워있는 보관함에만 보관할 수 있습니다.');
                return;
            }
            $http.post('/v1/OpenToSave/'+$scope.item.yid,$scope.item,{headers:{'applebox-host':'applebox-'+$scope.item.yid+'.apple-box.kr'}}).then(function(rs){
                if(rs.data.success==true){
                    toastr.success("ok");
                    $modalInstance.close($scope.item);
                }else{
                    ERROR($state,rs);
                }
            },function(err){
                ERROR($state,err);
            });
        }else if(action=='take'){
            $scope.item.hp = item.toHp;
            if($scope.item.kind=='A'){
                toastr.error('비워있슨 보관함만 보관할 수 있습니다.');
                return;
            }
            if($scope.item.status!='A'){
                toastr.error('보관중인 물건만 찾을 수 있습니다.');
                return;
            }
            $http.post('/v1/OpenToTake/'+$scope.item.yid,$scope.item,{headers:{'applebox-host':'applebox-'+$scope.item.yid+'.apple-box.kr'}}).then(function(rs){
                if(rs.data.success==true){
                    toastr.success("ok");
                    $modalInstance.close($scope.item);
                }else{
                    ERROR($state,rs);
                }
            },function(err){
                ERROR($state,err);
            });
        
        }else if(action=='view'){
            Locker.update($scope.item,function(res){
                toastr.success('성공적으로 수정하였습니다!!!');
                $modalInstance.close($scope.item);
                    
            },function(err){
                ERROR($state,err);
            });
            $http.put('/v1/Locker/'+$scope.item.yid,$scope.item,{headers:{'applebox-host':'applebox-'+$scope.item.yid+'.apple-box.kr'}}).then(function(rs){
                if(rs.data.success==true){
                    toastr.success("라즈베리 수정");
                    $modalInstance.close($scope.item);
                }else{
                    ERROR($state,rs);
                }
            },function(err){
                ERROR($state,err);
            });

        }
	}

	
}).controller('ThingsCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache,Things,$timeout){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    
    $scope.myCache = MyCache;
    $scope.myCache.loadGCode(['things.status','things.kind']);
	//$scope.item=item;
	Things.get(item).then(function(rs){
        $scope.item= rs.data;
    },function(err){

    });

	
});
	



	
