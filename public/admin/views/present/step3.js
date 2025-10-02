angular.module('inspinia',['ngResource',[
	//'../routertest/bower_components/ocModal/dist/css/ocModal.animations.css',
	//'../routertest/bower_components/ocModal/dist/css/ocModal.light.css',
	//'../routertest/bower_components/ocModal/dist/ocModal.js',
	//'../js/plugins/jasny/jasny-bootstrap.min.js',          
	//'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/css/bootstrap-datepicker3.css',
	//'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/js/bootstrap-datepicker.min.js',
	//'/bower_components/bootstrap-player/js/bootstrap-player.js',
	  //'/bower_components/bootstrap-player/css/bootstrap-player.css',
	]])
.controller('Step3Ctrl', function($scope,$http,CodeTbl,$timeout) {

	if(!$scope.item.goods){
		$state.go('present.gift.step1.cate',{cate:'0300'});
		return;
	}
	if(!$scope.messageList){
		CodeTbl.query({gCode:'message'},function(res){
			$scope.messageList=res;
		})
	}
	
	if(!$scope.item.message){
		$scope.item.message={msgType:'B'};
	}
	$scope.onMessage=function(msg){
		$scope.item.message.content=msg.description;
	}
	$('input[name="intervaltype"]').click(function (event) {
	    $(this).tab('show');
	});
	$('input#textArea').tab('show');
	$scope.initUpload=function(){
		  $('#fileupload').fileupload({
			  	add: function(e, data) {
	                var uploadErrors = [];
	                var acceptFileTypes = /(\.|\/)(mp3)$/i;
	                //console.log(data);
	                console.log(acceptFileTypes.test(data.originalFiles[0]['type']));
	                if(data.originalFiles[0]['type'].length && !acceptFileTypes.test(data.originalFiles[0]['type'])) {
	                    uploadErrors.push('mp3 파일을 선택해주세요.');
	                }
	                if(data.originalFiles[0]['size'].length && data.originalFiles[0]['size'] > 5000000) {
	                    uploadErrors.push('파일사이즈가 너무 큽니다.');
	                }
	                if(uploadErrors.length > 0) {
	                    alert(uploadErrors.join("\n"));
	                } else {
	                    data.submit();
	                }
			  	},
			    url: '/upload',
		        dataType: 'json',
		        //autoUpload:true,
		        //acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
		        //formData:{service:22},
		        
		        done: function (e, data) {
		        	//console.log(data.result);
		        	var file = data.result;
		        	$scope.item.message.file = file;
		        	console.log($scope.item.message.file);
	                $scope.$apply();
	                
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
	
		$timeout(function(){
			$( ".steps>ul>li" ).removeClass("current");
			$( ".steps>ul>li:nth-child(3)" ).addClass("current");
		 	
		});
		
		
});



