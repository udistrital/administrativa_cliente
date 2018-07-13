'use strict';

/**
 * @ngdoc service
 * @name administraticaAmazonService.administrativaAmazonRequest
 * @description
 * # administrativaAmazonRequest
 * Factory in the administraticaAmazonService
 */
angular.module('administrativaAmazonService', [])
  .factory('administrativaAmazonRequest', function ($http) {
    // Service logic
    // ...
    //var path = "http://localhost:8081/v1/";
    var path = "http://10.20.0.254/administrativa_amazon_api/v1/";
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
