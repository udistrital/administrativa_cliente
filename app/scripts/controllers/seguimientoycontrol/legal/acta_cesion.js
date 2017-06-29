'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
 * @description
 * # SeguimientoycontrolLegalActaCesionCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaCesionCtrl', function ($log, $scope, $routeParams, administrativaRequest, agoraRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];


    var self= this;

    self.contrato_id = $routeParams.contrato_id;
    self.contrato_obj = {};

    /*
    * Obtencion de datos del contrato del servicio
    */
    administrativaRequest.get('contrato_general',$.param({
      query: "Id:" + self.contrato_id
    })).then(function(response) {
      self.contrato_obj.id = response.data[0].Id;
      self.contrato_obj.contratista = response.data[0].Contratista;
      self.contrato_obj.valor = response.data[0].ValorContrato;
      self.contrato_obj.objeto = response.data[0].ObjetoContrato;
      self.contrato_obj.contratante = "Universidad Distrital Francisco José de Caldas";
      self.contrato_obj.fecha_registro = response.data[0].FechaRegistro;
      self.contrato_obj.ordenador_gasto = response.data[0].OrdenadorGasto;
    });

    self.persona_natural_obj = {};

    /*
    * Obtencion de datos de las personas naturales, para los cesionarios
    */
    agoraRequest.get('informacion_persona_natural', 'fields=Id,PrimerNombre,SegundoNombre,PrimerApellido,SegundoApellido&limit=0').then(function(response) {
      self.persona_natural_obj = response.data;
    });

    /*
    * Search for repos... use $timeout to simulate
    * remote dataservice call.
    */
    function busqueda_cesionarios(query) {
      var results = query ? self.persona_natural_obj.filter( crear_filtro_para(query) ) : self.persona_natural_obj,
      deferred;
      return results;
    }

    /*
    * Funcion de creacion de filtro para un parametro de busqueda
    */
    function crear_filtro_para(query) {
      var query_minuscula = angular.lowercase(query);
      return function funcion_filtro(item) {
        return (item.value.indexOf(query_minuscula) === 0);
      };
    }

    self.generarActa = function(){
      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };

  });
