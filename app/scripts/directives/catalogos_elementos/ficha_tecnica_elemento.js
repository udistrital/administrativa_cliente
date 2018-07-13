'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:catalogosElementos/fichaTecnicaElemento
 * @description
 * # catalogosElementos/fichaTecnicaElemento
 */
angular.module('contractualClienteApp')
  .directive('catalogosElementos/fichaTecnicaElemento', function () {
    return {
      restrict: 'E',
      /*scope:{
          var:'='
        },
      */
      templateUrl: 'add-view.html',
      controller:function(){
        var ctrl = this;
      },
      controllerAs:'d_catalogosElementos/fichaTecnicaElemento'
    };
  });
