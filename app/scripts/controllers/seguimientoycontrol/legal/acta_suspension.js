'use strict';

/**
* @ngdoc function
* @name contractualClienteApp.controller:SeguimientoycontrolLegalActaSuspensionCtrl
* @description
* # SeguimientoycontrolLegalActaSuspensionCtrl
* Controller of the contractualClienteApp
*/
angular.module('contractualClienteApp')
.controller('SeguimientoycontrolLegalActaSuspensionCtrl', function ($location, $log, $scope, $routeParams, administrativaRequest, argoNosqlRequest, agoraRequest) {
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
  self.diff_dias = null;
  self.estado_suspendido = {};
  self.n_solicitud = null;

  self.contrato_id = $routeParams.contrato_id;
  self.contrato_obj = {};

  administrativaRequest.get('estado_contrato',$.param({
    query: "NombreEstado:" + "Suspendido"
  })).then(function(request){
    self.estado_suspendido = request.data[0];
  });

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

    agoraRequest.get('informacion_proveedor', $.param({
      query: "Id:" + self.contrato_obj.contratista,
    })).then(function(response) {
      self.contrato_obj.contratista_documento = response.data[0].NumDocumento;
      self.contrato_obj.contratista_nombre = response.data[0].NomProveedor;
    });
  });

  /**
  * @ngdoc method
  * @name calculoTiempo
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaSuspensionCtrl
  * @description
  * Funcion que observa el cambio de fechas y calcula el periodo de suspension
  * @param {date} Fecha de reinicio
  */
  $scope.$watch('sLactaSuspension.f_reinicio', function(){
    var dt1 = self.f_inicio;
    var dt2 = self.f_reinicio;
    var timeDiff = 0;

    if(dt2 != null){
      timeDiff = Math.abs(dt2.getTime() - dt1.getTime());
    }
    var last_time = Math.ceil(timeDiff / (1000 * 3600 * 24))
    if (last_time == 0){
      self.diff_dias = null;
    }else{
      self.diff_dias = last_time;
    }
  });

  /**
  * @ngdoc method
  * @name generarActa
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaSuspensionCtrl
  * @description
  * funcion para la genracion del pdf del acta correspondiente a la novedad de suspension
  * actualizacion de los datos del contrato y reporte de la novedad
  */
  self.generarActa = function(){
    if($scope.formSuspension.$valid){
      self.suspension_nov = {};
      self.suspension_nov.tiponovedad = "5976308f5aa3d86a430c8c0a"
      self.suspension_nov.numerosolicitud = self.n_solicitud;
      self.suspension_nov.contrato = self.contrato_obj.id;
      self.suspension_nov.vigencia = String(self.contrato_obj.vigencia);
      self.suspension_nov.motivo = self.motivo;
      self.suspension_nov.periodosuspension = self.diff_dias;
      self.suspension_nov.fecharegistro = new Date();
      self.suspension_nov.fechasolicitud = new Date();
      self.suspension_nov.fechasuspension = self.f_inicio;
      self.suspension_nov.fechareinicio = self.f_reinicio;

      self.contrato_estado = {};
      self.contrato_estado.NumeroContrato = self.contrato_obj.id;
      self.contrato_estado.Vigencia = self.contrato_obj.vigencia;
      self.contrato_estado.FechaRegistro = new Date();
      self.contrato_estado.Estado = self.estado_suspendido;
      self.contrato_estado.Usuario = "usuario_prueba";

      argoNosqlRequest.post('novedad', self.suspension_nov).then(function(response_nosql){
        console.log(response_nosql);
        if(response_nosql.status == 200){
          administrativaRequest.post('contrato_estado', self.contrato_estado).then(function(response){
            console.log(response);
            if(response.status == 201 || response.statusTexst == "Ok"){
              swal(
                '¡Buen trabajo!',
                'Se registro exitosamente la novedad de suspension al contrato # '+ self.contrato_obj.id + " del: " + self.contrato_obj.vigencia,
                'success'
              );

              $location.path('/seguimientoycontrol/legal');
            }
          });
        }
      });

    }else{

      swal(
        'Errores en el formulario',
        'Llenar los campos obligatorios en el formulario',
        'error'
      );
    }

  };
});
