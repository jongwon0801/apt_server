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
					   '/bower_components/angucomplete-alt/angucomplete-alt.js',
						 '/shared/controller/modal.addr.new.js'
			           ],cache:true,serie: true}])
.controller('AppleboxEditCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Applebox,Buyer,Member,$resource,$state) {
  

$scope.addrOpen=function(){
		//console.log('openmodal');
		$modal.open({
			animation:true,
			templateUrl: "/shared/views/modal.addr.new.html",
			//backdrop: false,
			//windowClass: 'right fade',
			//keyboard: true,
			controller: 'ModalAddrNewCtrl',
			resolve: {
				item: function () {
					return {};
					}
				}
			}).result.then(function (selectedItem) {

				console.log(selectedItem);
				console.log($scope.item.addr);
				$scope.item.addr=$scope.item.addr||{};
				

				$scope.item.addr.zipNo=selectedItem.zipNo;
				$scope.item.addr.roadAddrPart1=selectedItem.roadAddrPart1;
				$scope.item.addr.roadAddrPart2=selectedItem.roadAddrPart2;
				
				//$scope.item.addr.roadAddr=selectedItem.roadAddr;
			}, function () {
				//$log.info('Modal dismissed at: ' + new Date());
			});
		
	} 
	
  //$scope.buyer={'companyName':'sdfsdf'}
  $scope.loadData=function(){
	  
	  if($stateParams.yid){
			$q.all([Applebox.get($stateParams).$promise,MyCache.loadGCode(['applebox.status','yn'])]).then(function(results){
				$scope.item=results[0];
				
				Buyer.get({buyerSq:results[0].buyerSq},function(rs){
					//console.log(rs);
					$scope.buyer = rs;
					//$scope.bleName=getBleName($stateParams.yid);
				},function(err){

				});
			},function(err){
				ERROR($state,err);
			});
	  }else{
			$q.all([MyCache.loadGCode(['applelbox.status','yn'])]).then(function(results){
			
			},function(err){
				ERROR($state,err);
			});
	  }
  }
  $scope.loadData();
  
  $scope.formSubmit=function(){ // 수정하기 
	 //console.log('dddd');

	 if($scope.item.yid){
		Applebox.update($scope.item,function(res){

				
			toastr.success('성공적으로 수정하였습니다!!!');

			$location.path('/applebox/list');
				
		},function(err){
			ERROR($state,err);
		});
	 }else{
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
  }
  $scope.initUpload=function(){

	  //console.log(1111);
	  $('#fileupload').fileupload({
	        url: '/upload',
	        dataType: 'json',
	        //autoUpload:true,
	        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
	        
	        done: function (e, data) {
	        	//console.log(data.result);
	        	var file = data.result;
	        	//$scope.item.thumbnail = file.thumbnailUrl;
	        	$scope.item.thumbnail = file;
                $scope.$apply();
                procImage();
	            /*$.each(data.result.files, function (index, file) {
	            	$scope.item.thumbnail = file.thumbnailUrl;
	                $scope.$apply();
	                
	            });*/
	        },
	        progressall: function (e, data) {
	            /*var progress = parseInt(data.loaded / data.total * 100, 10);
	            $('#progress .progress-bar').css(
	                'width',
	                progress + '%'
	            );*/
	        }
	   });
    }	
 function procImage (){
	  $('.image-popup-no-margins').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			closeBtnInside: false,
			fixedContentPos: true,
			mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
			image: {
				verticalFit: true
			},
			zoom: {
				enabled: true,
				duration: 300 // don't foget to change the duration also in CSS
			}
		});

  }
}).directive('ngAutocomplete', function($parse) {
    return {

      scope: {
        details: '=',
        ngAutocomplete: '=',
        options: '='
      },

      link: function(scope, element, attrs, model) {

        //options for autocomplete
        var opts

        //convert options provided to opts
        var initOpts = function() {
          opts = {}
          if (scope.options) {
            if (scope.options.types) {
              opts.types = []
              opts.types.push(scope.options.types)
            }
            if (scope.options.bounds) {
              opts.bounds = scope.options.bounds
            }
            if (scope.options.country) {
              opts.componentRestrictions = {
                country: scope.options.country
              }
            }
          }
        }
        initOpts()

        //create new autocomplete
        //reinitializes on every change of the options provided
        var newAutocomplete = function() {
          scope.gPlace = new google.maps.places.Autocomplete(element[0], opts);
          google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
            scope.$apply(function() {
//              if (scope.details) {
                scope.details = scope.gPlace.getPlace();
//              }
              scope.ngAutocomplete = element.val();
            });
          })
        }
        newAutocomplete()

        //watch options provided to directive
        scope.watchOptions = function () {
          return scope.options
        };
        scope.$watch(scope.watchOptions, function () {
          initOpts()
          newAutocomplete()
          element[0].value = '';
          scope.ngAutocomplete = element.val();
        }, true);
      }
    };
  }).controller('ModalAddrNewCtrl', function($scope,$http,$ocModal,$init) {
	
	 $scope.goSearch= function(){
		  $http.get('/v1/addr_new', {
		        params:  {query: $scope.query},
		    }
		)
		.then(function(response) {
			//console.log(response.data)
		}, function(x) {
		    
		})
		return false;
	  };
	  
	  $scope.close=function(idx,item){
		$ocModal.close('addr_search', idx, item);
	  }
});

