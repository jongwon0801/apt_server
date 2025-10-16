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
					   '/shared/controller/modal.addr.js'
			           ],cache:true,serie: true}])
.controller('RfidEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Rfid,$resource,$state,Shop,Buyer) {
  
  $scope.item={};
  
  $scope.loadData=function(){
	  
	  if($stateParams.tagid){
			$q.all([Rfid.get($stateParams).$promise,MyCache.loadGCode(['rfid.status','rfid.subject'])]).then(function(results){
				$scope.item=results[0];
			},function(err){
				ERROR($state,err);
			});
	  }else{
		  	$scope.item={subject:'A',status:'B'};
			$q.all([MyCache.loadGCode(['rfid.status','rfid.subject'])]).then(function(results){
			
			},function(err){
				ERROR($state,err);
			});
	  }
  }
  $scope.loadData();
  $scope.issueList=[];
  
  $scope.doDelete=function(item){
	if($stateParams.tagid){
		Rfid.delete(item,function(res){
			toastr.success('성공적으로 삭제하였습니다!!!');
			$state.go('rfid.list'); 
		},function(err){
			ERROR($state,err);
		});
	 }

  }
  $scope.formSubmit=function(){ // 수정하기 
	 //console.log('dddd');

	 if($stateParams.tagid){
		Rfid.update($scope.item,function(res){
			toastr.success('성공적으로 수정하였습니다!!!');
		},function(err){
			ERROR($state,err);
		});
	 }else{
		Rfid.save($scope.item,function(res){
			toastr.success('성공적으로 입력하였습니다!!!');
				$location.path('/rfid/list');
		},function(err){
			ERROR($state,err);
		});
	 }
  }
  

});

