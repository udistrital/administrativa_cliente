'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaReinicioCtrl
 * @description
 * # SeguimientoycontrolLegalActaReinicioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaReinicioCtrl', function ($log, $scope, $routeParams, administrativaRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    $scope.f_suspension = new Date();
    $scope.f_reinicio = new Date();
    $scope.diff_dias = 0;
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
      self.contrato_obj.supervisor = response.data[0].Supervisor;
      $log.log(response.data);
    });

    /*
    * Funcion que observa el cambio de fechas y calcula el periodo de reinicio
    */
    $scope.$watch('f_reinicio', function(){
      var dt1 = $scope.f_suspension;
      var dt2 = $scope.f_reinicio;
      var timeDiff = 0;

      if(dt2 != null){
        timeDiff = Math.abs(dt2.getTime() - dt1.getTime());
      }

      $scope.diff_dias = Math.ceil(timeDiff / (1000 * 3600 * 24));
    });

    self.generarActa = function(){
      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };

  });
