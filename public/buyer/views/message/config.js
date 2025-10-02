
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
		[{files:[//'/bower_components/moment/min/moment.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
		  //'/bower_components/ocModal/dist/css/ocModal.light.css',
		  //'/bower_components/ocModal/dist/ocModal.js',
          //'views/seller/view.js'
		         '/bower_components/summernote/dist/summernote.css',
		           '/bower_components/summernote/dist/summernote.min.js',
		           '/bower_components/angular-summernote/dist/angular-summernote.min.js',
		           '/bower_components/summernote/dist/lang/summernote-ko-KR.js'
		  ],cache:true,serie: true}])
  .controller('ListCtrl', function($rootScope,$scope,$http,$location,$filter,$q,CodeTbl,$stateParams,$state,$modal,$resource) {
	
	$scope.loadData=function(){
		$resource('/v1/CodeTbl/:gCode', { gCode: '@gCode'},{
			query: { method:'GET', cache: false, isArray:true }
		}).query({gCode:'config.msg'},function(res){
			
			//console.log(res);
			$scope.list=res; 
		},function(err){
			ERROR($state,err);
		});
	}
	$scope.loadData();
	
	$scope.saveData = function(item){
		CodeTbl.update(item,function(res){
			toastr.success('수정하였습니다.');
		},function(err){
			
		})
	}
	$scope.onView=function(item){
			
		$modal.open({
			animation:true,
	        templateUrl: "views/message/modal.config.html",
	        //backdrop: false,
	        //windowClass: 'right fade',
	        //keyboard: true,
	        controller: 'EditCtrl',
	        resolve: {
	            item: function () {
	                return item;
	            	}
	        	}
	     }).result.then(function (selectedItem) {
	         //console.log(selectedItem);
	    	 $scope.saveData(selectedItem);
	     }, function () {
	    	 //$log.info('Modal dismissed at: ' + new Date());
	     });
		
	} 
	
}).controller('EditCtrl',function($scope,$modalInstance,item){
		$scope.item=item;
		$scope.ok = function () {
			$modalInstance.close($scope.item);
		}
		$scope.close = function () {
		    $modalInstance.dismiss('cancel');
		};
	
	 
}).factory('CodeTbl',function($resource){
  	
  	return $resource('/admin/CodeTbl/:gCode/:key', { gCode: '@gCode',key:'@key' }, {
  		update:{ method:'PUT'},
  		query: { method:'GET', cache: false, isArray:true }
  	});
  })


	