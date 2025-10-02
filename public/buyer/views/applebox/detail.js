angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
						'/css/upload.css',
		               '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
					   '/bower_components/upload/vendor/jquery.ui.widget.js',
		               '/bower_components/upload/jquery.iframe-transport.js',
		               '/bower_components/upload/jquery.fileupload.js',
		               'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/css/bootstrap-datepicker3.css',
		               'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/js/bootstrap-datepicker.min.js',
		               '/bower_components/sweetalert/dist/sweetalert.css',
		               '/bower_components/sweetalert/dist/sweetalert.min.js',
		               '/bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
			           '/bower_components/magnific-popup/dist/magnific-popup.css',
					   '/bower_components/angucomplete-alt/angucomplete-alt.css',
					   '/bower_components/angucomplete-alt/angucomplete-alt.js'
			           ],cache:true,serie: true}])
.controller('AppleboxDetailCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Applebox,Buyer,Member,$resource,$state) {
  
  //$scope.buyer={'companyName':'sdfsdf'}


  
  $scope.templateChange=function(){
      //console.log($scope.selectedTemplate);
      $scope.loadData();
  }
  $scope.loadData=function(){
	  $http.get('/admin/resources/'+$scope.selectedTemplate).then(function(rs){
          $scope.templates=JSON.stringify(rs.data, undefined, 4);
      });
	  
  }
  
  
  $scope.doRegister=function(){ // 수정하기 
	 //console.log('dddd');

	 
		if($scope.buyer) {

			$scope.item.buyerSq = $scope.buyer.buyerSq;
			Applebox.save($scope.item,function(res){


				toastr.success('성공적으로 입력하였습니다!!!');
					
			},function(err){
				ERROR($state,err);
			});
		}else{
			toastr.success('구매자를 선택해주세요.');
		}
	 
  }
  
   $scope.formSubmit=function(){
       if($scope.buyer) {
           try {

                var content = JSON.parse($scope.templates);
                //console.log(content);
                content.applebox.buyerSq = $scope.buyer.buyerSq;
                $http.post('/v1/AppleboxAll', content).then(function(res){
                    toastr.success('성공적으로 등록하였습니다.');
                    //$state.go('applebox.list',$scope.sform);
                    $location.path('/applebox/list');
                },function(err){
                    console.log(err);
                    toastr.error("error"+err);
                });
                //$scope.doRegister(item)
           }catch(E){
               toastr.error('데이타가 잘못입력되었습니다.');
           }
       }else{
           toastr.error('구매자를 선택해주세요.');
       }
		 
	 }
 
});

