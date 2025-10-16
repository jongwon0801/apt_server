/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
	$urlRouterProvider.when('home', '/order/thingslist');
    $urlRouterProvider.otherwise('login');
    $ocLazyLoadProvider.config({
        debug: false,
        modules: [
            {name: 'GcmViewModule',			files:['views/gcm/view.js']},
            {name: 'GcmListModule',files:['views/gcm/list.js']},
            {name: 'GiftEventViewModule',			files:['views/sales/view.js']},
            {name: 'SalesListModule',files:['views/sales/list.js']},
            {name: 'PresentViewModule',			files:['views/present/view.js']},
            {name: 'PresentListModule',files:['views/present/list.js']},
            {name: 'OrderEditModule',	files:['views/shop/order.edit.js']},
            {name: 'OrderViewModule',	files:['views/shop/order.view.js']},
        	{name: 'OrderListModule',	files:['views/shop/order.list.js']},
            {name: 'AccountListModule',	files:['views/shop/account.list.js']},
            {name: 'AccountDailyModule',	files:['views/shop/account.list.daily.js']},
            {name: 'AccountWeekModule',	files:['views/shop/account.list.week.js']},
            {name: 'AccountMonthModule',	files:['views/shop/account.list.month.js']},
        	{name: 'MessageConfigModule',files:['views/message/config.js']},
        	{name: 'AppleboxMessageModule',files:['views/applebox/message.js']},
        	{name: 'AppleboxListModule',files:['views/applebox/list.js']},
            {name: 'SaveLogModule',files:['views/applebox/saveloglist.js']},
            {name: 'TakeLogModule',files:['views/applebox/takeloglist.js']},
            {name: 'AppleboxThingsListModule',files:['views/applebox/thingslist.js']},
            {name: 'AppleboxEditModule',files:['views/applebox/edit.js']},
            {name: 'AppleboxDetailModule',files:['views/applebox/detail.js']},
            {name: 'AppleboxViewModule',files:['views/applebox/view.js']},
            {name: 'RaspiViewModule',files:['views/applebox/raspiview.js']},
            {name: 'AppleboxSettingModule',files:['views/applebox/setting.js']},
            {name: 'AppleboxStatusModule',files:['views/applebox/status.js']},
            {name: 'AppleboxMapModule',files:['views/applebox/map.js']},
            {name: 'AppleboxLogModule',files:['views/applebox/log.js']},
            {name: 'ProductListModule',	files:['views/shop/product.list.js']},
            {name: 'ProductEditModule',	files:['views/shop/product.edit.js']},
        	{name: 'ShopListModule',	files:['views/shop/list.js']},
            {name: 'ShopEditModule',	files:['views/shop/edit.js']},
        	{name: 'ShopViewModule',	files:['views/shop/view.js']},
            {name: 'ShopCategoryModule',	files:['views/shop/category.js']},
        	{name: 'BuyerListModule',files:['views/buyer/list.js']},
        	{name: 'BuyerViewModule',files:['views/buyer/view.js']},
        	{name: 'BuyerEditModule',files:['views/buyer/edit.js']},
        	{name: 'MemberListModule',files:['views/member/list.js']},
        	{name: 'MemberViewModule',files:['views/member/view.js']},
        	{name: 'MemberEditModule',files:['views/member/edit.js']},
        	{name: 'MemberNewModule', files:['views/member/new.js']},
            {name: 'RfidEditModule', files:['views/rfid/edit.js']},
            {name: 'RfidListModule', files:['views/rfid/list.js']},
            {name: 'RfidViewModule', files:['views/rfid/view.js']},
            {name: 'ConfigSmsModule', files:['views/config/sms.js']},
            {name: 'ParcelListModule',files:['views/parcel/list.js']},
            {name: 'ParcelViewModule',files:['views/parcel/view.js']},
            {name: 'HouseListModule',files:['views/house/house_list.js']},
            {name: 'HouseResidentListModule',files:['views/house/resident_list.js']},
            {name: 'HouseResidentEditModule',files:['views/house/resident_edit.js']},
            {name: 'HouseEditModule',files:['views/house/house_edit.js']},
            {name: 'OrderParcelListModule',files:['views/order/parcel.list.js']},
            {name: 'OrderThingsListModule',files:['views/order/things.list.js']},
            {name: 'OrderThingsEditModule',files:['views/order/things.edit.js']},
            {name: 'OrderSuperListModule',files:['views/order/super.list.js']},
            {name: 'StatLaundryDailyListModule',	files:['views/stat/laundry.daily.list.js']},
            {name: 'StatParcelDailyListModule',	files:['views/stat/parcel.daily.list.js']}
            
        ]
    });
    
    $stateProvider
        .state('goods', {
            abstract: true,
            url: "/goods",
            templateUrl: "views/common/content.html",
            authenticate: true,
            controller:'GoodsCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/goods/goods.js']);
            	}]
            }
        })
        .state('goods.list', {
        	url: "/list?page&startDate&endDate&userId&memberType&status",
            templateUrl: "views/goods/list.html",
            authenticate: true,
        })
        .state('goods.view', {
        	url: '/view/:goodsSq',
            templateUrl: "views/goods/view.html",
            authenticate: true,
        })
        .state('goods.menu', {
        	url: '/menu',
            templateUrl: "views/goods/menu.html",
            authenticate: true,
        })
        .state('goods.edit', {
            url: "/edit",
            abstract: true,
            templateUrl: "views/goods/edit.html",
            authenticate: true,
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([{files: ['/css/jquery.steps.css']}]);
                }
            }
        })
        .state('house', {
            abstract: true,
            url: "/house",
            templateUrl: "views/common/content.html",
            controller:'HouseCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/house/house.js']);
            	}]
            }
            
        }).
        state('house.houselist', {
            url: "/houselist/?page&startDate&endDate&regDate&status&toName&uuid&dong&ho&usage",
            templateUrl: "views/house/house_list.html",
            
        })
        
        .state('house.residentlist', {
            url: "/residentlist/?page&startDate&endDate&regDate&status&toName&yid&saveHp&dong&ho",
            templateUrl: "views/house/resident_list.html",
            
        })
        .state('house.residentedit', {
            url: "/residentedit/:residentSq?yid&dong&ho",
            templateUrl: "views/house/resident_edit.html",
            
        })
        .state('house.houseedit', {
            url: "/houseedit/:yid/:dong/:ho",
            templateUrl: "views/house/house_edit.html",
            
        })
        .state('member', {
            abstract: true,
            url: "/member",
            templateUrl: "views/common/content.html",
            controller:'MemberCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/member/member.js']);
            	}]
            }
            
        })
        .state('member.list', {
            url: "/list?page&startDate&endDate&userId&memberType&status",
            templateUrl: "views/member/list.html",
            authenticate: true
        })
        .state('member.view', {
            url: '/view/:memberSq',
            templateUrl: 'views/member/view.html',
            authenticate: true
        })
        .state('member.edit', {
            url: "/edit/:memberSq",
            templateUrl: "views/member/edit.html",
            authenticate: true
        })
        .state('member.new', {
            url: "/new",
            templateUrl: "views/member/new.html",
            authenticate: true
        })
        .state('buyer', {
            abstract: true,
            url: "/buyer",
            templateUrl: "views/common/content.html",
            controller:'BuyerCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/buyer/buyer.js']);
            	}]
            }
            
        })
        .state('buyer.list', {
            url: "/list?page&startDate&endDate&userId&memberType&status",
            templateUrl: 'views/buyer/list.html',
            authenticate: true,
        })
        .state('buyer.view', {
            url: '/view/:buyerSq',
            templateUrl: 'views/buyer/view.html',
            authenticate: true,
        })
        .state('buyer.edit', {
            url: "/edit/:buyerSq",
            templateUrl: "views/buyer/edit.html",
            authenticate: true
        })
        .state('order', {
            abstract: true,
            url: "/order",
            templateUrl: "views/common/content.html",
            controller:'OrderCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/order/order.js']);
            	}]
            }
            
        })
        .state('order.parcellist', {
            url: "/parcellist?page&startDate&endDate&status&kind",
            templateUrl: 'views/order/parcel.list.html',
            authenticate: true,
        })
        .state('order.thingslist', {
            url: "/thingslist?page&startDate&endDat&status&kind&hp&name",
            templateUrl: 'views/order/things.list.html',
            authenticate: true,
        })
        .state('order.thingsedit', {
            url: "/thingsedit/:thingsSq",
            templateUrl: 'views/order/things.edit.html',
            authenticate: true,
        })
        .state('order.superlist', {
            url: "/superlist?page&startDate&endDat&status&kind",
            templateUrl: 'views/order/super.list.html',
            authenticate: true,
        })
        .state('order.prarcelview', {
            url: '/view/:orderCd',
            templateUrl: 'views/parcel/view.html',
            authenticate: true,
        })
        .state('stat', {
            abstract: true,
            url: "/stat",
            templateUrl: "views/common/content.html",
            controller:'StatCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/stat/stat.js']);
            	}]
            }
            
        })
        .state('stat.laundrydailylist', {
            url: "/laundrydailylist?page&startDate&endDate&userId&memberType&status",
            templateUrl: 'views/stat/laundry.daily.list.html',
            authenticate: true,
        })
        .state('stat.parceldailylist', {
            url: "/parceldailylist?page&startDate&endDate&userId&memberType&status",
            templateUrl: 'views/stat/parcel.daily.list.html',
            authenticate: true,
        })
        .state('shop', {
            abstract: true,
            url: "/shop",
            templateUrl: "views/common/content.html",
            controller:'ShopCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/shop/shop.js']);
            	}]
            }
            
        })
        .state('shop.list', {
            url: "/list?page&startDate&endDate&userId&memberType&status",
            templateUrl: 'views/shop/list.html',
            authenticate: true,
        })
        .state('shop.view', {
            url: '/view/:shopSq',
            templateUrl: 'views/shop/view.html',
            authenticate: true,
        })
        .state('shop.edit', {
            url: "/edit/:shopSq",
            templateUrl: "views/shop/edit.html",
            authenticate: true
        })
        .state('shop.productlist', {
            url: "/productlist?page&startDate&endDate&userId&status$productSqs",
            templateUrl: "views/shop/product.list.html",
            authenticate: true
        })
        .state('shop.productedit', {
            url: "/productedit/:productSq",
            templateUrl: "views/shop/product.edit.html",
            authenticate: true
        })
        .state('shop.orderlist', {
            url: "/orderlist?page&startDate&endDate&userId&status$kind",
            templateUrl: "views/shop/order.list.html",
            authenticate: true
        })
        .state('shop.orderview', {
            url: "/orderview/:orderSq",
            templateUrl: "views/shop/order.view.html",
            authenticate: true
        })
        .state('shop.orderedit', {
            url: "/orderedit/:orderSq",
            templateUrl: "views/shop/order.edit.html",
            authenticate: true
        })
        .state('shop.category', {
            url: "/category",
            templateUrl: "views/shop/category.html",
            authenticate: true
        })
        .state('shop.accountlist', {
            url: "/accountlist?page&startDate&endDate&userId&memberType&status",
            templateUrl: 'views/shop/account.list.html',
            authenticate: true,
        })
        .state('shop.accountlist.daily', {
            url: "/daily",
            templateUrl: "views/shop/account.list.daily.html",
            data: { pageTitle: '옵션관리' },
            authenticate: true,
        })
        .state('shop.accountlist.week', {
            url: "/week",
            templateUrl: "views/shop/account.list.week.html",
            data: { pageTitle: '옵션관리' },
            authenticate: true,
        })
        .state('shop.accountlist.month', {
            url: "/month",
            templateUrl: "views/shop/account.list.month.html",
            data: { pageTitle: '옵션관리' },
            authenticate: true,
        })
        .state('config', {
            abstract: true,
            url: "/config",
            templateUrl: "views/common/content.html"
            
        })
        .state('config.sms', {
            url: "/sms?page&startDate&endDate&userId&memberType&status",
            templateUrl: 'views/config/sms.html',
            authenticate: true,
        })
       .state('rfid', {
            abstract: true,
            url: "/rfid",
            templateUrl: "views/common/content.html",
            controller:'RfidCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/rfid/rfid.js']);
            	}]
            }
            
        })
        .state('rfid.list', {
            url: "/list?page&startDate&endDate&status&hp&tagid",
            templateUrl: 'views/rfid/list.html',
            authenticate: true,
        })
        .state('rfid.view', {
            url: '/view/:tagid',
            templateUrl: 'views/rfid/view.html',
            authenticate: true,
        })
        .state('rfid.edit', {
            url: "/edit/:tagid",
            templateUrl: "views/rfid/edit.html",
            authenticate: true
        })
        .state('seller.policy', {
            url: "/policy",
            templateUrl: "views/seller/policy.html",
            authenticate: true
        })
        .state('gcm', {
            abstract: true,
            url: "/message",
            templateUrl: "views/common/content.html",
            authenticate: true,
        })
        
        .state('gcm.list', {
            url: "/list",
            templateUrl: "views/gcm/list.html",
            authenticate: true,
        })
        .state('message', {
            abstract: true,
            url: "/message",
            templateUrl: "views/common/content.html",
            authenticate: true,
        })
        
        .state('message.config', {
            url: "/config",
            templateUrl: "views/message/config.html",
            authenticate: true,
        })
        .state('register', {
            url: "/register/:k",
            templateUrl: "views/Register.html",
            data: { pageTitle: 'Register', specialClass: 'gray-bg' },
            
        })
        .state('applebox', {
            abstract: true,
            url: "/applebox",
            templateUrl: "views/common/content.html",
            controller:'AppleboxCtrl',
            resolve: {
            	loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            		return $ocLazyLoad.load(['views/applebox/applebox.js']);
            	}]
            }
            
        })
        .state('applebox.list', {
        	url: "/list?page&startDate&endDate&companyName&status&buyerSq",
            templateUrl: "views/applebox/list.html",
            
        })
        .state('applebox.thingslist', {
        	url: "/thingslist?page&startDate&endDate&companyName&status",
            templateUrl: "views/applebox/thingslist.html",
            
        })
        .state('applebox.saveloglist', {
        	url: "/saveloglist?page&startDate&endDate&companyName&status&buyerSq&yid&uuid&saveHp&toHp&usage",
            templateUrl: "views/applebox/saveloglist.html",
            
        })
        .state('applebox.takeloglist', {
        	url: "/takeloglist?page&startDate&endDate&companyName&status&buyerSq&yid&uuid",
            templateUrl: "views/applebox/takeloglist.html",
            
        })
        .state('applebox.edit', {
            url: "/edit/:yid",
            templateUrl: "views/applebox/edit.html",
            
        })
        .state('applebox.detail', {
            url: "/detail/:buyerSq",
            templateUrl: "views/applebox/detail.html",
            
        })
        .state('applebox.view', {
            url: "/view/:yid",
            templateUrl: "views/applebox/view.html",
            
        })
        .state('applebox.raspiview', {
            url: "/raspiview/:yid",
            templateUrl: "views/applebox/raspiview.html",
            
        })
        .state('applebox.setting', {
            url: "/setting/:yid",
            templateUrl: "views/applebox/setting.html",
            
        })
        .state('applebox.status', {
            url: "/status/:yid",
            templateUrl: "views/applebox/status.html",
            
        })
        .state('applebox.map', {
            url: "/map",
            templateUrl: "views/applebox/map.html",
        })
        /*.state('applebox.log', {
            url: "/log/:yid",
            templateUrl: "views/applebox/log.html",
            
        })*/
        .state('applebox.message', {
            url: "/message",
            templateUrl: "views/applebox/message.html",
            
        })
        
        .state('sales', {
            abstract: true,
            url: "/sales",
            templateUrl: "views/common/content.html",
            
        })
        .state('sales.list', {
            url: "/list?page&startDate&endDate&userId&memberType&status&gubun&taxYn",
            templateUrl: "views/sales/list.html",
            authenticate: true,
        })
        .state('sales.view', {
            url: "/view/:giftEventSq",
            templateUrl: "views/sales/view.html",
            authenticate: true,
        })
        .state('present', {
            abstract: true,
            url: "/present",
            templateUrl: "views/common/content.html",
            
        })
        .state('present.list', {
            url: "/list?page&startDate&endDate&userId&memberType&status&gubun&taxYn",
            templateUrl: "views/present/list.html",
            data: { pageTitle: '선물발송목록' },
            authenticate: true,
        })
        .state('present.view', {
            url: "/view/:giftEventSq",
            templateUrl: "views/present/view.html",
            data: { pageTitle: '선물발송목록' },
            authenticate: true,
        })
        .state('login', {
            url: "/login",
            //templateUrl: "views/login.html",
            //controller: 'LoginCtrl',
            
                  controller: 'LoginCtrl', // This view will use AppCtrl loaded below in the resolve
                  templateUrl: 'views/login.html'
            ,
            //data: { pageTitle: 'Login', specialClass: 'gray-bg' },
	        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
	            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
	              // you can lazy load files for an existing module
	            	
	            	//console.log('dddddddddddd');
	              return $ocLazyLoad.load(['views/login.js']);
	            }]
	        }
        })
        .state('logout', {
            url: "/logout",
            controller:function($rootScope,$cookieStore,$http,$location){
            	$rootScope.globals = {};
                $cookieStore.remove('globals');
                $http.defaults.headers.common.Authorization='Bearer';
            	$location.path('/login');
            }
        })
        
}
angular
    .module('inspinia')
    .config(config)
    .run(function($rootScope, $state,$stateParams,$cookieStore,$http,$location,$ocLazyLoad,$window) {
    	console.log(11);
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        	
        	if( toState.authenticate ){
        	    $rootScope.$on('$locationChangeStart', function (event, next, current) {
	                if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
	                    $location.path('/login');
	                }
	            });
	            
        	}
        });
        //$rootScope.globals = $cookieStore.get('globals') || {};
        //console.log($window.localStorage.getItem('globals'));
        //console.log(angular.toJson($window.localStorage.getItem('globals')));
        //console.log($window.localStorage);
    	$rootScope.globals = angular.fromJson($window.localStorage.getItem('globals'));
    	if ($rootScope.globals && $rootScope.globals.currentUser) {
             $http.defaults.headers.common.Authorization='Bearer ' +$rootScope.globals.currentUser.authdata;
             
        }
       
        toastr.options = {
      		  "closeButton": true,
      		  "debug": false,
      		  "progressBar": true,
      		  "preventDuplicates": true,
      		  "positionClass": "toast-bottom-center",
      		  "onclick": null,
      		  "showDuration": "400",
      		  "hideDuration": "1000",
      		  "timeOut": "7000",
      		  "extendedTimeOut": "1000",
      		  "showEasing": "swing",
      		  "hideEasing": "linear",
      		  "showMethod": "fadeIn",
      		  "hideMethod": "fadeOut"
      }
        
    });
