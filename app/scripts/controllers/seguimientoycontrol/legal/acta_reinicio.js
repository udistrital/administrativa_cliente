'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaReinicioCtrl
 * @description
 * # SeguimientoycontrolLegalActaReinicioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaReinicioCtrl', function ($log, $scope, $routeParams, administrativaRequest, argoNosqlRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    self.f_suspension = new Date();
    self.f_reinicio = new Date();
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
      self.contrato_obj.supervisor = response.data[0].Supervisor;
      self.contrato_obj.vigencia = response.data[0].VigenciaContrato;


      argoNosqlRequest.get('novedad', self.contrato_id + '/' + self.contrato_obj.vigencia).then(function(response){
        for(var i = 0 ; i < response.data.length ; i++){
          if(response.data[i].tiponovedad == "5976308f5aa3d86a430c8c0a"){
            self.suspension_id_nov = response.data[0]._id;
            self.f_suspension = new Date(response.data[0].fechasuspension);
            self.f_reinicio = new Date(response.data[0].fechareinicio);
            console.log(response.data[i]);
          }
        }
      });
    });


    /*
    * Funcion que observa el cambio de fechas y calcula el periodo de reinicio
    */
    $scope.$watch('sLactaReinicio.f_reinicio', function(){
      var dt1 = self.f_suspension;
      var dt2 = self.f_reinicio;
      var timeDiff = 0;

      if(dt2 != null){
        timeDiff = Math.abs(dt2.getTime() - dt1.getTime());
      }

      self.diff_dias = Math.ceil(timeDiff / (1000 * 3600 * 24));
    });

    self.generarActa = function(){

      self.reinicio_nov = {};
      self.reinicio_nov.tiponovedad = "597630a85aa3d86a430c8c37";
      self.reinicio_nov.contrato = self.contrato_obj.id;
      self.reinicio_nov.vigencia = String(self.contrato_obj.vigencia);
      self.reinicio_nov.periodosuspension = self.diff_dias;
      self.reinicio_nov.fechasuspension = self.f_suspension;
      self.reinicio_nov.fechareinicio = self.f_reinicio;
      self.reinicio_nov.fecharegistro = new Date(self.contrato_obj.fecha_registro);
      self.reinicio_nov.fechasolicitud = new Date();
      self.reinicio_nov.motivo = "";
      self.reinicio_nov.numerosolicitud = 0;
      self.reinicio_nov.observacion = "";

      self.contrato_estado = {};
      self.contrato_estado.NumeroContrato = self.contrato_obj.id;
      self.contrato_estado.Vigencia = self.contrato_obj.vigencia;
      self.contrato_estado.FechaRegistro = self.contrato_obj.fecha_registro;
      self.contrato_estado.Estado = {
        "NombreEstado": "Ejecución",
        "FechaRegistro": "2016-12-31T19:00:00-05:00",
        "Id": 1
      };
      self.contrato_estado.Usuario = "usuario_prueba";

      administrativaRequest.post('contrato_estado', self.contrato_estado).then(function(request){
        console.log(request);
      });

      argoNosqlRequest.put('novedad', self.suspension_id_nov, self.reinicio_nov).then(function(response){
        console.log(response);
      });


      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };

  });
