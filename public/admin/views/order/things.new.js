angular.module('inspinia',
		[{files:['/bower_components/moment/min/moment.min.js',
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
					   '/shared/controller/modal.addr.new.js',
					   //'/plugin/dropzone/dropzone.js',
		  			   //'/plugin/dropzone/dropzone.css'
			           ],cache:true,serie: true}])
.controller('OrderThingsNewCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,Things,$resource,$state) {
	
   /*
   public static String getUniqueKey(){
        return getDateString("yyMMddHHmmssSSS")+getRandomNumber(2,10);
    }*/

    //YYMMDDHHmmssSSS
    // var rnum = Math.floor(Math.random() * 100) 
    //if rnum<10 rnum = "0"+rnum;

    var thingsSq = moment().format('YYMMDDHHmmssSSS');
    var rnum = Math.floor(Math.random() * 100) ;
    if(rnum<10 ) thingsSq +="0"+rnum;
    else thingsSq+=rnum;

    console.log(thingsSq);
    $scope.item={thingsSq:thingsSq,shopSq:1,things:{upper_cnt:0,down_cnt:0,etc_cnt:0},status:'C'};
    console.log($scope.item);
    //console.log($scope.item());

    $q.all([MyCache.loadGCode(['order.status.B'])]).then(function(results){
            
    },function(err){
        ERROR($state,err);
    });  
  $scope.formSubmit=function(){ // 수정하기 
	 //console.log('dddd');

	 
		Things.save($scope.item,function(res){
			toastr.success('성공적으로 입력하였습니다!!!');
				$location.path('/order/thingslist');
				
		},function(err){
			ERROR($state,err);
		});
	 
  }
  

});

