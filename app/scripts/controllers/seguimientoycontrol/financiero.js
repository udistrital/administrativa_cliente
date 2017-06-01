'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolFinancieroCtrl
 * @description
 * # SeguimientoycontrolFinancieroCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolFinancieroCtrl', function ($window, $scope, contrato,financieraRequest,administrativaRequest, $routeParams, adminMidRequest,$translate,orden,disponibilidad) {
    var self = this;
     var query;
     self.contrato = contrato;
     $scope.vigenciaModel = null;
     $scope.vigencias=null;
     $scope.busquedaSinResultados = false;
     $scope.banderaValores = true;
     $scope.fields = {
       numcontrato: '',
       vigcontrato: '',
       contratistadocumento: '',
       valorcontrato: ''
     };

     self.gridOptions = {
       enableRowSelection: true,
       enableRowHeaderSelection: false,
       enableSorting: true,
       enableFiltering: true,
       multiSelect: false,
       columnDefs: [{
           field: 'Id',
           displayName: $translate.instant('CONTRATO'),
           width: "10%",
           cellTemplate: '<div align="center">{{row.entity.Id}}</div>'
         },
         {
           field: 'VigenciaContrato',
           displayName: $translate.instant('VIGENCIA_CONTRATO'),
           visible: false
         },
         {
           field: 'Contratista.NomProveedor',
           displayName: $translate.instant('NOMBRE_CONTRATISTA'),
           width: "50%"
         },
         {
           field: 'Contratista.NumDocumento',
           displayName: $translate.instant('DOCUMENTO_CONTRATISTA'),
           cellTemplate: '<div align="center">{{row.entity.Contratista.NumDocumento}}</div>'
         },
         {
           field: 'ValorContrato',
           displayName: $translate.instant('VALOR'),
           cellTemplate: '<div align="right">{{row.entity.ValorContrato | currency }}</div>'
         },
       ],
       onRegisterApi: function(gridApi) {
         self.gridApi = gridApi;
       }
     };

     administrativaRequest.get('vigencia_contrato').then(function(response) {
       $scope.vigencias = response.data;

     //selecciona la vigencia actual
     var vigenciaActual=$scope.vigencias[0];

     //carga los contratos con la vigencia actual
     administrativaRequest.get('contrato_general', $.param({
         query: "VigenciaContrato:"+vigenciaActual,
         limit: -1
       })).then(function(response) {
         self.gridOptions.data = response.data;
       });
     });
     //se buscan los contratos por la vigencia seleccionada
     self.buscarContratosVigencia = function() {
       query = "";
       if ($scope.vigenciaModel !== undefined || $scope.vigenciaModel === null) {
         query = query + "VigenciaContrato:" + $scope.vigenciaModel;
         var datos = JSON.stringify(query);

         adminMidRequest.post('informacion_proveedor/contratoPersona', datos).then(function(response) {
           self.gridOptions.data = response.data;
           if (response.data === null) {
             $scope.busquedaSinResultados = true;
           }
         });

       }
     };

     self.mostrar_estadisticas = function() {
       var seleccion = self.gridApi.selection.getSelectedRows();
       if(seleccion[0]===null || seleccion[0]===undefined){
         swal("Alertas", "Debe seleccionar un contratista", "error");
       }else{
         self.contrato.Id = seleccion[0].Id;
         self.contrato.Vigencia= seleccion[0].VigenciaContrato;
         self.contrato.ContratistaId= seleccion[0].Contratista.NumDocumento;
         self.contrato.ValorContrato= seleccion[0].ValorContrato;
         self.contrato.NombreContratista= seleccion[0].Contratista.NomProveedor;
         self.contrato.ObjetoContrato= seleccion[0].ObjetoContrato;
         self.contrato.FechaRegistro= seleccion[0].FechaRegistro;

         self.saving = true;
         self.btnGenerartxt = "Generando...";

         self.saving = false;
         self.btnGenerartxt = "Generar";
         $window.location.href = '#/seguimientoycontrol/financiero/contrato';
       }

 };
  });