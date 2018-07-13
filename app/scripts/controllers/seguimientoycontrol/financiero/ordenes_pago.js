'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolFinancieroOrdenesPagoCtrl
 * @description
 * # SeguimientoycontrolFinancieroOrdenesPagoCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolFinancieroOrdenesPagoCtrl', function (contrato) {
    var self = this;
    self.contrato=contrato;
    console.log(contrato);
    var container = document.getElementById('linea');

  // Create a DataSet (allows two way data-binding)
  var items = new vis.DataSet([
    {id: 1, content: 'OP5214', start: '2016-11-10'},
    {id: 2, content: 'OP5215', start: '2016-12-14'},
    {id: 3, content: 'OP5216', start: '2017-01-10'},
    {id: 4, content: 'OP5217', start: '2017-02-10'},
    {id: 5, content: 'OP5218', start: '2017-03-15'}
  ]);

  // Configuration for the Timeline
  var options = {
    showCurrentTime:true,
    start: '2016-10-10',
    end: '2017-05-10',
    height: '200px',
  };

  // Create a Timeline
var container = new vis.Timeline(container, items, options);
  });
