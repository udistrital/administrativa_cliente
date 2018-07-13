'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolFinancieroContratoCtrl
 * @description
 * # SeguimientoycontrolFinancieroContratoCtrl
 * Controller of the contractualClienteApp
 */
 
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolFinancieroContratoCtrl', function (contrato,agoraRequest) {
    var self = this;
    self.contrato=contrato;
    console.log(contrato);
    agoraRequest.get('informacion_persona_natural', 'query=Id:'+contrato.ContratistaId).then(function(response) {
      self.persona=response.data[0];
    agoraRequest.get('parametro_estandar', 'query=Id:'+self.persona.TipoDocumento.Id).then(function(response) {
          self.persona.TipoDocumento.ValorParametro=response.data[0].ValorParametro;
        });
    });
  });
