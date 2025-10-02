
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',[
    {files:[
          ],cache:false,serie: true}])
   .controller('ConfigCtrl', function($rootScope,$scope,$http,$location,$filter,MyCache,$window) {
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
 }).factory('Notice',function($resource){
     return $resource('/admin/Notice/:noticeSq', { noticeSq: '@noticeSq'}, {
         update:{ method:'PUT'},
         get:{ cache:false},
         query: { method:'GET', cache: false, isArray:false }
     });	  
    }).factory('Vip',function($resource){
        return $resource('/admin/Vip/:ip', { vip: '@ip'}, {
            update:{ method:'PUT'},
            get:{ cache:false},
            query: { method:'GET', cache: false, isArray:false }
        });	  
    });