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
  self.f_inicio = new Date();
  self.f_reinicio = new Date();
  self.motivo = "";
  self.diff_dias = 0;

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
  $scope.$watch('sLactaSuspension.f_reinicio', function(){
    var dt1 = self.f_inicio;
    var dt2 = self.f_reinicio;
    var timeDiff = 0;

    if(dt2 != null){
      timeDiff = Math.abs(dt2.getTime() - dt1.getTime());
    }

    self.diff_dias = Math.ceil(timeDiff / (1000 * 3600 * 24));
  });

  /*
  * Funcion para la generacion del acta
  */
  self.generarActa = function(){

    self.suspension_nov = {};
    self.suspension_nov.tiponovedad = "5976308f5aa3d86a430c8c0a"
    self.suspension_nov.contrato = self.contrato_obj.id;
    self.suspension_nov.vigencia = String(self.contrato_obj.vigencia);
    self.suspension_nov.motivo = self.motivo;
    self.suspension_nov.periodosuspension = self.diff_dias;
    self.suspension_nov.fecharegistro = self.contrato_obj.fecha_registro;
    self.suspension_nov.fechasolicitud = new Date();
    self.suspension_nov.fechasuspension = self.f_inicio;
    self.suspension_nov.fechareinicio = self.f_reinicio;

    self.contrato_estado = {};
    self.contrato_estado.NumeroContrato = self.contrato_obj.id;
    self.contrato_estado.Vigencia = self.contrato_obj.vigencia;
    self.contrato_estado.FechaRegistro = self.contrato_obj.fecha_registro;
    self.contrato_estado.Estado = {
      "NombreEstado": "Suspendido",
      "FechaRegistro": "2016-12-31T19:00:00-05:00",
      "Id": 7
    };
    self.contrato_estado.Usuario = "usuario_prueba";

    administrativaRequest.post('contrato_estado', self.contrato_estado).then(function(request){
      console.log(request);
    });

    argoNosqlRequest.post('novedad', self.suspension_nov).then(function(request){
      console.log(request);
    });

    swal(
      'Buen trabajo!',
      'Se ha generado el acta, se iniciará la descarga',
      'success'
    );

  };
});