'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl
 * @description
 * # SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl', function ($location, $log, $scope, $routeParams, $translate, administrativaAmazonRequest, argoNosqlRequest, coreAmazonRequest, agoraRequest, adminMidRequest, administrativaWsoRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self= this;
    self.contrato_id = $routeParams.contrato_id;
    self.contrato_vigencia = $routeParams.contrato_vigencia;
    self.contrato_obj = {};
    self.numero_solicitud = 0;
    self.numero_oficio_estado_cuentas = 0;
    self.valor_desembolsado = 0;
    self.saldo_contratista = 0;
    self.saldo_universidad = 0;
    self.fecha_solicitud = new Date();
    self.fecha_terminacion_anticipada = new Date();
    self.estados= [];
    administrativaAmazonRequest.get('estado_contrato', $.param({
      query: "NombreEstado:" + "Suspendido"
    })).then(function(ec_response){
      self.estados[1] = ec_response.data[0];
    });

    administrativaWsoRequest.get('contrato', '/'+self.contrato_id+'/'+self.contrato_vigencia).then(function(wso_response){
      self.contrato_obj.id = wso_response.data.contrato.numero_contrato_suscrito;
      self.contrato_obj.valor = wso_response.data.contrato.valor_contrato;
      self.contrato_obj.objeto = wso_response.data.contrato.objeto_contrato;
      self.contrato_obj.fecha_registro = wso_response.data.contrato.fecha_registro;
      self.contrato_obj.ordenador_gasto_nombre = wso_response.data.contrato.ordenador_gasto.nombre_ordenador;
      self.contrato_obj.ordenador_gasto_rol = wso_response.data.contrato.ordenador_gasto.rol_ordenador;
      self.contrato_obj.vigencia = wso_response.data.contrato.vigencia;
      self.contrato_obj.supervisor = wso_response.data.contrato.supervisor.nombre;
      self.contrato_obj.supervisor_documento = wso_response.data.contrato.supervisor.documento_identificacion;
      administrativaAmazonRequest.get('tipo_contrato', $.param({
        query: "Id:" + wso_response.data.contrato.tipo_contrato
      })).then(function(tc_response){
        self.contrato_obj.tipo_contrato = tc_response.data[0].TipoContrato;
        argoNosqlRequest.get('novedad', self.contrato_obj.id + "/" + self.contrato_obj.vigencia).then(function(response_nosql){
          var elementos_cesion = response_nosql.data;
          if(elementos_cesion != null){
              var last_cesion = response_nosql.data[response_nosql.data.length - 1];
              console.log(last_cesion.tiponovedad);
              self.contrato_obj.tipo_novedad = last_cesion.tiponovedad;
              if (self.contrato_obj.tipo_novedad == "59d79683867ee188e42d8c97") {
                self.contrato_obj.contratista = last_cesion.cesionario;
                self.contrato_obj.cesion = 1;
              }else if (self.contrato_obj.tipo_novedad == "59d79683867ee188e42d8c98") {
                self.contrato_obj.contratista = last_cesion.cesionario;
              }else if (self.contrato_obj.tipo_novedad == "59d7985e867ee188e42d8e64") {
                self.contrato_obj.contratista = last_cesion.cesionario;
              }else if (self.contrato_obj.tipo_novedad == "59d79894867ee188e42d8e9b") {
                self.contrato_obj.contratista = last_cesion.cesionario;
              }else if (self.contrato_obj.tipo_novedad == "59d79904867ee188e42d8f02") {
                self.contrato_obj.contratista = last_cesion.cesionario;
              }
          }
          administrativaAmazonRequest.get('informacion_proveedor', $.param({
              query: "Id:" + self.contrato_obj.contratista
          })).then(function(ip_response) {
              self.contrato_obj.contratista_documento = ip_response.data[0].NumDocumento;
              self.contrato_obj.contratista_nombre = ip_response.data[0].NomProveedor;
          administrativaAmazonRequest.get('informacion_persona_natural', $.param({
            query: "Id:" + ip_response.data[0].NumDocumento
          })).then(function(ipn_response){
            coreAmazonRequest.get('ciudad','query=Id:' + ipn_response.data[0].IdCiudadExpedicionDocumento).then(function(c_response){
              self.contrato_obj.contratista_ciudad_documento = c_response.data[0].Nombre;
              administrativaAmazonRequest.get('informacion_persona_natural', $.param({
                query: "Id:" + self.contrato_obj.supervisor_documento              
              })).then(function(ispn_response){
                coreAmazonRequest.get('ciudad','query=Id:' + ipn_response.data[0].IdCiudadExpedicionDocumento).then(function(sc_response){
                  self.contrato_obj.supervisor_ciudad_documento = sc_response.data[0].Nombre;
                  console.log(self.contrato_obj)
                });
              });
            });
          });
        });
        });
      });
    });

    /**
     * @ngdoc method
     * @name generarActa
     * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl
     * @description
     * funcion que valida la data de la novedad
     */
    self.generarActa = function(){
      $location.path('/seguimientoycontrol/legal');
      swal(
          'Buen trabajo!',
          'Se ha generado el acta, se iniciará la descarga',
          'success'
      );
    };
  });