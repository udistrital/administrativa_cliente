'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaSuspensionCtrl
 * @description
 * # SeguimientoycontrolLegalActaSuspensionCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaSuspensionCtrl', function ($log, $scope, $routeParams, administrativaRequest, argoNosqlRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    self.f_registro = new Date();
    $scope.f_inicio = new Date();
    $scope.f_reinicio = new Date();
    $scope.motivo = "";
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
      self.contrato_obj.vigencia = response.data[0].VigenciaContrato;
    });

    /*
    * Funcion que observa el cambio de fechas y calcula el periodo de suspension
    */
    $scope.$watch('f_reinicio', function(){
      var dt1 = $scope.f_inicio;
      var dt2 = $scope.f_reinicio;
      var timeDiff = 0;

      if(dt2 != null){
        timeDiff = Math.abs(dt2.getTime() - dt1.getTime());
      }

      $scope.diff_dias = Math.ceil(timeDiff / (1000 * 3600 * 24));
    });

    self.generarActa = function(){
      self.suspension_nov = {};
      self.suspension_nov.contrato = self.contrato_obj.id;
      self.suspension_nov.vigencia = self.contrato_obj.vigencia;
      self.suspension_nov.motivo = $scope.motivo;
      self.suspension_nov.periodosuspension = $scope.diff_dias;
      self.suspension_nov.motivo = $scope.motivo;
      self.suspension_nov.fecharegistro = new Date();
      self.suspension_nov.fechasuspension = $scope.f_inicio;
      self.suspension_nov.fechareinicio = $scope.f_reinicio;

      argoNosqlRequest.post('novedad', self.suspension_nov).then(function(request){
        console.log(request);
      });

      console.log(self.suspension_nov);

      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };
  });
