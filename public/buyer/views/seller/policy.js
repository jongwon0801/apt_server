angular.module('inspinia',
	[
	 {files:[
		   '/bower_components/summernote/dist/summernote.css',
           '/bower_components/summernote/dist/summernote.min.js',
           '/bower_components/angular-summernote/dist/angular-summernote.min.js',
           '/bower_components/summernote/dist/lang/summernote-ko-KR.js'
	],cache:true,serie: true}])
.controller('PolicyCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$resource,MyCache) {
  
	
	$scope.item={};
	//$scope.myCache=MyCache;
	/*MyCache.loadGCode(['policy']).then(function(res){
		
		//console.log(MyCache.get('policy','information'));
		$scope.information=MyCache.get('policy','information');
		
		//console.log($scope.information);
		$scope.notes=MyCache.get('policy','notes');
		
	});
	*/
	$http.get("/v1/CodeTbl/policy").then(function(res){
		
		//console.log(res);
		$.each(res.data,function(key,value){
			if(value.key=='information') $scope.information=value;
			if(value.key=='notes') $scope.notes=value;
		});
	},function(err){
		ERROR($state,err);
	});
	
	
	
	$scope.formSubmit=function(){
		var CodeTbl=$resource('/admin/CodeTbl/:gCode/:key', { gCode: '@gCode', key:'@key' }, {update:{ method:'PUT'}});
	     
		 $q.all([CodeTbl.update($scope.information).$promise],CodeTbl.update($scope.notes).$promise).then(function(results){
				
			 	toastr.success('수정하였습니다.');
		  },function(err){
			  //console.log(res.data.msg);
			  ERROR($state,err);
			  
		  });
	 };
	  
  
			 
 
});



