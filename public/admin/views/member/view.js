
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia').controller('MemberViewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,MyCache,Member,$stateParams,$state,$window) {
     
	Member.get($stateParams,function(res){
		$scope.myCache=MyCache;
			$scope.item=res;
			MyCache.loadGCode(['member.status','member.memberType','member.media']);
			//toastr.error('조회 실패');
		
	},function(err){
		ERROR($state,err);
	});
	
	$scope.deleteItem=function(item){
		toastr.success('지울수 없습니다.');
	};
		
});


	