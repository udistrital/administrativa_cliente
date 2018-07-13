'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:RpSolicitudPersonasCtrl
 * @description
 * # RpSolicitudPersonasCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
.factory("contrato",function(){
      return {};
})
.controller('RpSolicitudPersonasCtrl', function($window, $scope, contrato,financieraRequest,administrativaRequest, $routeParams, adminMidRequest,$translate) {
    var self = this;
    var query;
    self.contrato = contrato;
    $scope.vigenciaModel = null;
    $scope.busquedaSinResultados = false;
    $scope.banderaValores = true;
    $scope.contrato_int = $translate.instant('CONTRATO');
    $scope.vigencia_contrato = $translate.instant('VIGENCIA_CONTRATO');
    $scope.contratista_nombre = $translate.instant('NOMBRE_CONTRATISTA');
    $scope.contratista_documento = $translate.instant('DOCUMENTO_CONTRATISTA');
    $scope.valor_contrato = $translate.instant('VALOR');
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
          displayName: $scope.contrato_int,
          width: "10%",
          cellTemplate: '<div align="center">{{row.entity.Id}}</div>'
        },
        {
          field: 'VigenciaContrato',
          displayName: $scope.vigencia_contrato,
          visible: false
        },
        {
          field: 'Contratista.NomProveedor',
          displayName: $scope.contratista_nombre,
          width: "50%"
        },
        {
          field: 'Contratista.NumDocumento',
          displayName: $scope.contratista_documento,
          cellTemplate: '<div align="center">{{row.entity.Contratista.NumDocumento}}</div>'
        },
        {
          field: 'ValorContrato',
          displayName: $scope.valor_contrato,
          cellTemplate: '<div align="right">{{row.entity.ValorContrato | currency }}</div>'
        },
      ],
      onRegisterApi: function(gridApi) {
        self.gridApi = gridApi;
      }
    };

    administrativaRequest.get('vigencia_contrato', datos).then(function(response) {
      $scope.vigencias = response.data;
    });

    //1 carga los contratos con vigencia 2017 al cargar el controllador
    var datos = JSON.stringify("VigenciaContrato:2017");
    adminMidRequest.post('informacion_proveedor/contratoPersona', datos).then(function(response) {
      self.gridOptions.data = response.data;
      if (response.data === null) {
        $scope.busquedaSinResultados = true;
      }
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
      self.contrato.Id = seleccion[0].Id;
      self.contrato.Vigencia= seleccion[0].VigenciaContrato;
      self.contrato.ContratistaId= seleccion[0].Contratista.NumDocumento;
      self.contrato.ValorContrato= seleccion[0].ValorContrato;
      self.contrato.NombreContratista= seleccion[0].Contratista.NomProveedor;

      self.saving = true;
      self.btnGenerartxt = "Generando...";

      self.saving = false;
      self.btnGenerartxt = "Generar";
      $window.location.href = '#/rp/rp_solicitud/';
    };
  });
