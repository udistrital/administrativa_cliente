'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
 * @description
 * # SeguimientoycontrolLegalActaCesionCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
.controller('SeguimientoycontrolLegalActaCesionCtrl', function ($location, $log, $scope, $routeParams, administrativaRequest, agoraRequest, argoNosqlRequest) {
  this.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  var self = this;

  self.contrato_id = $routeParams.contrato_id;
  self.contrato_obj = {};
  self.texto_busqueda = "";
  self.persona_sel = "";
  self.num_oficio = null;
  self.f_oficio = new Date();
  self.f_cesion = new Date();
  self.observaciones = "";
  self.n_solicitud = null;

  administrativaRequest.get('contrato_general',$.param({
    query: "Id:" + self.contrato_id
  })).then(function(response) {
    self.contrato_obj.complete = response.data[0];
    self.contrato_obj.id = response.data[0].Id;
    self.contrato_obj.contratista = response.data[0].Contratista;
    self.contrato_obj.valor = response.data[0].ValorContrato;
    self.contrato_obj.objeto = response.data[0].ObjetoContrato;
    self.contrato_obj.contratante = "Universidad Distrital Francisco José de Caldas";
    self.contrato_obj.fecha_registro = response.data[0].FechaRegistro;
    self.contrato_obj.ordenador_gasto = response.data[0].OrdenadorGasto;
    self.contrato_obj.vigencia = response.data[0].VigenciaContrato;

    agoraRequest.get('informacion_proveedor', $.param({
      query: "Id:" + self.contrato_obj.contratista,
    })).then(function(response) {
      self.contrato_obj.contratista_documento = response.data[0].NumDocumento;
      self.contrato_obj.contratista_nombre = response.data[0].NomProveedor;
    });

  });

  agoraRequest.get('informacion_persona_natural', $.param({
    fields: "Id,PrimerNombre,SegundoNombre,PrimerApellido,SegundoApellido",
    limit: 0
  })).then(function(response) {
    self.persona_natural_items = response.data;
  });

  /**
  * @ngdoc method
  * @name cargar_persona_natural
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
  * @description
  * funcion para la carga de una persoan natural segun el parametro de entrada
  * despliega en la interfaz la lista de personas naturales cuya cedula correspona
  * @param {integer} id_persona
  */
  self.cargar_persona_natural = function(id_persona){
    self.persona_natural_grep = jQuery.grep(self.persona_natural_items, function(value, index) {
      var str_value = value.Id.toString();
      var str_id_persona = id_persona.toString();
      if(str_value.indexOf(str_id_persona) != -1){
        return Number(str_value);
      }
    });
  }

  /**
  * @ngdoc method
  * @name persona_sel_change
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
  * @description
  * funcion que despliega la informacion formateada de la persona natural seleccionada
  * en el panel de cesionario
  * @param {object} val
  */
  self.persona_sel_change = function(val){
    if (val != null){
      console.log(val);
      self.cesionario_obj = {};
      self.cesionario_obj.nombre = val.PrimerNombre+ " " + val.SegundoNombre;
      self.cesionario_obj.apellidos = val.PrimerApellido + " " + val.SegundoApellido ;
      self.cesionario_obj.identificacion = val.Id;
      self.cesionario_obj.tipo_documento = "C.C";
      self.cesionario_obj.tipo_persona = "Natural"
    }
  }

  /**
  * @ngdoc method
  * @name generarActa
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
  * @description
  * funcion para la genracion del pdf del acta correspondiente a la novedad de cesion
  * actualizacion de los datos del contrato y reporte de la novedad
  */
  self.generarActa = function(){

    if($scope.formCesion.$valid){
      agoraRequest.get('informacion_proveedor', $.param({
        query: "NumDocumento:" + self.cesionario_obj.identificacion
      })).then(function(response){

        self.cesion_nov = {};
        self.cesion_nov.tiponovedad = "597630a35aa3d86a430c8c31"
        self.cesion_nov.numerosolicitud = self.n_solicitud;
        self.cesion_nov.contrato = self.contrato_obj.id;
        self.cesion_nov.fecharegistro = self.contrato_obj.fecha_registro;
        self.cesion_nov.fechasolicitud = new Date();
        self.cesion_nov.vigencia = String(self.contrato_obj.vigencia);
        self.cesion_nov.cesionario = response.data[0].Id;
        self.cesion_nov.cedente = self.contrato_obj.contratista;
        self.cesion_nov.numerooficio = self.num_oficio;
        self.cesion_nov.fechaoficio = self.f_oficio;
        self.cesion_nov.fechacesion = self.f_cesion;
        self.cesion_nov.observacion = self.observaciones;

        self.contrato_obj.complete.Contratista = response.data[0].Id;

        argoNosqlRequest.post('novedad', self.cesion_nov).then(function(response_nosql){
          if(response_nosql.status == 200  || response_nosql.statusText == "OK"){
            administrativaRequest.put('contrato_general', self.contrato_obj.id, self.contrato_obj.complete ).then(function(response){
              if(response.status == 200 || response.statusText == "OK"){
                swal(
                  '¡Buen trabajo!',
                  'Se registro exitosamente la novedad de cesion al contrato # '+ self.contrato_obj.id + " del: " + self.contrato_obj.vigencia,
                  'success'
                );

                $location.path('/seguimientoycontrol/legal');
              }
            });
          }
        });


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
