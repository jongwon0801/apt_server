angular.module('inspinia')
.controller('EditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Member,$stateParams) {
	
	Member.get($stateParams,function(res){
		//console.log(res);
	    if(res.success){
		  $scope.item=res.data;
		  $scope.myCache.loadGCode(['member.status','member.memberType','member.media']);
	    }else{
		  toastr.error('조회 실패');
	    }			
  })
  $scope.formSubmit=function(){
	  Member.update($scope.item,function(res){
		  if(res.success){
			  toastr.error('수정 성공');
		  }else{
			  toastr.error('수정 실패');
		  }
	  })
	  
  }
})


