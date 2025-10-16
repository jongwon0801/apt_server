angular.module('inspinia',
	['ngResource',
	 {files:[
		   '/bower_components/summernote/dist/summernote.css',
           '/bower_components/summernote/dist/summernote.min.js',
           '/bower_components/angular-summernote/dist/angular-summernote.min.js',
           '/bower_components/summernote/dist/lang/summernote-ko-KR.js'
	],cache:true,serie: true}])
.controller('MessageCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,$resource,MyCache,CodeTbl) {
  
	
	$scope.loadData=function(){
		
		$resource('/v1/CodeTbl/:gCode', { gCode: '@gCode'},{
			query: { method:'GET', cache: false, isArray:true }
		}).query({gCode:'message'},function(res){
			
			//console.log(res);
			$scope.list=res; 
		},function(err){
			ERROR($state,err);
		});
	}
	$scope.loadData();
	$scope.onNew=function(item){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/customer/modal.message.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'MessageModalCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            	}
	        	}
	     }).result.then(function (selectedItem) {
	    	 //$scope.doBuddyList(selectedItem);
	    	 $scope.loadData();
	     }, function (err) {
	    	 
	     });
	}
	
	
	  
	
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
		 $modal.open({
				animation:true,
		        templateUrl: "views/customer/modal.message.html",
		        //backdrop: false,
		        //windowClass: 'right fade',
		        //keyboard: true,
		        controller: 'MessageModalCtrl',
		        resolve: {
		            item: function () {
		                return item;
		            	}
		        	}
		     }).result.then(function (selectedItem) {
		    	 $scope.loadData();
		     }, function (err) {
		    	 
		     });
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
	 
			 
}).controller('MessageModalCtrl',function($scope,$modalInstance,item,CodeTbl){

	//console.log(item);
	$scope.item=item;
	$scope.ok = function () {
	    $modalInstance.close('cancel');
	};
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
	
	$scope.trySave=function(){
		if($scope.item.key){
			CodeTbl.update($scope.item,function(res){
				$scope.close();
			});
		}else{
			$scope.item.gCode='message';
			$scope.item.key=$scope.randomStr(3);
			CodeTbl.save($scope.item,function(res){
				$scope.close();
			});
		}
		
	}
	$scope.randomStr = function(x){
		var s = "";
	    while(s.length<x&&x>0){
	        var r = Math.random();
	        s+= (r<0.1?Math.floor(r*100):String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65)));
	    }
	    return s;
	}
}).factory('CodeTbl',function($resource){
	
	return $resource('/admin/CodeTbl/:gCode/:key', { gCode: '@gCode',key:'@key' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
})



