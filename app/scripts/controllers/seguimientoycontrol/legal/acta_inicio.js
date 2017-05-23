'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaInicioCtrl
 * @description
 * # SeguimientoycontrolLegalActaInicioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaInicioCtrl', function () {
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
        {field: 'TipoBien',  displayName: 'Tipo de Bien',width: 150},
        {field: 'Placa' ,  displayName: 'Placa',width: 160},
        {field: 'Descripcion',  displayName: 'Descripción',width: 200},
        {field: 'Sede',  displayName: 'Sede',width: 390},
        {field: 'Dependencia',  displayName: 'Dependencia', width: 150},
        {field: 'Estado',  displayName: 'Estado del Bien', width: 180},
      ],
      onRegisterApi : function( gridApi ) {
        self.gridApi = gridApi;
      }
    };
    
    self.gridOptions.data = [{"TipoBien": "Bien de Consumo", "Placa":"1234556666","Descripcion":"Teclado LED", "Sede":"Macarena A", "Dependencia": "Bienestar", "Estado":""},
    {"TipoBien": "Bien de Consumo", "Placa":"1234556667","Descripcion":"CPU X", "Sede":"Macarena A", "Dependencia": "Bienestar", "Estado":""}];

    self.generarActa = function(){
      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };


  });
