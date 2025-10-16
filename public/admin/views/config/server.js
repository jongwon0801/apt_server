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
.controller('ConfigServerCtrl', function($rootScope,$scope,$http,$location,$filter,$q,$stateParams,$timeout,$window,$modal,MyCache,$resource,$state) {
  
	$scope.iplist=[
		{'서버 보관함':'172.16.2.2 ~ 172.16.2.254'},
		{'라즈베리 보관함':'172.16.3.2 ~ 172.16.3.254'}]
	$scope.list=[
        {name:'쌍암동 110동', ip:'220.95.39.13',os:'centos6', boxip:'10.101.253.150', wikibox:{ip:'10.110.0.13',mask:'255.255.0.0.',router:'10.110.0.1'}},
        {name:'쌍암동 메인동', ip:'119.200.186.168',os:'centos6', wikibox:{ip:'10.동.0.13',mask:'255.255.0.0.',router:'10.동.0.1'}},
        {name:'동원 사상구 로얄듀크', ip:'121.145.11.226',os:'centos6', wikibox:{ip:'10.동(101~106).253.150',mask:'2255.255.0.0',router:'10.동(101~106).0.254'}},
		{name:'동원 동탄 로얄듀크', ip:'121.137.76.130',os:'centos7'},
		{name:'대구 서한 포레스트 (101,102)', ip:'221.166.134.7',os:'centos7',wikibox:{ip:'10.동(101~102).0.160',mask:'2255.255.0.0',router:'10.동(101~102).0.1'}},
		{name:'대구 서한 포레스트 (201)', id:'60001',ip:'220.88.226.204, 221.166.134.103',os:'centos7',wikibox:{ip:'10.201.0.160',mask:'2255.255.0.0',router:'10.201.0.1'}},
		{name:'부산 가양 동부 세트레빌', ip:'211.184.150.33',os:'centos7',wikibox:{ip:'10.동.1.160',mask:'2255.255.0.0',router:'10.201.0.1'}},
		{name:'전주 혁신도시 아파트(101,102,103)', ip:'211.184.150.33', iip:'10.254.254.7', os:'centos7',wikibox:{ip:'10.동.254.1',mask:'2255.255.0.0',router:'10.동.254.254'}},
		{name:'전주 혁신도시 오피스텔(201,202,203)', ip:'211.184.150.33',iip:'10.254.254.7', os:'centos7',wikibox:{ip:'10.동.254.1',mask:'2255.255.0.0',router:'10.동.254.254'}},
		{name:'담양1', ip:'211.184.150.33',iip:'10.254.254.7', os:'centos7',wikibox:{ip:'10.동.254.1',mask:'2255.255.0.0',router:'10.동.254.254'}},
		{name:'담양2', ip:'211.184.150.33',iip:'10.254.254.7', os:'centos7',wikibox:{ip:'10.동.254.1',mask:'2255.255.0.0',router:'10.동.254.254'}},
		{name:'광주 주월동 양우내안에(60009)', ip:'1.227.42.236',iip:'10.254.254.7', os:'centos7',wikibox:{ip:'10.동.254.1',mask:'2255.255.0.0',router:'10.동.254.254'}},
		{name:'광주 송정동 아델리움', ip:'~~~',iip:'10.254.254.7', os:'centos7',wikibox:{ip:'10.동.254.1',mask:'2255.255.0.0',router:'10.동.254.254'}},
		{name:'익산 오투그란데', ip:'~~~',iip:'10.254.254.7', os:'centos7',wikibox:{ip:'10.동.254.1',mask:'2255.255.0.0',router:'10.동.254.254'}},


    ];
	
  
});

