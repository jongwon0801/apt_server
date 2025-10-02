
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('PresentGiftModule',[
                              {files:[
    '/bower_components/jquery-validation/dist/jquery.validate.min.js',
    '/bower_components/jquery.steps/build/jquery.steps.min.js',
    '/bower_components/jquery.steps/demo/css/jquery.steps.css',
	//'/bower_components/sweetalert/dist/sweetalert.css',
	//'/bower_components/sweetalert/dist/sweetalert.min.js',
	'/css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
	'/css/upload.css',
    '/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
    '/bower_components/upload/vendor/jquery.ui.widget.js',
	  '/bower_components/upload/jquery.iframe-transport.js',
	  '/bower_components/upload/jquery.fileupload.js'
	  //'/bower_components/bootstrap-player/js/bootstrap-player.js',
	  //'/bower_components/bootstrap-player/css/bootstrap-player.css',
	  //'/bower_components/bootstrap-nav-wizard/bootstrap-nav-wizard.min.css',
	
	],cache:true,serie: true}])
	.controller('GiftCtrl', function($scope,$http,$location,$state,Goods,Customer,$resource,$timeout,$modal,Seller,$q,MyCache,$window,$stateParams) {
        
		$scope.myCache = MyCache;
		$window.complete = function(){
			if(DAOUPAY) DAOUPAY.close();
			$state.go('present.list');
		}
		/*$scope.menuList = [
		                   {cate:'00',name:'기념일',category:['0006']},
		                   {cate:'01',name:'이벤트',category:['0100','0101','0102','0103']},
		                   {cate:'02',name:'개업/이전',category:['0400','0401','0402']},
		                   {cate:'03',name:'승진/취업',category:['0400','0401','0402']},
		                   {cate:'04',name:'결혼식/출산',category:['0301','0303']},
		                   {cate:'05',name:'장례식',category:['0302']},
		                   ];*/
		/*$scope.menuList = [
		                   {cate:'0300',name:'근조화환',category:['0006']},
		                   {cate:'0301',name:'축하화환',category:['0100','0101','0102','0103']},
		                   {cate:'0302',name:'근조화환',category:['0400','0401','0402']},
		                   {cate:'0303',name:'축하화환',category:['0400','0401','0402']},
		                   ];*/
		                  
		//$state.go('present.gift.step1.cate',{cate:'00'});
		$scope.item={userList:[],cnt:1,shipping:{regDate:new Date()}};
        
        //console.log(">"+ $stateParams);
		
		$scope.goStep2=function(item){ //배송선물/구매선물//양도선물
			
            //console.log($scope.item);
			$scope.item.goods = item; // 상품
			
			
			
			//console.log(item);
			if(item.kind=='B' || item.productType=='A') { //일반상품
				$state.go('present.gift.step2');
			}else if(item.productType=='B') { //케익
				$state.go('present.gift.optcake');
			}else{ //flower
				$state.go('present.gift.optflower.example',{id:'01'});	
			}
			
		}
		
		
		/*
		$scope.goStep3=function(item){
			
			$scope.calNum();
			
			if($scope.checkedNum==0){
				alert('선물 보낼 대상을 추가해주세요.');
			}else{
				$state.go('present.gift.step3');
			}
			
		}
		$scope.goStep4=function(){
			if(item.message.msgType=='B'){ //텍스트
			
			}else if(item.message.msgType=='C'){ // 음성 
				
				
			}
			$state.go('present.gift.step4');
			
		}*/
		$('#top_menu').on('click',function(e){
			event.preventDefault();
		})
		//console.log($state.is('present.gift.step2'));
		
		console.log($( ".steps>ul>li" ));
		//$( ".steps>ul>li" ).removeClass("current")
		$scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			
			//console.log(toState);
			//event.preventDefault();
			//상품체크
			//console.log(toState.name);
			/*
			$( ".steps>ul>li" ).removeClass("current")
			
			
			
			
			if(toState.name=='present.gift.step1' || toState.name=='present.gift.optflower' || toState.name=='present.gift.optcake'){
				//$( ".steps>ul>li:nth-child(2)" ).addClass("current");
				console.log(111);
				$( ".steps>ul>li:nth-child(1)" ).addClass("current");
			}else if(toState.name=='present.gift.step2'){
				//$($( ".steps>ul>li" )[1]).addClass("current");
				$( ".steps>ul>li:nth-child(2)" ).addClass("current");
			}else if(toState.name=='present.gift.step3'){
				//$($( ".steps>ul>li" )[2]).addClass("current");
				$( ".steps>ul>li:nth-child(3)" ).addClass("current");
			}else if(toState.name=='present.gift.step4'){
				//$($( ".steps>ul>li" )[3]).addClass("current");
				$( ".steps>ul>li:nth-child(4)" ).addClass("current");
			}*/
			//console.log($('.steps>ul>li'));
			//console.log($('.steps>ul>li').css);	
			if(toState.name=='present.gift.step2'){
				//$( ".steps>ul>li" ).get(1).addClass("current")
				//$scope.goStep2();
				//goStep2()
				/*if(!$scope.item.title){
					event.preventDefault();
					swal("입력오류!", "제목을 입력해주세요.", "success");
				}else if(!$scope.item.goods){
					event.preventDefault();
					swal("입력오류!", "상품을 선택해주세요.", "success");
				}*/
			}else if(toState.name=='present.gift.step3'){
				//$scope.goStep3();
				//event.preventDefault();
				/*if(!$scope.item.title){
					event.preventDefault();
					swal("입력오류!", "제목을 입력해주세요.", "error");
				}*/
				/*$scope.calNum();
				
				if($scope.checkedNum==0){
					event.preventDefault();
					toastr.error('선물 보낼 대상을 추가해주세요.');
					
				}else{
					if($scope.item.gubun=='A'){
						if($scope.checkedNum!=1){
							event.preventDefault();
							toastr.error('1명만 선택해야 합니다.');
						}
					}
				}*/
				//$( ".steps>ul>li" ).get(2).addClass("current")
				
				
			}else if(toState.name=='present.gift.step4'){
				//$( ".steps>ul>li" ).get(3).addClass("current")
				//console.log($scope.item.message);
				if($scope.item.message.msgType=='B'){
					if(!$scope.item.message.content){
						event.preventDefault();
						//console.log(111);
						toastr.error('메세지를 입력해주세요.');
					}
				}else if($scope.item.message.msgType=='C'){
					if(!$scope.item.message.file){
						event.preventDefault();
						toastr.error('mp3 파일을 첨부해주세요.');
					}
				}
			}else if(toState.name=='present.gift.pay'){
				//$( ".steps>ul>li" ).get(3).addClass("current")
			}else{
				//$( ".steps>ul>li" ).get(0).addClass("current")
				//event.preventDefault();
			}
			
			//console.log(toState);
				
			
		});
		
		
	  
		
	  
	  $scope.tryOrder=function(){ // 충전하기
		  
		  //var userList=[];
		  
		  //console.log($scope.item);
			  	
		  //if(true) return; 
		  var data = {orderType:($scope.item.gubun=='A'?'A':'C')}; // 구매 선물
		  //data.title = $scope.item.title;
		  data.goods = $scope.item.goods;
		  //if($scope.item.package) data.goods.option.info.package = $scope.item.package;
		  data.userList = $scope.item.userList;
		  data.message = $scope.item.message;
		  data.pay= $scope.item.pay;
		  data.title=$scope.item.title;
		  data.cnt = $scope.item.cnt | 1;
		  
		  data.payYn = 'N';//
		 // data.cnt = 1;
		  if(data.orderType=='A'){
			  data.shipping=$scope.item.shipping;
		  
		  }
		  //data.shipping.to = $scope.item.userList[0];
		  console.log(data);
		  
		  //if(true)return;
		  if(data.payYn=='Y' && data.pay.fillPrice>0)
			  if($scope.item.pay.method=='hp'){
				  DAOUPAY = $window.open("about:blank", "DAOUPAY", "width=468,height=750");
			  }else{
				  
				  DAOUPAY = $window.open("about:blank", "DAOUPAY", "width=579,height=527");
			  }
		  $resource('/billing/Order').save(data,function(res){
			  //toastr.success('보냈습니다.');
			  
			  //console.log(res);
			  if(data.payYn=='N' || data.pay.fillPrice==0) {
				  $resource('/billing/result').get(res.data,function(res){
					  //toastr.success('성공적으로 선물으 보냈습니다.');
					  //swal("삭제!", "성공적으로 삭제되었습니다.", "success");
					  /*swal({ 
						  title: "선물보내기",
						   text: "성공적으로 선물을 보냈습니다.",
						    type: "success" 
						  },
						  function(){
						    //window.location.href = 'login.html';
							  $state.go('present.list');
					  });*/
                      alert('성공적으로 선물을 보냈습니다.');
                      $state.go('present.list');
					  
				  },function(err){
					  ERROR($state,err);
				  })
			  }else{
				  goDaou(res.data);
				  //console.log(res.data);
			  }	  
			  
		  },function(err){
			  ERROR($state,err);
		  })
		  
	}
	var DAOUPAY;
	function goDaou(params){
		

		//DAOUPAY.focus();
		
		if($scope.item.pay.method=='hp'){
			
			var newForm = $('<form>', {
		        'action': 'http://ssltest.daoupay.com/2.0/mobile/DaouMobileMng.jsp',
		        'target': 'DAOUPAY', method:'post','accept-charset':"EUC-KR"
		    });
			$.each(params,function(n,p){
				newForm.append($('<input>',{
					name:n,value:p,type:'hidden'
				}));
				
			});
		}else{
			
			var newForm = $('<form>', {
		        'action': 'https://ssltest.daoupay.com/card/DaouCardMng.jsp',
		        'target': 'DAOUPAY', method:'post','accept-charset':'EUC-KR'
		    });
			$.each(params,function(n,p){
				newForm.append($('<input>',{
					name:n,value:''+p+'',type:'hidden'
				}));
				
				
			});
			document.charset="euc-kr";
		}
		/*newForm.append($('<input>',{
			value:'제출',type:'submit'
		}));*/
		

		

		//pf.target = "DAOUPAY";

		//pf.action = fileName;

		//pf.method = "post";

		//pf.submit();
		newForm.appendTo('body').submit();
	  //  newForm.submit();
	}
	$scope.changeShippingPrice=function(){
 		$scope.item.shipping.shippingPrice =$scope.getShippingPrice();
 	}
	$scope.getShippingPrice=function(){
		//if($scope.item.method=='phone') return 0;
		
		//console.log(1111,$scope.item.shipping);
		if($scope.item.goods.kind=='B'){ //쿠폰 
			return 0;
		}else{
		
			if($scope.item.seller.shipping.kind=='A'){
				return $scope.item.seller.shipping.price.shippingPrice;
				//무료
			}else{ //지역별가격
				//console.log($scope.item.shipping);
				//if(!$scope.item.shipping) return 0;
				if($scope.item.shipping.region){
					return $scope.item.shipping.region.price;
				}
				return 0;
			}
		}
	}
	 

}).config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
  
}]).run(function() {
	
}).factory('Order',function($resource){
	return $resource('/customer/Order/:orderSq', {orderSq: '@orderSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
	
}).factory('Gift',function($resource){
	return $resource('/customer/Gift/:giftSq', { giftSq: '@giftSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});

}).factory('Customer',function($resource){
	return $resource('/admin/Customer/:customerSq', { customerSq: '@customerSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('GiftEvent',function($resource){
	return $resource('/customer/GiftEvent/:goodsSq', { goodsSq: '@goodsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('CodeTbl',function($resource){
	return $resource('/admin/CodeTbl/:gCode', { gCode: '@gCode' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:true }
	});
}).factory('Goods',function($resource){
	return $resource('/v1/Goods/:goodsSq', { goodsSq: '@goodsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});
}).factory('Member',function($resource){
	return $resource('/customer/Member/:memberSq', { memberSq: '@memberSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:false }
	});	
}).factory('Seller',function($resource){ 
	return $resource('/v1/Seller/:goodsSq', { goodsSq: '@goodsSq' }, {
		update:{ method:'PUT'},
		query: { method:'GET', cache: false, isArray:true }
	});
  
});

	