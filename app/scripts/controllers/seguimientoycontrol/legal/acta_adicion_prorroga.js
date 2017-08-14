'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaAdicionProrrogaCtrl
 * @description
 * # SeguimientoycontrolLegalActaAdicionProrrogaCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaAdicionProrrogaCtrl', function ($log, $scope, $routeParams, administrativaRequest,$translate,argoNosqlRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    self.contrato_id = $routeParams.contrato_id;
    self.contrato_obj = {};

    /*
    * Obtencion de datos del contrato del servicio
    */
    administrativaRequest.get('contrato_general',$.param({
      query: "Id:" + self.contrato_id
    })).then(function(response) {
      self.contrato_obj.id = response.data[0].Id;
      self.contrato_obj.TipoContrato = response.data[0].TipoContrato.TipoContrato;
      self.contrato_obj.ObjetoContrato = response.data[0].ObjetoContrato;
      self.contrato_obj.ValorContrato = response.data[0].ValorContrato;
      self.contrato_obj.Contratista = response.data[0].Contratista;
      self.contrato_obj.PlazoEjecucion = response.data[0].PlazoEjecucion;
      self.contrato_obj.Supervisor = response.data[0].Supervisor.Nombre;
      self.contrato_obj.FechaRegistro = response.data[0].FechaRegistro;
      self.fecha_inicio = self.contrato_obj.FechaRegistro.substring(0, 10);
      self.contrato_obj.NumeroCdp = response.data[0].NumeroCdp;
      self.contrato_obj.ValorContrato = response.data[0].ValorContrato;
      self.contrato_obj.VigenciaContrato = response.data[0].VigenciaContrato;
      
      $log.log(response.data);
    });

    //CONSULTAR LOS DATOS NoSQL
    // argoNosqlRequest.get('novedad/8/2017').then(function(response) {     
    //   $log.log(response.data[0].motivo);
    // });

    $scope.total_valor_contrato = function(evento) {
      var valor_adicion = evento.target.value; //SE CAPTURA EL VALOR DEL INPUT POR MEDIO DEL TARGET DEL CONTROL
      var valor_contrato = parseInt(valor_adicion) + parseInt(self.contrato_obj.ValorContrato);
      $scope.nuevo_valor_contrato = valor_contrato;
    }

    $scope.total_plazo_contrato = function(evento) {
      var valor_prorroga = evento.target.value; //SE CAPTURA EL VALOR DEL INPUT POR MEDIO DEL TARGET DEL CONTROL
      var plazo_actual_dias = parseInt(self.contrato_obj.PlazoEjecucion) * (30);
      var valor_plazo_dias = parseInt(valor_prorroga) + plazo_actual_dias;
      var valor_plazo_meses = valor_plazo_dias / (30);
      $scope.nuevo_plazo_contrato = valor_plazo_meses;
    }

    $scope.click_check_adicion = function(){
      if( $('.panel_adicion').is(":visible") ){
        //si esta visible
        $('.panel_adicion').hide("fast");
      }else{
        //si no esta visible
        $('.panel_adicion').show("fast");
      }
    }

    $scope.click_check_prorroga = function(){
      if( $('.panel_prorroga').is(":visible") ){
        //si esta visible
        $('.panel_prorroga').hide("fast");
      }else{
        //si no esta visible
        $('.panel_prorroga').show("fast");
      }
    }

    self.generarActa = function(){
      if ($scope.adicion) {
        $scope.estado_novedad = "Adición";
      }
      if ($scope.prorroga) {
        $scope.estado_novedad = "Prorroga";
      }if ($scope.adicion == true && $scope.prorroga == true){
        $scope.estado_novedad = "Adición y Prorroga";
      }
      if ($scope.estado_novedad != undefined) {
        self.data_acta_adicion_prorroga = {
                                            contrato: self.contrato_obj.id,
                                            numerosolicitud: $scope.numero_solicitud,
                                            fechasolicitud: $scope.FechaRegistro,
                                            numerocdp: String(self.contrato_obj.NumeroCdp),
                                            valoradicion: parseInt($scope.valor_adicion),
                                            fechaadicion: $scope.fecha_adicion,
                                            tiempoprorroga: parseInt($scope.tiempo_prorroga),
                                            fechaprorroga: $scope.fecha_prorroga,
                                            vigencia: String(self.contrato_obj.VigenciaContrato),
                                            motivo: $scope.motivo
                                          }
        // alert(JSON.stringify(self.data_acta_adicion_prorroga));
        argoNosqlRequest.post('novedad', self.data_acta_adicion_prorroga).then(function(request){
          console.log(request);
          if (request.status == 200) {
            swal('Buen trabajo!',
                 'Se registro exitosamente la novedad de "'+$scope.estado_novedad+'"<br>al contrato # '+self.contrato_obj.id+' del '+self.contrato_obj.VigenciaContrato+'.',
                 'success');
            $scope.estado_novedad = undefined;
          }
        });
      }else{
        swal('Advertencia',
             'Primero debe seleccionar un tipo de novedad!',
             'info');
      }
    };
  });
