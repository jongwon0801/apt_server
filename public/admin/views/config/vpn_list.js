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
					   '/shared/controller/modal.addr.new.js'
			           ],cache:true,serie: true}])
.controller('VpnCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,$resource,$state,Vip) {
	//https://github.com/networkengineeryong/Softether-VPN-With-Dnsmasq
	// 라우팅 확인 
    //{'라즈베리 보관함':'172.16.2.2 ~ 172.16.2.254'},
    //{'서버 보관함':'172.16.3.2 ~ 172.16.3.254'}]
	// 고정 아이피 세팅 type=static|dynamic|info sip=125.209.200.159 [ip=192.168.0.1] [gip=192.168.0.1] [dns=8.8.8.8]
	// vpnclient.service 서비스 등록여부 확인하여 고정아이피 바꿔준다.
	/*
	1. vpn 아이피 설정 
	#sudo vi /lib/systemd/system/vpnclient.service
	ExecStartPost=/usr/sbin/ifconfig vpn_soft 172.16.3.4 netmask 255.255.0.0
	
	#sudo systemctl daemon-reload

	2. 마스쿼레이션 
	
	밖으로 나가는 닉 디바이스명을 찾는다(인터넷이 연결될선)
	#sudo ifconfig 

	닉디바이스명을 발체하여 다음과 같은 명령어를 입력 
	#sudo firewall-cmd --permanent --direct --add-rule ipv4 nat POSTROUTING 0 -o [닉디아비스명] -j MASQUERADE
	#sudo firewall-cmd --reload


	sudo firewall-cmd --permanent --direct --add-rule ipv4 nat POSTROUTING 0 -o eno1 -j MASQUERADE

			

	#sudo reboot
	*/
	$scope.list=[
        {name:'부산 피아크',ip:'172.16.2.2', usage:'라즈베리'},
        {name:'회사테스트1',ip:'172.16.2.250', usage:'라즈베리'},
        {name:'남양주 푸르지오',ip:'172.16.3.2', usage:'모니터링서버'},
		{name:'인천 경서',ip:'172.16.3.3', usage:'모니터링서버'},
		{name:'인첨검단',ip:'172.16.3.4', usage:'모니터링서버'},
		{name:'상주',ip:'172.16.3.5', usage:'모니터링서버'},

        {name:'회사테스트1',ip:'172.16.3.250', usage:'서버'},
		{name:'광주송정동',ip:'220.93.211.232', usage:'서버'},
		
    ];

	$scope.maxSize=5;
    $scope.display = 10;
	$scope.sform=$location.search();
	$scope.sform.page=$scope.sform.page ||1
	//$scope.sform.memberType=$scope.sform.memberType ||''
	//$scope.sform.status=$scope.sform.status ||''
	//$scope.sform.request_time = $scope.sform.request_time || moment().format('YYYY-MM-DD')
	$scope.sform.display=$scope.display;
	
	
	//페이지이동
	$scope.pageChanged = function(p) {

		console.log($scope.sform);
		$scope.sform.page=p;
		$state.go('config.vpnlist',$scope.sform); 
    };

	
	
	// 초기 데이타로드 
	$scope.doSearch=function(){
		
		$q.all([Vip.query($scope.sform).$promise,$scope.myCache.loadGCode(['uds.status'])]).then(function(results){
			  $scope.totalItems = results[0].recordsTotal;
			  $scope.list=results[0].data;
			  //console.log($scope.list);
			  $scope.currentPage = $scope.sform.page;
			  //MyCache.patch($scope.list,results[1]);
			  
		});
	}
	
	//검색버튼 눌렀을
	$scope.formSubmit=function(){
		$scope.sform.page='';
		$state.go('config.vpnlist',$scope.sform);
		
	}
	
	$scope.doSearch(); 
	

		
	
});
/*

다산진건 관련 내용
1. 카드 단말기 안되는 거는 별도 조항으로 빼서 1날 이내에 해주는걸로
2. 보관함에 사용자 가이드 스티커 부착 작업
3. 관리자 메뉴얼, 고정 패스워드 목록 넘겨줘야 함
4. 관리자에게 기능 설명 해줘야함

위 내용을 가지고 pb 글로벌 과 협의해야함
*/


