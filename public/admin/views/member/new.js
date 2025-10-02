angular.module('inspinia',
		[[//'/bower_components/bootstrap-select/bootstrap-select.min.css',
		  //'/bower_components/bootstrap-select/bootstrap-select.min.js',
		  //'/bower_components/angular-bootstrap-select/build/angular-bootstrap-select.min.js'
		]])
    .controller('NewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Member,$stateParams,$timeout,$window) {
  
 // $scope.myCache=MyCache;
  $scope.myCache.loadGCode(['member.status','member.memberType','member.media']);
  $scope.item={memberType:'A',status:'A',media:'A'};
  
  $scope.formSubmit=function(){
	  Member.save($scope.item,function(res){
				$location.path('/member/list');
				toastr.success('성공!!!');
			
		},function(err){
			ERROR($state,err);
		});
  };
			 
	
}).directive('validPasswordC', function () {
	    return {
	        require: 'ngModel',
	        link: function (scope, elm, attrs, ctrl) {
	            ctrl.$parsers.unshift(function (viewValue, $scope) {
	                var noMatch = viewValue != scope.myForm.password.$viewValue
	                ctrl.$setValidity('noMatch', !noMatch)
	            })
	        }
	    }
});



