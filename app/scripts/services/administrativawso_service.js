'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.administrativawsoService
 * @description
 * # administrativawsoService
 * Service in the contractualClienteApp.
 */
angular.module('administrativaWsoService',[])
  .service('administrativaWsoRequest', function ($http) {

    // Service logic 
    var path = "http://jbpm.udistritaloas.edu.co:8280/services/contratoSuscritoProxyService/";
    var cabecera = {
      headers: {
	'Accept': 'Application/json'
      }
    };

    // Public API here
    return {
      get: function (tabla, params) {
	return $http.get(path + tabla + params, cabecera);
      },
      post: function (tabla, elemento) {
	return $http.post(path + tabla, elemento, cabecera);
      },
      put: function (tabla, elemento) {
	return $http.put(path + tabla , elemento, cabecera);
      },
      delete: function (tabla, id) {
	return $http.delete(path + tabla + id);
      }
    };

  });
