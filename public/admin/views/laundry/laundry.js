
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',[
    {files:[
          ],cache:false,serie: true}])
   .controller('LaundryCtrl', function($rootScope,$scope,$http,$location,$filter,MyCache,$window) {
           $scope.myCache=MyCache;
         $scope.back=function(){
           $window.history.back();  
         } 
       
       //console.log('member');
 }).factory('UdsMsg',function($resource){
     return $resource('/admin/UdsMsg/:cmid', { cmid: '@cmid'}, {
         update:{ method:'PUT'},
         get:{ cache:false},
         query: { method:'GET', cache: false, isArray:false }
     });	  
 }).factory('LaundryNotice',function($resource){
     return $resource('/admin/LaundryNotice/:laundryNoticeSq', { laundryNoticeSq: '@laundryNoticeSq'}, {
         update:{ method:'PUT'},
         get:{ cache:false},
         query: { method:'GET', cache: false, isArray:false }
     });	  
 });