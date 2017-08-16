'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaReinicioCtrl
 * @description
 * # SeguimientoycontrolLegalActaReinicioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaReinicioCtrl', function ($location, $log, $scope, $routeParams, administrativaRequest, argoNosqlRequest, agoraRequest) {
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
    self.estado_ejecucion = {};
    self.n_solicitud = null;

    /*
    * Obtencion de estado de contrato Reinicio
    */
    administrativaRequest.get('estado_contrato',$.param({
      query: "NombreEstado:" + "Ejecución"
    })).then(function(request){
      self.estado_ejecucion = request.data[0];
    });

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
            self.suspension_id_nov = response.data[i]._id;
            self.f_suspension = new Date(response.data[i].fechasuspension);
            self.f_reinicio = new Date(response.data[i].fechareinicio);
            self.motivo_suspension = response.data[i].motivo;
          }
        }

        agoraRequest.get('informacion_proveedor', $.param({
          query: "Id:" + self.contrato_obj.contratista,
        })).then(function(response) {
          self.contrato_obj.contratista_documento = response.data[0].NumDocumento;
          self.contrato_obj.contratista_nombre = response.data[0].NomProveedor;
        });

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
      if($scope.formReinicio.$valid){
        self.reinicio_nov = {};
        self.reinicio_nov.tiponovedad = "597630a85aa3d86a430c8c37";
        self.reinicio_nov.numerosolicitud = self.n_solicitud;
        self.reinicio_nov.contrato = self.contrato_obj.id;
        self.reinicio_nov.vigencia = String(self.contrato_obj.vigencia);
        self.reinicio_nov.periodosuspension = self.diff_dias;
        self.reinicio_nov.fechasuspension = self.f_suspension;
        self.reinicio_nov.fechareinicio = self.f_reinicio;
        self.reinicio_nov.fecharegistro = new Date();
        self.reinicio_nov.fechasolicitud = new Date();
        self.reinicio_nov.motivo = self.motivo_suspension;
        self.reinicio_nov.observacion = "";

        self.contrato_estado = {};
        self.contrato_estado.NumeroContrato = self.contrato_obj.id;
        self.contrato_estado.Vigencia = self.contrato_obj.vigencia;
        self.contrato_estado.FechaRegistro = self.contrato_obj.fecha_registro;
        self.contrato_estado.Estado = self.estado_ejecucion;
        self.contrato_estado.Usuario = "up";

        /*
        * Validacion de put en nosql para post en contrato estado
        */
        argoNosqlRequest.put('novedad', self.suspension_id_nov, self.reinicio_nov).then(function(response_nosql){
          console.log(response_nosql);
          if(response_nosql.status == 200 || response_nosql.statusText == "OK"){
            administrativaRequest.post('contrato_estado', self.contrato_estado).then(function(response){
              console.log(response);
              if(response.status == 201 || response.statusText == "Created"){

                swal(
                  '¡Buen trabajo!',
                  'Se registro exitosamente la novedad de reinicio al contrato # '+ self.contrato_obj.id + " del: " + self.contrato_obj.vigencia,
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
