angular.module('inspinia',
	['ngResource',
	 {files:[
		   '/bower_components/summernote/dist/summernote.css',
           '/bower_components/summernote/dist/summernote.min.js',
           '/bower_components/angular-summernote/dist/angular-summernote.min.js',
           '/bower_components/summernote/dist/lang/summernote-ko-KR.js'
	],cache:true,serie: true}])
.controller('ShippingCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$resource,MyCache,CodeTbl) {
  
	//$scope.item={};
	//$scope.myCache=MyCache;
	$scope.loadData=function(){
		
		$resource('/admin/CodeTbl/:gCode', { gCode: '@gCode'},{
			query: { method:'GET', cache: false, isArray:true }
		}).query({gCode:'shipping'},function(res){
			$scope.list=res;
		},function(err){
			ERROR($state,err);
		});
	}
	$scope.loadData();
	/*
	$scope.descUp=function(item){
  		var sidx = $scope.item.descList.indexOf(item)
  		$scope.item.descList.swap1(sidx,sidx-1);
  		
  	}
  	$scope.descDown=function(item){
  		
  		var sidx = $scope.item.descList.indexOf(item)
  		$scope.descList.swap1(sidx,sidx+1);
  	}
  	*/
	
	$scope.sform = {gCode:'shipping'};
	$scope.formSubmit=function(){
		$scope.doItemInsert($scope.sform);
	};
	  
	
	$scope.doItemInsert=function(item){
		 CodeTbl.save(item,function(res){
			 toastr.success('성공적으로 추가하였습니다.');
			 swal.close();
			 $scope.loadData();
		 },function(err){
			 ERROR($state,err);
		 })
	}
	 $scope.itemUpdate=function(item){
		 swal({
		        title: "수정하시겠습니까?",
		        text: "데이타를 수정합니다.",
		        type: "warning",
		        showCancelButton: true,
		         cancelButtonText: "취소",
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: "네, 수정할래요!",
		        closeOnConfirm: false
		    }, function () {
		    	$scope.doItemUpdate(item)
		    });
	 }
	 $scope.doItemUpdate=function(item){
		 CodeTbl.update(item,function(res){
			 toastr.success('성공적으로 수정하였습니다.');
			 swal.close();
			 $scope.loadData();
		 },function(err){
			 ERROR($state,err);
		 })
	 }
	 
	 $scope.itemDelete=function(item){
		 swal({
		        title: "삭제하시겠습니까?",
		        text: '삭제하면 복구할 수 없습니다.',
		        type: "warning",
		        showCancelButton: true,
		         cancelButtonText: "취소",
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: "네, 수정할래요!",
		        closeOnConfirm: false
		    }, function () {
		    	$scope.doItemDelete(item)
		    });
	 }
	 $scope.doItemDelete=function(item){
		 CodeTbl.delete(item,function(res){
			 toastr.success('성공적으로 삭제하였습니다.');
			 swal.close();
		 },function(err){
			 ERROR($state,err);
		 })
	 }
	 
			 
 
}).factory('CodeTbl',function($resource){
	
	return $resource('/admin/CodeTbl/:gCode/:key', { gCode: '@gCode',key:'@key' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
})



