// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular
  .module("inspinia", [{ files: [], cache: false, serie: true }])
  .controller(
    "AppleboxCtrl",
    function ($rootScope, $scope, $http, $location, $filter, MyCache, $window) {
      $scope.myCache = MyCache;
      $scope.back = function () {
        $window.history.back();
      };

      //console.log('member');
    }
  )
  .factory("Locker", function ($resource) {
    return $resource(
      "/buyer/Locker/:yid",
      { yid: "@yid" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: true },
      }
    );
  })
  .factory("TakeLog", function ($resource) {
    return $resource(
      "/buyer/TakeLog/:takeSq",
      { takeSq: "@takeSq" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: false },
      }
    );
  })
  .factory("SaveLog", function ($resource) {
    return $resource(
      "/buyer/SaveLog/:saveSq",
      { saveSq: "@saveSq" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: false },
      }
    );
  })
  .factory("Buyer", function ($resource) {
    return $resource(
      "/buyer/Buyer/:buyerSq",
      { buyerSq: "@buyerSq" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: false },
      }
    );
  })
  .factory("Things", function ($resource) {
    return $resource(
      "/buyer/Things/:thingsSq",
      { thingsSq: "@thingsSq" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: false },
      }
    );
  })
  .factory("Shop", function ($resource) {
    return $resource(
      "/buyer/Shop/:shopSq",
      { shopSq: "@shopSq" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: false },
      }
    );
  })
  .factory("Applebox", function ($resource) {
    return $resource(
      "/buyer/Applebox/:yid",
      { yid: "@yid" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: false },
      }
    );
  })
  .factory("Member", function ($resource) {
    return $resource(
      "/buyer/Member/:memberSq",
      { memberSq: "@memberSq" },
      {
        update: { method: "PUT" },
        get: { cache: false },
        query: { method: "GET", cache: false, isArray: false },
      }
    );
  });
