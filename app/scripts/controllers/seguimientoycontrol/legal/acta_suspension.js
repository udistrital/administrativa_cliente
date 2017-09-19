'use strict';

/**
* @ngdoc function
* @name contractualClienteApp.controller:SeguimientoycontrolLegalActaSuspensionCtrl
* @description
* # SeguimientoycontrolLegalActaSuspensionCtrl
* Controller of the contractualClienteApp
*/
angular.module('contractualClienteApp')
.controller('SeguimientoycontrolLegalActaSuspensionCtrl', function ($location, $log, $scope, $routeParams, administrativaRequest, argoNosqlRequest, agoraRequest, adminMidRequest) {
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

  self.estados= [];

  administrativaRequest.get('estado_contrato',$.param({
    query: "NombreEstado:" + "Suspendido"
  })).then(function(request){
    self.estado_suspendido = request.data[0];
  });

  administrativaRequest.get('contrato_general',$.param({
    query: "Id:" + self.contrato_id
  })).then(function(cg_response) {
    self.contrato_obj.id = cg_response.data[0].Id;
    self.contrato_obj.contratista = cg_response.data[0].Contratista;
    self.contrato_obj.valor = cg_response.data[0].ValorContrato;
    self.contrato_obj.objeto = cg_response.data[0].ObjetoContrato;
    self.contrato_obj.fecha_registro = cg_response.data[0].FechaRegistro;
    self.contrato_obj.vigencia = cg_response.data[0].VigenciaContrato;
    self.contrato_obj.tipo_contrato = cg_response.data[0].TipoContrato.TipoContrato;

    agoraRequest.get('informacion_proveedor', $.param({
      query: "Id:" + self.contrato_obj.contratista,
    })).then(function(ip_response) {
      self.contrato_obj.contratista_documento = ip_response.data[0].NumDocumento;
      self.contrato_obj.contratista_nombre = ip_response.data[0].NomProveedor;

      agoraRequest.get('informacion_proveedor', $.param({
        query: "Id:" + self.contrato_obj.ordenador_gasto
      })).then(function(ipo_response) {
        self.contrato_obj.ordenador_gasto_nombre = ipo_response.data[0].NomProveedor;

        argoNosqlRequest.get('actainicio', self.contrato_id + '/' + self.contrato_obj.vigencia).then(function(ai_response){
          self.contrato_obj.fecha_inicio = new Date(ai_response.data[0].fechainicio);
        });

      });
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

        //es el estado al que pasará
        self.estados[1] = self.estado_suspendido;

        administrativaRequest.get('contrato_estado', 'query=numero_contrato%3A' + self.contrato_estado.NumeroContrato + '&sortby=Id&order=desc&limit=1').then(function (response) {
          //se obtiene el estado actual del contrato
          self.estados[0] = response.data[0].Estado;
          adminMidRequest.post('validarCambioEstado', self.estados).then(function (response) {
            self.validacion = response.data;
            if (self.validacion=="true") {
              argoNosqlRequest.post('novedad', self.suspension_nov).then(function (response_nosql) {
                console.log(response_nosql);
                if (response_nosql.status == 200) {
                  administrativaRequest.post('contrato_estado', self.contrato_estado).then(function (response) {
                    console.log(response);
                    if (response.status == 201 || response.statusTexst == "Ok") {
                      swal(
                        $translate.instant('TITULO_BUEN_TRABAJO'),
                        $translate.instant('DESCRIPCION_SUSPENSION') + self.contrato_obj.id + ' ' + $translate.instant('ANIO') + ': ' + self.contrato_obj.vigencia,
                        'success'
                      );

                      self.formato_generacion_pdf();
                    }
                  });
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
    argoNosqlRequest.get('plantilladocumento','59ad7043b43bd107a6dca324').then(function(response){
      var docDefinition = self.formato_pdf();
      pdfMake.createPdf(docDefinition).download('acta_suspension.pdf');
      // var docDefinition = JSON.stringify(eval("(" + response.data[0].plantilla + ")" ));
      // console.log(docDefinition);
      // var output = JSON.parse(docDefinition);
      // pdfMake.createPdf(output).download('acta_cesion.pdf');
      $location.path('/seguimientoycontrol/legal');
    });
  }

  self.formato_pdf = function(){
    return {
      content: [
        {
          style: ['bottom_space'],
          table: {
            widths:[65, '*', 120, 65],
            body:[
              [
                {image: 'logo_ud', fit:[65,120], rowSpan: 3, alignment: 'center', fontSize: 10},
                {text: 'ACTA DE SUSPENSIÓN', alignment: 'center', fontSize: 12},
                {text: 'Código: GJ-PR-002-FR-010', fontSize: 9},
                {image: 'logo_sigud', fit:[65,120], rowSpan: 3, alignment: 'center', fontSize: 10}
              ],
              [ ' ',
                {text: 'Macroproceso: Gestión administrativa y contratación', alignment: 'center', fontSize: 12},
                {text: 'Versión: 01', fontSize: 9, margin: [0, 6]},
                ' '
              ],
              [ ' ',
                {text: 'Proceso: Gestión Jurídica', alignment: 'center', fontSize: 12, margin: [0, 3]},
                {text: 'Fecha de Aprobación: 20/03/14', fontSize: 9},
                ' '
              ],
            ]
          }
        },
        {
          style:['general_font'],
          text:[
            {text:'Contrato: ', bold: true}, self.contrato_obj.tipo_contrato, {text:' No. ', bold: true}, self.contrato_id, '\n',
            {text:'Contratante: ', bold: true}, 'Universidad Distrital Francísco José de Caldas', '\n',
            {text:'Contratista: ', bold: true}, self.contrato_obj.contratista_nombre, '\n',
            {text:'Objeto: ', bold: true}, self.contrato_obj.objeto, '\n',
            {text:'Valor: ', bold: true}, self.contrato_obj.valor, '\n',
            {text:'Fecha de inicio: ', bold: true}, self.contrato_obj.fecha_inicio, '\n',
            {text:'Periodo de suspensión: ', bold: true}, self.suspension_nov.periodosuspension, '\n',
            {text:'Fecha de reinicio: ', bold: true}, self.suspension_nov.fechareinicio, '\n\n'
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
