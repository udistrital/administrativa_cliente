'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaReinicioCtrl
 * @description
 * # SeguimientoycontrolLegalActaReinicioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaReinicioCtrl', function ($log, $scope, $routeParams, administrativaRequest) {
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
      self.contrato_obj.contratista = response.data[0].Contratista;
      self.contrato_obj.valor = response.data[0].ValorContrato;
      self.contrato_obj.objeto = response.data[0].ObjetoContrato;
      self.contrato_obj.contratante = "Universidad Distrital Francisco José de Caldas";
      self.contrato_obj.fecha_registro = response.data[0].FechaRegistro;
      self.contrato_obj.supervisor = response.data[0].Supervisor;
      $log.log(response.data);
    });

    /*
    * Funcion que observa el cambio de fechas y calcula el periodo de reinicio
    */
    $scope.$watch('f_reinicio', function(val){
      var dt1 = self.formatDate(new Date(self.contrato_obj.fecha_registro)).split('/'),
          dt2 = self.formatDate(new Date(val)).split('/');
      var one = new Date(dt1[2], dt1[1], dt1[0]),
          two = new Date(dt2[2], dt2[1], dt2[0]);

      var millisecondsPerDay = 1000 * 60 * 60 * 24;
      var millisBetween = two.getTime() - one.getTime();
      var days = millisBetween / millisecondsPerDay;

      self.diff_dias = Math.floor(days);
    });

    /*
    * Funcion para formatear las fechas obtenidas desde los formularios
    */
    self.formatDate = function(date) {
      var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [day, month, year].join('/');
    }

    self.generarActa = function(){
      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };

  });
