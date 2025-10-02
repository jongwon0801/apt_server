
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
[{files:[//'/bower_components/moment/min/moment.min.js',
  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
  //'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
  //'/bower_components/ocModal/dist/css/ocModal.animations.css',
  //'/bower_components/ocModal/dist/css/ocModal.light.css',
  //'/bower_components/ocModal/dist/ocModal.js',
  //'views/seller/view.js',
  'js!https://maps.googleapis.com/maps/api/js?key=AIzaSyA8_mMe8iFr86WmiGuzKkZxgvqXjzS83n8',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'
  ],cache:false,serie: true}])
.controller('AppleboxMapCtrl', function($rootScope,$scope,$http,$location,$filter,$q,Locker,SaveLog,$stateParams,$state,$modal,MyCache) {

    //console.log(1111);
    $scope.myCache.loadGCode(['shop.kind']);
    $scope.sform={stype:'A'};
    
    
    //console.log($scope.sform);
    $scope.formSubmit=function(){
        if($scope.sform.stype=='A'){
            loadInstallArea();
        }else{
            if($scope.sform.kind)
                loadServiceArea();
        }

    };
    $scope.dataChange=function(){
        console.log('console.log');
    }
    function loadInstallArea(){
        $http.get('/v1/AppleboxMap').then(function(response) {
            //console.log(response);
            initMap();
            $.each( response.data, function( key, val ) {
                console.log(val);
                var marker = new google.maps.Marker({
                position: {lat:parseFloat(val.latitude),lng:parseFloat(val.longitude)},
                map: map
                });
                            //items.push( "<li id='" + key + "'>" + val + "</li>" );
            });
        }, function(x) {
            console.log(x);
        });
    }
    function loadServiceArea(){
        $http.get('/v2/Geojson/'+$scope.sform.kind).then(function(response) {
            initMap();
            map.data.addGeoJson(response.data);
            //console.log(response.data);
            /*$.each( response.data, function( key, val ) {
                console.log(val);
                var marker = new google.maps.Marker({
                position: {lat:parseFloat(val.latitude),lng:parseFloat(val.longitude)},
                map: map
                });
                            //items.push( "<li id='" + key + "'>" + val + "</li>" );
            });*/
        }, function(x) {
            console.log(x);
        });
    }
    var map;
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 37.566535, lng: 126.97796919999996},
            zoom: 10
        });

        /*var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });*/
        //loadMapData();
        
        

    }
    

    initMap();
    loadInstallArea();
    



});