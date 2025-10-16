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
  $scope.$watch(
            "item.subject",
            function( newValue, oldValue ){
            	//$scope.selectedRegion=[];
            	//console.log(newValue,oldValue);
				if(newValue=='A'){ // 택배기사 
					$scope.issueList=[];
					$q.all([Buyer.query({status:'A'}).$promise]).then(function(results){
						//$scope.item=results[0];
						for (var key in results[0].data) {
							var d = results[0].data[key];
							$scope.issueList.push({key:d.buyerSq,name:d.companyName});
						}
					},function(err){
						ERROR($state,err);
					});
				}else if(newValue=='B'){ //세탁소 
					$scope.issueList=[];
					$q.all([Shop.query({kind:'A'}).$promise]).then(function(results){
						//$scope.item=results[0];
						for (var key in results[0].data) {
							var d = results[0].data[key];
							$scope.issueList.push({key:d.shopSq,name:d.companyName});
						}
					},function(err){
						ERROR($state,err);
					});
				}else if(newValue=='C'){ // 슈퍼 
					$scope.issueList=[];
					$q.all([Shop.query({kind:'B'}).$promise]).then(function(results){
						//$scope.item=results[0];
						for (var key in results[0].data) {
							var d = results[0].data[key];
							$scope.issueList.push({key:d.shopSq,name:d.companyName});
						}
					},function(err){
						ERROR($state,err);
					});
				}
					//$q.all([MyCache.loadGCode(['goods.cate.'+newValue])]).then(function(results){
					//	$scope.category2List =MyCache.get('goods.cate.'+newValue);
					//});
				//}
            }
    );

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

