'use strict';

angular.module('inspinia',
		[{files:[//'/bower_components/jquery.steps/build/jquery.steps.min.js',
		  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
		//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
		  //'/css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
		  //'/css/upload.css',
		  //'/plugin/dropzone/dropzone.js',
		  //'/css/plugins/dropzone/basic.css',
		  //'/plugin/dropzone/dropzone.css',
		  //'http://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js',
		  //'//rawgit.com/enyo/dropzone/master/dist/dropzone.js',
//		  '//rawgit.com/enyo/dropzone/master/dist/dropzone.css',
		  //'//rawgit.com/enyo/dropzone/master/dist/basic.css',

		  ],cache:true,serie: true}])
.controller('LoginCtrl', 
        
		function($scope, $ocLazyLoad, $rootScope, $location,$http,AuthenticationService) {
            /*
            console.log(11111);
            $.ajax({url: "/page", success: function(result){
                console.log(result);
                //$("#div1").html(result);
            }});
            */
            function connect(){  
                try{  
            
                    var socket;  
                    var host = "ws://172.24.1.1:7000";  
                    var socket = new WebSocket(host);  
            
                    //message(‘<p class=”event”>Socket Status: ‘+socket.readyState);  
            
                    const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
  
  ws.send('test');
});
ws.on('message', function (msg) {
  
    console.log(mes)
  });

                    
                    ws.onopen = function()
                       {
                          // Web Socket is connected, send data using send()
                          socket.send("ㅂ보내보자");
                          //alert("Message is sent...");
                       };
                    socket.onmessage = function(msg){  
                        //message(‘<p class=”message”>Received: ‘+msg.data);  
                        console.log(msg);
                    }  
            
                    socket.onclose = function(){  
                        //message(‘<p class=”event”>Socket Status: ‘+socket.readyState+‘ (Closed)’);  
                    }             
            
                } catch(exception){  
                    //message(‘<p>Error’+exception);  
                    console.log(exception());
                }  
            }
            //connect();

AuthenticationService.ClearCredentials();
	
    $scope.tryLogin = function () {
        $scope.dataLoading = true;
        //console.log($scope.form);
        
        console.log($('#userId').val());
        var form = {userId:$('#userId').val(),password:$('#password').val()};
        AuthenticationService.Login(form, function(response) {
        	
        	//console.log(response);
        	
        	if(response.token) {
        		AuthenticationService.SetCredentials(form.userId, form.password,response.token);
        		//$http.get('/customer/Customer').then(function(res){
            	//	AuthenticationService.SetCredentials(res.data.companyName, form.password,response.token);
                //    $location.path('home');
                $location.path('/applebox/list');
                
            	//},function(err){
            		//alert(err);
            	//});
        		
                
                
                
            } else {
                $scope.error = response.message;
                
            }
            $scope.dataLoading = false;
        },function(err){
            toastr.error(err.message);
            $scope.dataLoading = false;
        });
    }
    
}).factory('AuthenticationService',
    [ '$http', '$cookieStore', '$rootScope', '$timeout','$window',
    function ( $http, $cookieStore, $rootScope, $timeout,$window) {
        var service = {};
 
        service.Login = function (fdata, callback,errcall) {
           //console.log(fdata);
           $http.post('/admin/authenticate', fdata)
                .success(function (response) {
                    callback(response);
                })
                .error(function(err){
                    errcall(err);
                	//callback(err);
                	//toastr.error(err.message);
                	//$scope.dataLoading = true;
                	 //console.log(err);
                });
 
        };
  
        service.SetCredentials = function (userId, password,authdata) {
            $rootScope.globals = {
                currentUser: {
                    userId: userId,
                    authdata: authdata
                }
            };
  
            $http.defaults.headers.common.Authorization='Bearer ' +authdata;
            //$cookieStore.put('globals', $rootScope.globals);
            $window.localStorage.setItem('globals',angular.toJson($rootScope.globals));

        };
  
        service.ClearCredentials = function () {
            $rootScope.globals = {};
            //$cookieStore.remove('globals');
            $window.localStorage.removeItem('globals');
            $http.defaults.headers.common.Authorization='Bearer';
        };
  
        return service;
    }]);
