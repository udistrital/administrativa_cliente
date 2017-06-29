'use strict';

/**
 * @ngdoc service
 * @name argoNosqlService.argoNosqlRequest
 * @description
 * # argoNosqlService
 * Factory in the argoNosqlRequest. 
 */
angular.module('argoNosqlService', [])
  .factory('argoNosqlRequest', function ($http) {
      // Service logic
      // ...
      //var path = "http://localhost:8081/v1/";
      var path = "http://10.20.2.17:8181/docs/local/argo/";
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
