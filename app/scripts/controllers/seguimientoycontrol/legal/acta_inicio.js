'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaInicioCtrl
 * @description
 * # SeguimientoycontrolLegalActaInicioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaInicioCtrl', function ($log, $scope, $routeParams, administrativaRequest,$translate,argoNosqlRequest)  {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    self.contrato_id = $routeParams.contrato_id;
    self.contrato_obj = {};
    self.poliza_obj = {};

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
      self.contrato_obj.plazo = response.data[0].PlazoEjecucion;
      self.contrato_obj.contratante = "Universidad Distrital Francisco José de Caldas";
      self.contrato_obj.supervisor = response.data[0].Supervisor;
      self.contrato_obj.VigenciaContrato = response.data[0].VigenciaContrato;
      self.contrato_obj.FechaRegistro = response.data[0].FechaRegistro;
      self.fecha_inicio = new Date();
      self.fecha_fin = new Date();
      // self.fecha_formateada = self.contrato_obj.FechaRegistro.substring(0, 10);
      // $scope.fecha_inicio = self.fecha_formateada;
      // $scope.fecha_fin = self.fecha_formateada;
      $log.log(response.data);
    });

    /*
    * Obtencion de datos de la poliza
    */
    administrativaRequest.get('poliza',$.param({
      query: "NumeroContrato:" + self.contrato_id
    })).then(function(response) {
      self.poliza_obj.id = response.data[0].Id;
      self.poliza_obj.numero_poliza = response.data[0].NumeroPoliza;
      self.poliza_obj.fecha_expedicion = response.data[0].FechaRegistro;
      self.poliza_obj.fecha_aprobacion = response.data[0].FechaAprobacion;
      $log.log(response.data);
    });

    self.gridOptions = {
      enableFiltering : true,
      enableSorting : true,
      enableRowSelection: false,
      multiSelect: false,
      enableSelectAll: false,
      columnDefs : [
        {field: 'TipoBien',  displayName: $translate.instant('TIPO_BIEN'),width: 200},
        {field: 'Placa' ,  displayName: $translate.instant('PLACA'),width: 150},
        {field: 'Descripcion',  displayName: $translate.instant('DESCRIPCION'),width: 168},
        {field: 'Sede',  displayName: $translate.instant('SEDE'),width: 180},
        {field: 'Dependencia',  displayName: $translate.instant('DEPENDENCIA'),width: 150},
        {field: 'Estado',  displayName: $translate.instant('ESTADO_DEL_BIEN'),width: 200},
      ],
      onRegisterApi : function( gridApi ) {
        self.gridApi = gridApi;
      }
    };
    
    self.gridOptions.data = [
                             {"TipoBien": "Bien de Consumo", "Placa":"1234556666","Descripcion":"Teclado LED", "Sede":"Macarena A", "Dependencia": "Bienestar", "Estado":""},
                             {"TipoBien": "Bien de Consumo", "Placa":"1234556667","Descripcion":"CPU X", "Sede":"Macarena A", "Dependencia": "Bienestar", "Estado":""}
                            ];

    self.generarActa = function(){
      self.data_acta_inicio = {
                                contrato: self.contrato_obj.id,
                                fechafin: self.fecha_fin,
                                fechainicio: self.fecha_inicio,
                                vigencia: String(self.contrato_obj.VigenciaContrato)
                              }
      
      // alert(JSON.stringify(self.data_acta_inicio));
      self.contrato_estado = {
                                NumeroContrato: self.contrato_obj.id,
                                Vigencia: self.contrato_obj.VigenciaContrato,
                                FechaRegistro: new Date(),
                                Estado: {
                                          "NombreEstado": "Ejecucion",
                                          "FechaRegistro": new Date(),
                                          "Id": 1
                                        },
                                Usuario: "prueba"
                              }
      // alert(JSON.stringify(self.contrato_estado));
      argoNosqlRequest.post('actainicio', self.data_acta_inicio).then(function(request){
        // console.log(request);
        if (request.status == 200) {
          administrativaRequest.post('contrato_estado', self.contrato_estado).then(function(request){
            console.log(request);
            if (request.status == 200) {
              self.formato_generacion_pdf();
              swal({
                title: 'Buen trabajo!',
                type: 'success',
                html: 'Se registro exitosamente la novedad de "Acta de inicio"<br>al contrato # '+self.contrato_obj.id+' del '+self.contrato_obj.VigenciaContrato+'.<br><br>El estado del presente contrato se actualizo a "Ejecución".',
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonText: '<i class="fa fa-thumbs-up"></i> Aceptar',
                allowOutsideClick: false
              }).then(function () {
                window.location.href = "#/seguimientoycontrol/legal";
              });
            }
          });
        }
      });
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
    * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegalActaInicioCtrl
    * @description
    * funcion para la generacion del PDF del acta correspondiente, basado en json (pdfmake)
    */
    self.formato_generacion_pdf = function(){
      argoNosqlRequest.get('plantilladocumento','59c37cb516a6ba0d76e40a36').then(function(response){
        var docDefinition = JSON.stringify(eval("(" + response.data[0].plantilla + ")" ));
        var output = JSON.parse(docDefinition);
        pdfMake.createPdf(output).download('acta_inicio.pdf');
      });
    }
  });