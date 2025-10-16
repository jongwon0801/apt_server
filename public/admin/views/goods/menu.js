
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
		  '/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
        '/plugin/dropzone/dropzone.js',
		  '/css/plugins/dropzone/basic.css',
		  '/plugin/dropzone/dropzone.css'
		  ],cache:true,serie: true}])
  .controller('GoodsMenuCtrl', function($rootScope,$scope,$http,$location,$modal,$q,Goods,$stateParams,$state,MyCache) {
	
    function loadData(){
        $http.get('/v1/CodeTbl/goods.cate').then(function(res){
            $scope.groups= res.data;
            $.each($scope.groups,function(idx,item){
                $http.get('/v1/CodeTbl/goods.cate.'+item.key).then(function(res){
                    item.sub = res.data;
                });
            });
        });
    }
    loadData();
    $scope.onView=function(item){
			
		$modal.open({
			animation:true,
	        templateUrl: "views/goods/modal.menu.html",
	        controller: 'MenuEditCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            	}
	        	}
	     }).result.then(function (selectedItem) {
	         //console.log(selectedItem);
	    	 //$scope.saveData(selectedItem);
             loadData();
	     }, function () {
	    	 //$log.info('Modal dismissed at: ' + new Date());
	     });
		
	}           
}).controller('MenuEditCtrl',function($scope,$modalInstance,item,$ocLazyLoad,CodeTbl){
    
   
        $scope.dropzoneConfig = {
		    options: { // passed into the Dropzone constructor
		      url: '/upload',
		      paramName: "files[]",
		      addRemoveLinks:true,
		      dictDefaultMessage:'대표 상품사진 이미지를 선택해주세요.',
		      maxFiles:1,
		      uploadMultiple:false,
		      acceptedFiles: ".jpeg,.jpg,.png,.gif",
		      init:function(){
		    	  thisDropzone =this;
		    	  if($scope.item.thumbnail){
		    		  var mockFile = { name: $scope.item.thumbnail.originalname, size: $scope.item.thumbnail.size };
		                 
		                thisDropzone.options.addedfile.call(thisDropzone, mockFile);
		 
		                thisDropzone.options.thumbnail.call(thisDropzone, mockFile, $scope.item.thumbnail.url);
		    	  }               
		      }
		    },
		    eventHandlers: {
		      sending: function (file, xhr, formData) {
		      },
		      error:function(err){
		    	toasr.error(err);  
		      },
		      success: function (file, response) {
		    	        $scope.item.thumbnail=angular.fromJson(response);
		    		  //$scope.item.thumbnail=response;
		      },
		      addedfile:function(file){
		    	  
		      },
		      removedfile:function(file){
		    	  console('removed');
		    	  //delete $scope.item.image;
		      }
		      
		    }
	    };
    	  
   // console.log(item);
		$scope.item=item;
		$scope.ok = function () {
			
            CodeTbl.update($scope.item,function(res){
				//$scope.close();
                $modalInstance.close($scope.item);
			});
            //$modalInstance.close($scope.item);
		}
		$scope.close = function () {
		    $modalInstance.dismiss('cancel');
		};
      
}).factory('CodeTbl',function($resource){
	
	return $resource('/admin/CodeTbl/:gCode/:key', { gCode: '@gCode',key:'@key' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
})


	