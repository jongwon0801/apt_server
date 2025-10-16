angular.module('inspinia')
.controller('ResidentEditCtrl', function($rootScope,$scope,$http,$location,$modal,$filter,$q,$state,Resident,$stateParams) {
	function load(){
        if($stateParams.residentSq){
            $q.all([Resident.get({residentSq:$stateParams.residentSq}).$promise,$scope.myCache.loadGCode(['resident.status'])]).then(function(results){
                
                $scope.item=results[0];
                
            },function(err){
                ERROR($state,err);
            });
        }else{
            $q.all([$scope.myCache.loadGCode(['resident.status'])]).then(function(results){
                
                $scope.item=$stateParams;
                $scope.item.status='A';
                
            },function(err){
                ERROR($state,err);
            });
        }
	}
	load();
	
  $scope.doItemUpdate=function(){
      console.log($scope.item.residentSq);
      if($stateParams.residentSq){
        Resident.update($scope.item,function(res){
            toastr.success('수정하였습니다.');
        },function(err){
            ERROR($state,err);
        })
      }else{
        Resident.save($scope.item,function(res){
            toastr.success('저장하였습니다.');
            //$location.path('/applebox/list');
            $state.go('house.residentlist',$scope.item);
				
        },function(err){
            ERROR($state,err);
        })
      }
	  
  }
  $scope.formSubmit=function(item){
    $scope.doItemUpdate();
 };
  
	
});


