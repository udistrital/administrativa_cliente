'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalCtrl
 * @description
 * # SeguimientoycontrolLegalCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalCtrl', function ($log,$location,$scope,administrativaRequest,$window,$translate, administrativaWsoRequest, agoraRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    self.estado_contrato_obj = {};
    self.estado_resultado_response = 0;
    self.contratos = [{}];
    self.vigencias = [];
    self.vigencia_seleccionada = self.vigencias[0];

    // Obtiene las vigencias de contratos
    administrativaRequest.get('vigencia_contrato', '').then(function(response) {
      self.vigencias = response.data;
    });

    // Mantiene constante observacion las vigencias
    $scope.$watch('sLegal.vigencia_seleccionada', function(){
      self.get_contratos_vigencia(self.vigencia_seleccionada);
    });
    
    /**
    * @ngdoc method
    * @name get_contratos_vigencia
    * @methodOf contractualClienteApp.controller:SeguimientoycontrolLegal
    * @description
    * funcion para obtener la totalidad de los contratos por vigencia seleccionada
    */
    //self.get_contratos_vigencia = function(vigencia){
      //administrativaWsoRequest.get('contrato','').then(function(wso_response){
        //var wso_contratos = wso_response.data.contratos.contrato;
        //self.contratos = [];
        //$.each(wso_contratos, function(idx, contrato){
          //if(contrato){
            //if(contrato.vigencia == vigencia){
              //var contrato_temp = {};
              //agoraRequest.get('informacion_proveedor', $.param({
                //query: "Id:" + contrato.contratista
              //})).then(function(ip_response){
                //if(ip_response.data != null){
                  //contrato_temp.informacion_proveedor = ip_response.data[0];
                  //contrato_temp.contrato = contrato;
                  //self.contratos.push(contrato_temp);
                //}
              //});
            //}
          //}
        //});
        //self.gridOptions.data = self.contratos;
        //console.log(self.contratos);
      //});
    //}


    administrativaWsoRequest.get('contrato', '/29/2017').then(function(wso_response){
      self.contratos = [wso_response.data];
      self.gridOptions.data = self.contratos;
    });


    self.gridOptions = {
      enableFiltering : true,
      enableSorting : true,
      enableRowSelection: false,
      multiSelect: false,
      enableSelectAll: false,
      columnDefs : [
        {field: 'contrato.numero_contrato_suscrito',  displayName: $translate.instant('CONTRATO'),width: 150},
        {field: 'contrato.vigencia' ,  displayName: $translate.instant('VIGENCIA_CONTRATO'),width: 160},
        {field: 'informacion_proveedor.NumDocumento',  displayName: $translate.instant('DOCUMENTO_CONTRATISTA'),width: 200},
        {field: 'informacion_proveedor.NomProveedor',  displayName: $translate.instant('NOMBRE_CONTRATISTA'),width: 390},
        {field: 'contrato.valor_contrato',  displayName:  $translate.instant('VALOR'), cellFilter: 'currency',width: 180}
      ],
      onRegisterApi : function(gridApi) {
        self.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function(row){
          self.row_c = row.entity;
          self.estado_resultado_response = 0;

          /*
          * Obtencion de datos del estado del contrato
          * Se captura el ultimo estado relacionado a un contrato
          */
          administrativaWsoRequest.get('contrato_estado', '/'+self.row_c.contrato.numero_contrato_suscrito+'/'+self.row_c.contrato.vigencia).then(function(response) {
            var estado = response.data.contratoEstado.estado;
            console.log(self.row_c.contrato.numero_contrato_suscrito, estado)
            if (estado.id != 8) {
              self.estado_contrato_obj.estado = estado.id; //guardamos el id del estado del contrato
              self.estado_resultado_response = response.status; //guardamos el status del resultado del response
            }else{
              self.estado_resultado_response = 0;
            }
          });
        });
      }
    };

  });
