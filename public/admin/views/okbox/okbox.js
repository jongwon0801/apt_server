
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',[
    {files:[//'/bower_components/jquery-validation/dist/jquery.validate.min.js',
            //'/bower_components/ocModal/dist/css/ocModal.animations.css',
         //'/bower_components/ocModal/dist/css/ocModal.light.css',
         //'/bower_components/ocModal/dist/ocModal.js',
         //'/bower_components/sweetalert/dist/sweetalert.css',
         //'/bower_components/sweetalert/dist/sweetalert.min.js',
         //'/bower_components/moment/min/moment.min.js',
          //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
          //'/bower_components/bootstrap-daterangepicker/daterangepicker.css'
          ],cache:false,serie: true}])
   .controller('OkboxCtrl', function($rootScope,$scope,$http,$location,$filter,MyCache,$window) {
           $scope.myCache=MyCache;
         $scope.back=function(){
           $window.history.back();  
         } 
       
       //console.log('member');
 }).factory('Donation',function($resource){
     return $resource('/admin/Donation/:donationSq', { donationSq: '@donationSq'}, {
         update:{ method:'PUT'},
         get:{ cache:false},
         query: { method:'GET', cache: false, isArray:false }
     });	  
 });