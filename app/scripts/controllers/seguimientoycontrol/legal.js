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
    self.estado_contrato_obj = {};
    self.estado_resultado_response = 0;

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
          self.estado_resultado_response = 0;

          /*
          * Obtencion de datos del estado del contrato
          * Se captura el ultimo estado relacionado a un contrato
          */
          administrativaRequest.get('contrato_estado','query=numero_contrato%3A'+self.row_c.Id+'&sortby=Id&order=desc&limit=1').then(function(response) {
            var estado = response.data[0].Estado.Id;
            if (estado != 8) {
              self.estado_contrato_obj.estado = estado; //guardamos el id del estado del contrato
              self.estado_resultado_response = response.status; //guardamos el status del resultado del response
            }else{
              self.estado_resultado_response = 0;
            }
            $log.log(response.data);
          });
        });
      }
    };

    // CODIGO PARA CARGAR LAS VIGENCIAS EXISTENTES COMO OPCIONES EN EL SELECT Y MOSTRAR POR DEFECTO LA VIGENCIA DEL AÑO ACTUAL
    administrativaRequest.get('vigencia_contrato').then(function(response) {
      $scope.vigencias = response.data;
      $scope.cantidadVigencias = response.data.length;
      $scope.data = {
        availableOptions: [],
        selectedOption: {id: 0, vigencia: $scope.vigencias[0]} //This sets the default value of the select in the ui
      };
      for (var i = 0; i < $scope.cantidadVigencias; i++) {
        $scope.data.availableOptions.push({id: i, vigencia: $scope.vigencias[i]});
      }
      console.log($scope.data);

      // CODIGO PARA LISTAR LOS CONTRATOS CON VIGENCIA DEL AÑO SELECCIONADO AL CARGAR EL CONTROLADOR
      $scope.buscar_contratos_por_vigencia($scope.data.selectedOption.vigencia); //opcion seleccionada del select al cargar el controlador
    });

    //FUNCION QUE SE EJECUTA CUANDO SE SELECCIONA UNA OPCION DEL SELECT DE VIGENCIAS
    $scope.buscar_contratos = function() {
      var vigencia = $scope.data.selectedOption.vigencia;//opcion que se selecciona del select
      // alert(vigencia);
      $scope.buscar_contratos_por_vigencia(vigencia);
    }

    //FUNCION QUE NOS TRAE LOS DATOS DE LOS CONTRATOS POR LA VIGENCIA QUE RECIBE POR PARAMETRO
    $scope.buscar_contratos_por_vigencia = function(anio) {
      administrativaRequest.get('contrato_general',"query=VigenciaContrato%3A"+anio+"&limit=0").then(function(response) {
        self.gridOptions.data = response.data;
        console.log(response.data);
      });
    }
  });
