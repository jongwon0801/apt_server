
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/jquery.steps/build/jquery.steps.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
		  //'/css/upload.css',
		  //'/plugin/dropzone/dropzone.js',
		  //'/css/plugins/dropzone/basic.css',
		  //'/plugin/dropzone/dropzone.css',
		  //'http://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js',
		  //'//rawgit.com/enyo/dropzone/master/dist/dropzone.js',
//		  '//rawgit.com/enyo/dropzone/master/dist/dropzone.css',
		  //'//rawgit.com/enyo/dropzone/master/dist/basic.css',
		  ],cache:true,serie: true}])
.controller('GoodsViewCtrl', function($scope,$http,$state,$stateParams,MyCache,Goods,$q) {
	//console.log($stateParams);
	
	
	//if(true){return;}
	$scope.myCache=MyCache;
	$q.all([Goods.get($stateParams).$promise,MyCache.loadGCode(['goods.productType','yn','goods.status','goods.kind','goods.cate'])]).then(function(results){
	        	//console.log(MyCache.get('cakePackage.cakeType'));
	        	
	        	//console.log(results[0]);
	        	
	        	$scope.item=results[0];
                $scope.item.cate = $scope.item.category.substring(0,2);
	        	MyCache.loadGCode(['goods.cate.'+$scope.item.category.substring(0,2)]).then(function(rss){
		  			
		  			//console.log($scope.item.category.substring(0,2));
		  			$scope.item.categoryName = MyCache.getValue('goods.cate',$scope.item.category.substring(0,2))+'>'+
		  			MyCache.getValue('goods.cate.'+$scope.item.category.substring(0,2),$scope.item.category);
		  		})
				
	 },function(err){
	        	
	        	ERROR($state,err);
	 });
     
     $scope.initUpload=function(){
		  $('#fileupload').fileupload({
		        url: '/upload',
		        dataType: 'json',
		        //autoUpload:true,
		        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
		        
		        done: function (e, data) {
		        	//console.log(data.result);
		        	var file = data.result;
		        	$scope.item.thumbnail = file;
	                $scope.$apply();
	                
		            /*$.each(data.result.files, function (index, file) {
		            	$scope.item.thumbnail = file.thumbnailUrl;
		                $scope.$apply();
		                
		            });*/
		        },
		        progressall: function (e, data) {
		            /*var progress = parseInt(data.loaded / data.total * 100, 10);
		            $('#progress .progress-bar').css(
		                'width',
		                progress + '%'
		            );*/
		        }
		   });
	    }	
  	$scope.$watch(
            "item.cate",
            function( newValue, oldValue ){
            	//$scope.selectedRegion=[];
            	console.log(newValue,oldValue);
				if(newValue){
					$q.all([MyCache.loadGCode(['goods.cate.'+newValue])]).then(function(results){
						$scope.category2List =MyCache.get('goods.cate.'+newValue);
					});
				}
            }
    );	
    
    $scope.itemUpdate=function(){
		Goods.update($scope.item,function(res){
			
			toastr.success('수정하였습니다.');
			
		},function(err){
			ERROR($state,err);
		})
	}
});


	