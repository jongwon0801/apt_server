
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
          '/bower_components/bootstrap-treeview/dist/bootstrap-treeview.min.js',
          //'/bower_components/bootstrap-treeview/dist/bootstrap-treeview.min.css'
          
		  ],cache:false,serie: true}])
  .controller('ShopCategoryCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Shop,$stateParams,$state,$modal,MyCache) {
	    $scope.treeData = [];
  
        $scope.loadTree=function(){
            
            $scope.myCache.loadGCode(MyCache.pcode).then(function(res){
                console.log(res);
                var plist = MyCache.get('pcode');
                console.log(plist);
                for( var i=0; i<plist.length; i++){
                    var cobj = plist[i];
                    console.log(cobj);
                    var clist = MyCache.get('pcode.'+cobj.key);
                    var td = {text:cobj.name,nodes:[],key:cobj.key};
                    for( var j=0; j<clist.length; j++){
                        td.nodes.push({text:clist[j].name,key:clist[j].key});
                    }
                    $scope.treeData.push(td);
                }
                initTree();
                
            },function(err){

            });
            
        }
        
        $scope.loadTree();
        $scope.selectedItem = undefined;
	    $("#contextMenu").hide();
        $.fn.contextMenu = function (settings) {

		        return this.each(function () {

		            // Open context menu
		            $(this).on("contextmenu", function (e) {
		                // return native menu if pressing control
		                if (e.ctrlKey) return;
		                
		                //open menu
		                $(settings.menuSelector)
		                    .data("invokedOn", $(e.target))
		                    .show()
		                    .css({
		                        position: "absolute",
		                        left: e.pageX,
		          		      	top: e.pageY
		                    })
		                    .off('click')
		                    .on('click', function (e) {
		                        $(this).hide();
		                
		                        var $invokedOn = $(this).data("invokedOn");
		                        var $selectedMenu = $(e.target);
		                        //console.log($invokedOn);
		                        settings.menuSelected.call(this, $invokedOn, $selectedMenu,e.pageX,e.pageX);
		                });
		                
		                return false;
		            });

		            //make sure menu closes on any click
		            $(document).click(function () {
		                $(settings.menuSelector).hide();
		                //$('#categoryEdit').hide();
		            });
		        });
		        
		          

		    };
        function initTree() {
            $('#treeview1').treeview({
                data: $scope.treeData,
                levels:1
            });
            
            $('#treeview1').on('nodeExpanded', function(event, data) {
                //alert(data);
            });
            $('#treeview1').on('nodeSelected', function(event, data) {
                    
                //console.log(data);
                $scope.selectedItem = data;
                $(event.target).contextMenu({
                    menuSelector: "#contextMenu",
                    menuSelected: function (invokedOn, selectedMenu,x,y) {
                        
                        if(selectedMenu.text()=='2차카테고리추가'){
                            $scope.onView2();
                        }else if(selectedMenu.text()=='수정하기'){
                            //$scope.editNode();
                        }else if(selectedMenu.text()=='삭제하기'){
                            //$scope.deleteNode();
                        }else if(selectedMenu.text()=='정보'){
                            //$scope.onView();
                        }
                        //$('#categoryEdit').data( "data", { first: 16, last: "pizza!" } );
                    }
                });
            });
        }
    /*
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
*/
    
        
    $scope.onView2=function(item){
        sitem = $('#treeview1').treeview('getSelected', 0)[0];
        //console.log(sitem);
        if(sitem==undefined){
            return;
        }
        
        var sortOrder=1;
        /*if(sitem.data.kw2Sq){ // 2차선택
            sortOrder = sitem.data.sortOrder+1;
        }else{
            if(sitem.nodes){
                sortOrder = sitem.nodes.length+1;
            }
        }*/
        $rootScope.newItem = {status:'B'};
        $modal.open({
            animation:true,
            templateUrl: "views/shop/modal.category.html",
            //backdrop: false,
            //windowClass: 'right fade',
            //keyboard: true,
            controller: 'CategoryEditCtrl',
            resolve: {
                item: function () {
                    return item;
                    }
                }
        }).result.then(function (selectedItem) {
            //$scope.doBuddyList(selectedItem);
            //$scope.doSearch()
        }, function (err) {
            
        });
    }


}).controller('CategoryEditCtrl', function($rootScope,$scope,$modalInstance,$resource,item,MyCache,$timeout){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
    /*console.log(item);
    $timeout(function(){
        $('#datetimepicker').datetimepicker({
                    timepicker:true,
                    format:'Y.m.d H:i'	
                    //inline:true,
                    //minDate:0
        });
    });*/
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
	



	