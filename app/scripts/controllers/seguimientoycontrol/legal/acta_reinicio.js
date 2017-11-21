'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaReinicioCtrl
 * @description
 * # SeguimientoycontrolLegalActaReinicioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
.controller('SeguimientoycontrolLegalActaReinicioCtrl', function ($location, $log, $scope, $routeParams, $translate, adminMidRequest, administrativaWsoRequest, administrativaAmazonRequest, argoNosqlRequest, agoraRequest) {
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
  self.contrato_vigencia = $routeParams.contrato_vigencia;
  self.contrato_obj = {};
  self.estado_ejecucion = {};
  self.n_solicitud = null;

  self.estados = [];

  // verificacion del estado del contrato
  administrativaAmazonRequest.get('estado_contrato', $.param({
    query: "NombreEstado:" + "En ejecucion"
  })).then(function(ec_response){
    var estado_temp_to = {
      "NombreEstado": "ejecucion"
    }
    if(ec_response.data[0].NombreEstado == "En ejecucion"){
      self.estados[1] = estado_temp_to;
    }
  });

  administrativaWsoRequest.get('contrato', '/'+self.contrato_id+'/'+self.contrato_vigencia).then(function(wso_response){
    console.log(wso_response.data);
    self.contrato_obj.id = wso_response.data.contrato.numero_contrato_suscrito;
    self.contrato_obj.valor = wso_response.data.contrato.valor_contrato;
    self.contrato_obj.objeto = wso_response.data.contrato.objeto_contrato;
    self.contrato_obj.fecha_registro = wso_response.data.contrato.fecha_registro;
    self.contrato_obj.ordenador_gasto_nombre = wso_response.data.contrato.ordenador_gasto.nombre_ordenador;
    self.contrato_obj.ordenador_gasto_rol = wso_response.data.contrato.ordenador_gasto.rol_ordenador;
    self.contrato_obj.vigencia = wso_response.data.contrato.vigencia;
    self.contrato_obj.tipo_contrato = wso_response.data.contrato.tipo_contrato;
    self.contrato_obj.supervisor = wso_response.data.contrato.supervisor.nombre;

    agoraRequest.get('informacion_proveedor', $.param({
      query: "Id:" + wso_response.data.contrato.contratista
    })).then(function(ip_response) {
      self.contrato_obj.contratista_documento = ip_response.data[0].NumDocumento;
      self.contrato_obj.contratista_nombre = ip_response.data[0].NomProveedor;

      agoraRequest.get('informacion_persona_natural', $.param({
        query: "Id:" + ip_response.data[0].NumDocumento
      })).then(function(ipn_response){
        self.contrato_obj.contratista_ciudad_documento = ipn_response.data[0].IdCiudadExpedicionDocumento;
        console.log(self.contrato_obj)
        argoNosqlRequest.get('novedad', self.contrato_id + '/' + self.contrato_obj.vigencia).then(function(response){
          console.log(response)
          for(var i = 0 ; i < response.data.length ; i++){
            if(response.data[i].tiponovedad == "59d7965e867ee188e42d8c72"){
              self.suspension_id_nov = response.data[i]._id;
              self.f_suspension = new Date(response.data[i].fechasuspension);
              self.f_reinicio = new Date(response.data[i].fechareinicio);
              self.motivo_suspension = response.data[i].motivo;
            }
          }
        });
      });
    });
  });

  /**
  * @ngdoc method
  * @name calculoTiempo
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaReinicioCtrl
  * @description
  * Funcion que observa el cambio de fecha de reinicio y calcula el periodo de suspension
  * @param {date} f_reinicio
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

  /**
  * @ngdoc method
  * @name generarActa
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaReinicioCtrl
  * @description
  * funcion para la genracion del pdf del acta correspondiente a la novedad de reinicio
  * actualizacion de los datos del contrato y reporte de la novedad
  */
  self.generarActa = function(){
    if($scope.formReinicio.$valid){
      self.reinicio_nov = {};
      self.reinicio_nov.tiponovedad = "59d796ac867ee188e42d8cbf";
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

      administrativaWsoRequest.get('contrato_estado', '/'+self.contrato_id+'/'+self.contrato_vigencia).then(function(ce_response){
        var estado_temp_from = {
          "NombreEstado": "Suspendido"
        }

        self.estados[0] = estado_temp_from;
        console.log(self.estados)
        adminMidRequest.post('validarCambioEstado', self.estados).then(function (vc_response) {
          argoNosqlRequest.put('novedad', self.suspension_id_nov, self.reinicio_nov).then(function(response_nosql){
            if(response_nosql.status == 200 || response_nosql.statusText == "OK"){
              var cambio_estado_contrato = {
                "_postcontrato_estado":{
                  "estado":4,
                  "usuario":"CC123456",
                  "numero_contrato_suscrito":self.contrato_id,
                  "vigencia":parseInt(self.contrato_vigencia)
                }
              };

              console.log(cambio_estado_contrato);
              administrativaWsoRequest.post('contrato_estado', cambio_estado_contrato).then(function (response) {
                console.log("POST WSO: ", response);
                if (response.status == 200 || response.statusText == "OK") {
                  swal(
                    $translate.instant('TITULO_BUEN_TRABAJO'),
                    $translate.instant('DESCRIPCION_REINICIO') + self.contrato_obj.id + ' ' + $translate.instant('ANIO') + ': ' + self.contrato_obj.vigencia,
                    'success'
                  );
                  self.formato_generacion_pdf();
                }
              });
            }
          });
        });
      });
    }else{
      swal(
        $translate.instant('TITULO_ERROR'),
        $translate.instant('DESCRIPCION_ERROR'),
        'error'
      );
    }
  };

  self.formato_generacion_pdf = function(){
    argoNosqlRequest.get('plantilladocumento','5a133759d9963a4c9025fbac').then(function(response){
      //console.log(response.data)
      //var docDefinition = JSON.stringify(eval("(" + response.data[0].plantilla + ")" ));
      //var docDefinition = self.get_pdf();
      //console.log(docDefinition);
      //var output = JSON.parse(docDefinition);
      //pdfMake.createPdf(docDefinition).download('acta_suspension.pdf');
      $location.path('/seguimientoycontrol/legal');
    });
  }

});
