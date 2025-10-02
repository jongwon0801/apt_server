angular.module('inspinia')
.controller('MemberEditCtrl', function($rootScope,$scope,$http,$location,$modal,$filter,$q,Member,$stateParams) {
	function load(){
		$q.all([Member.get($stateParams).$promise,$scope.myCache.loadGCode(['member.status','member.memberType','member.media'])]).then(function(results){
			
			//console.log(results[0]);
			$scope.item=results[0];
			
		},function(err){
			ERROR($state,err);
		});
	}
	load();
	
  $scope.doItemUpdate=function(){
	  Member.update($scope.item,function(res){
		  toastr.success('수정하였습니다.');
	  },function(err){
		  ERROR($state,err);
	  })
	  
  }
  $scope.formSubmit=function(item){
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
  
  $scope.openPoint=function(){
		
		$modal.open({
			animation:true,
	        templateUrl: "views/member/modal.point.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'PointModalCtrl',
	        resolve: {
	            item: function () {
	                return $scope.item;
	            	}
	        	}
	     }).result.then(function (selectedItem) {
	    	 //$scope.doBuddyList(selectedItem);
	    	 load();
	     }, function (err) {
	    	 
	     });
	}
}).controller('PointModalCtrl', function($rootScope,$scope,$modalInstance,$resource,item){
	$scope.close = function () {
	    $modalInstance.dismiss('cancel');
	};
	$scope.item=item;
	$scope.point = 0;
	$scope.ok=function(){
		
		$resource('/admin/Point/'+item.memberSq+'/'+$scope.point).get({},function(res){
			$modalInstance.close($scope.item);
			//toastr.succes('적용하였습니다.');
		},function(err){
			
		});
	}
	
});


