'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
 * @description
 * # SeguimientoycontrolLegalActaCesionCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
.controller('SeguimientoycontrolLegalActaCesionCtrl', function ($translate, $location, $log, $scope, $routeParams, administrativaRequest, administrativaWsoRequest, agoraRequest, argoNosqlRequest) {
  this.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  var self = this;

  self.contrato_id = $routeParams.contrato_id;
  self.contrato_vigencia = $routeParams.contrato_vigencia;
  self.contrato_obj = {};
  self.texto_busqueda = '';
  self.persona_sel = '';
  self.num_oficio = null;
  self.f_oficio = new Date();
  self.f_cesion = new Date();
  self.observaciones = "";
  self.n_solicitud = null;

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
    });
  });

  agoraRequest.get('informacion_persona_natural', $.param({
    fields: "Id,PrimerNombre,SegundoNombre,PrimerApellido,SegundoApellido,FechaExpedicionDocumento,TipoDocumento",
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
      self.cesionario_obj = {};
      self.cesionario_obj.nombre = val.PrimerNombre+ " " + val.SegundoNombre;
      self.cesionario_obj.apellidos = val.PrimerApellido + " " + val.SegundoApellido ;
      self.cesionario_obj.identificacion = val.Id;
      self.cesionario_obj.fecha_expedicion_documento = val.FechaExpedicionDocumento;
      self.cesionario_obj.tipo_documento = val.TipoDocumento.ValorParametro;
      self.cesionario_obj.tipo_persona = "Natural";
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
              console.log(response);
              if(response.status == 200 || response.statusText == "OK"){
                swal(
                  $translate.instant('TITULO_BUEN_TRABAJO'),
                  $translate.instant('DESCRIPCION_CESION') + self.contrato_obj.id + ' ' + $translate.instant('ANIO') + ': ' + self.contrato_obj.vigencia,
                  'success'
                );
                self.formato_generacion_pdf();
              }
            });
          }
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

  /**
  * @ngdoc method
  * @name format_date
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
  * @description
  * funcion para el formateo de objetos tipo fecha a formato dd/mm/yyyy
  * @param {date} param
  */
  self.format_date = function(param){
    var date = new Date(param);
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
  };

  /**
  * @ngdoc method
  * @name formato_generacion_pdf
  * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaCesionCtrl
  * @description
  * funcion para la generacion del PDF del acta correspondiente, basado en json (pdfmake)
  */
  self.formato_generacion_pdf = function(){
    argoNosqlRequest.get('plantilladocumento','59d79414867ee188e42d8a59').then(function(response){
      var docDefinition = JSON.stringify(eval("(" + response.data[0].plantilla + ")" ));
      var output = JSON.parse(docDefinition);
      pdfMake.createPdf(output).download('acta_cesion.pdf');
      $location.path('/seguimientoycontrol/legal');
    });
  }
});
