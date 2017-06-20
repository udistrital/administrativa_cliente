'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalCtrl
 * @description
 * # SeguimientoycontrolLegalCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalCtrl', function ($log,$location,$scope,administrativaRequest,$window,$translate) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];



    var self = this;
    self.gridOptions = {
      enableFiltering : true,
      enableSorting : true,
      enableRowSelection: false,
      multiSelect: false,
      enableSelectAll: false,
      columnDefs : [
        {field: 'Id',  displayName: $translate.instant('CONTRATO'),width: 150},
        {field: 'VigenciaContrato' ,  displayName: $translate.instant('VIGENCIA_CONTRATO'),width: 160},
        {field: 'Contratista.NumDocumento',  displayName: $translate.instant('DOCUMENTO_CONTRATISTA'),width: 200},
        {field: 'Contratista.NomProveedor',  displayName: $translate.instant('NOMBRE_CONTRATISTA'),width: 390},
        {field: 'ValorContrato',  displayName:  $translate.instant('VALOR'), cellFilter: 'currency',width: 180}
      ],
      onRegisterApi : function( gridApi ) {
        self.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function(row){
          self.row_c = row.entity;
        });
      }
    };

    administrativaRequest.get('contrato_general',"limit=0").then(function(response) {
      self.gridOptions.data = response.data;
    });

  });
