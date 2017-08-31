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
  })).then(function(cg_response) {
    self.contrato_obj.complete = cg_response.data[0];
    self.contrato_obj.id = cg_response.data[0].Id;
    self.contrato_obj.contratista = cg_response.data[0].Contratista;
    self.contrato_obj.valor = cg_response.data[0].ValorContrato;
    self.contrato_obj.objeto = cg_response.data[0].ObjetoContrato;
    self.contrato_obj.contratante = "Universidad Distrital Francisco José de Caldas";
    self.contrato_obj.fecha_registro = cg_response.data[0].FechaRegistro;
    self.contrato_obj.ordenador_gasto = cg_response.data[0].OrdenadorGasto;
    self.contrato_obj.vigencia = cg_response.data[0].VigenciaContrato;
    self.contrato_obj.tipo_contrato = cg_response.data[0].TipoContrato.TipoContrato;

    agoraRequest.get('informacion_proveedor', $.param({
      query: "Id:" + self.contrato_obj.contratista
    })).then(function(ipc_response) {
      self.contrato_obj.contratista_documento = ipc_response.data[0].NumDocumento;
      self.contrato_obj.contratista_nombre = ipc_response.data[0].NomProveedor;

      agoraRequest.get('informacion_proveedor', $.param({
        query: "Id:" + self.contrato_obj.ordenador_gasto
      })).then(function(ipo_response) {
        self.contrato_obj.ordenador_gasto_nombre = ipo_response.data[0].NomProveedor;

        agoraRequest.get('informacion_persona_natural', $.param({
          fields: "Cargo",
          query: "Id:" + ipo_response.data[0].NumDocumento
        })).then(function(ipn_response) {
          self.contrato_obj.ordenador_gasto_cargo = ipn_response.data[0].Cargo;
        });
      });
    });
  });

  agoraRequest.get('informacion_persona_natural', $.param({
    fields: "Id,PrimerNombre,SegundoNombre,PrimerApellido,SegundoApellido,FechaExpedicionDocumento",
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
      self.cesionario_obj.tipo_documento = "C.C";
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
              if(response.status == 200 || response.statusText == "OK"){
                swal(
                  '¡Buen trabajo!',
                  'Se registro exitosamente la novedad de cesion al contrato # '+ self.contrato_obj.id + " del: " + self.contrato_obj.vigencia,
                  'success'
                );

                var docDefinition = self.formato_generacion_pdf();
                console.log(docDefinition);
                pdfMake.createPdf(docDefinition).download('acta_cesion.pdf');
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
  * @param {date} param
  */
  self.formato_generacion_pdf = function(){
    return {
      content: [
        {
          style: ['bottom_space'],
          table:{
            widths:[65, '*', 120, 65],
            body:[
              [
                {text: 'logo-ud', rowSpan: 3, alignment: 'center', fontSize: 10},
                {text: 'ACTA DE CESIÓN', alignment: 'center', fontSize: 12},
                {text: 'Código: GJ-PR- 002-FR- 010', fontSize: 9},
                {text: 'logo-sigud', rowSpan: 3, alignment: 'center', fontSize: 10}
              ],
              [
                '',
                {text: 'Macroproceso: Gestión administrativa y contratación', alignment: 'center', fontSize: 12},
                {text: 'Versión: 01', fontSize: 9, margin: [0, 6]},
                ''
              ],
              [
                '',
                {text: 'Proceso: Gestión Jurídica', alignment: 'center', fontSize: 12, margin: [0, 3]},
                {text: 'Fecha de Aprobación: 20/03/14', fontSize: 9},
                ''
              ],
            ]
          }
        },
        {
          style:['general_font'],
          text:[
            {text: "Contrato: ", bold: true}, self.contrato_obj.tipo_contrato, {text: " No: ", bold: true}, self.contrato_id, '\n',
            {text: "Fecha de suscripcion: ", bold: true}, {text: self.format_date(self.contrato_obj.fecha_registro)}, '\n',
            {text: "Contratante: ", bold: true}, self.contrato_obj.contratante, '\n',
            {text: "Cedente: ", bold: true}, self.contrato_obj.contratista_nombre, '\n',
            {text: "Cesionario: ", bold: true}, self.cesionario_obj.nombre + ' ' + self.cesionario_obj.apellidos, '\n\n',

            "La presente Acta hace parte del Contrato de Prestación de Servicios No. " + self.contrato_id,
            " del dia " + self.format_date(self.contrato_obj.fecha_registro) + " cuyo objeto es: " + self.contrato_obj.objeto,
            {text: ', de acuerdo con la propuesta de servicios que forma parte integral del presente Contrato', italics: true},
            " Firmada por " + self.contrato_obj.ordenador_gasto_nombre + " como LA UNIVERSIDAD y " + self.contrato_obj.contratista_nombre,
            " Como EL CONTRATISTA.", '\n\n',

            " De conformidad con el Contrato de prestación de servicios ", self.contrato_id, " Del dia ", self.format_date(self.contrato_obj.fecha_registro),
            " en la CLÁUSULA OCTAVA. CESIÓN DEL CONTRATO, establece: ", {text:'"El Contratista no podrá ceder total ni parcialmente los derechos' +
            ' y obligaciones emanadas de esta Orden a persona natural o jurídica, sino con autorización previa y por escrito de la Universidad".', italics:true},
            '\n\n',

            {text:"La presente Cesión se lleva a cabo en la forma que se determina a continuación, previa las siguientes consideraciones: "}, '\n\n'
          ]
        },
        {
          style:['general_font'],
          ol: [
            "Que mediante escrito de fecha: "+ self.format_date(self.cesion_nov.fecharegistro) + ", el contratista " + self.contrato_obj.contratista_nombre + " (Cedente)," +
            " solicita a" + self.contrato_obj.ordenador_gasto_nombre + ', quien cumple la función Ordenador de Gasto, la autorización para realizar la Cesión del Contrato de Prestación de Servicios ' +
            self.contrato_id + " de fecha " + self.format_date(self.contrato_obj.fecha_registro) + " a partir del " + self.format_date(self.cesion_nov.fechacesion) + " a " +
            self.cesionario_obj.nombre + ' ' + self.cesionario_obj.apellidos + " (cesionario) quien cumple con las calidades y competencias para desarrollar el objeto del Contrato." + '\n\n',

            "Que mediante oficio No. " + self.cesion_nov.numerooficio + " de fecha " + self.format_date(self.cesion_nov.fechaoficio) + ", el " + self.contrato_obj.ordenador_gasto_cargo +
            " de la Universidad Distrital Francisco José de Caldas," + " solicita a la Oficina Asesora Jurídica la elaboración del Acta de Cesión al contrato " + self.contrato_obj.tipo_contrato + " " + self.contrato_id +
            " de fecha " + self.format_date(self.contrato_obj.fecha_registro) + " y como Ordenador del Gasto segun " + "___________________" + ", manifiesta que aprueba la cesión del contrato "+ self.contrato_obj.tipo_contrato +" en su totalidad." + '\n\n',

            "Por lo anterior, se Cede el Contrato de Prestación de Servicios " + self.contrato_id + " de fecha " + self.format_date(self.contrato_obj.fecha_registro) + " a nombre de " +
            self.contrato_obj.contratista_nombre + ", a " + self.cesionario_obj.nombre + ' ' + self.cesionario_obj.apellidos + " identificada con Cédula de Ciudadanía No. " +
            self.cesionario_obj.identificacion + " de " + self.format_date(self.cesionario_obj.fecha_expedicion_documento) + " quien cumple con el perfil requerido de acuerdo con lo establecido en el objeto" +
            "y continuará con las obligaciones derivadas del Contrato de Prestación de Servicios en mención a partir de " + self.format_date(self.cesion_nov.fechacesion) + '\n\n'
          ]
        },
        {
          style:['general_font'],
          pageBreak: 'after',
          text:[
            {text:"Otras consideraciones: ", bold:true}, '\n\n' +
            self.cesion_nov.observacion + '\n\n' +
            "La presente acta se perfecciona e inicia su ejecución con la firma de las partes y la aceptación del cesionario a partir de: " +
            self.format_date(self.cesion_nov.fechacesion) + "\n\n\n",
          ]
        },
        {
          style: ['bottom_space'],
          table:{
            widths:[65, '*', 120, 65],
            body:[
              [
                {text: 'logo-ud', rowSpan: 3, alignment: 'center', fontSize: 10},
                {text: 'ACTA DE CESIÓN', alignment: 'center', fontSize: 12},
                {text: 'Código: GJ-PR- 002-FR- 010', fontSize: 9},
                {text: 'logo-sigud', rowSpan: 3, alignment: 'center', fontSize: 10}
              ],
              [
                '',
                {text: 'Macroproceso: Gestión administrativa y contratación', alignment: 'center', fontSize: 12},
                {text: 'Versión: 01', fontSize: 9, margin: [0, 6]},
                ''
              ],
              [
                '',
                {text: 'Proceso: Gestión Jurídica', alignment: 'center', fontSize: 12, margin: [0, 3]},
                {text: 'Fecha de Aprobación: 20/03/14', fontSize: 9},
                ''
              ],
            ]
          }
        },
        {
          style:['general_font'],
          text:[
            "_____________________________________ \n",
            "Ordenador de Gasto \n\n\n"

          ]
        },
        {
          style:['general_font'],
          text:[
            "_____________________________________ \n",
            "CC. " + self.contrato_obj.contratista_documento + "\n",
            "Cedente \n\n\n"
          ]
        },
        {
          style:['general_font'],
          text:[
            {text:"ACEPTO: \n\n\n", bold:true},
            "_____________________________________ \n",
            "CC. " + self.cesionario_obj.identificacion + "\n",
            "Cesionario"
          ]
        }
      ],
      styles: {
        top_space: {
          marginTop: 30
        },
        bottom_space: {
          marginBottom: 30
        },
        general_font:{
          fontSize: 12,
          alignment: 'justify'
        }
      }
    }
  }
});
