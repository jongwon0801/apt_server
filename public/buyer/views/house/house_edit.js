angular.module('inspinia')
.controller('HouseEditCtrl', function($rootScope,$scope,$http,$location,$modal,$filter,$q,$state,Resident,$stateParams) {
	function load(){
        $http.get('/buyer/House/'+$stateParams.yid+'/'+$stateParams.dong+'/'+$stateParams.ho).then(function(response) {
            console.log(response);
            //$scope.totalItems = response.data.recordsTotal;
            //$scope.currentPage = $scope.sform.page;
            
            $scope.item= response.data;
            //$scope.item.pwd=$scope.item.pwd.substring(1);
            //console.log($scope.item.pwd);
            
        }, function(x) {
            console.log(x);
        });
	}
	load();
	
  $scope.doItemUpdate=function(){
      $http.put('/buyer/House',$scope.item).then(function(rs){
        //console.log(rs);
        toastr.success('성공적으로 등록하였습니다.');
        load();
        //$scope.doSearch();
        
    },function(err){
        toastr.success('실패하였습니다.');
        console.log(err);
        ERROR($state,err);
    });
	  
  }
  $scope.formSubmit=function(item){
    try{
        parseInt($scope.item.pwd);
        if($scope.item.pwd.length!=4){
            alert('패스워드 4자리 숫자를 입력해주세요');
            return;
        }
        $scope.item.pwd='0'+$scope.item.pwd;
        $scope.doItemUpdate();
    }catch(x){
        alert('패스워드 4자리 숫자를 입력해주세요');
    }
    
 };
  
	
});


