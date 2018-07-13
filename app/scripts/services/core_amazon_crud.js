'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.coreAmazonCrud
 * @description
 * # coreAmazonCrud
 * Service in the contractualClienteApp.
 */
angular.module('coreAmazonService',[])
  .factory('coreAmazonRequest', function ($http) {
    var path = "http://10.20.0.254/core_amazon_crud/v1/";
    // Public API here
    return {
      get: function (tabla,params) {
        return $http.get(path+tabla+"/?"+params);
      },
      post: function (tabla,elemento) {
        return $http.post(path+tabla,elemento);
      },
      put: function (tabla,id,elemento) {
        return $http.put(path+tabla+"/"+id,elemento);
      },
      delete: function (tabla,id) {
        return $http.delete(path+tabla+"/"+id);
      }
    };
  });
