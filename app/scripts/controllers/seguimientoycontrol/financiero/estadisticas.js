'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolFinancieroEstadisticasCtrl
 * @description
 * # SeguimientoycontrolFinancieroEstadisticasCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolFinancieroEstadisticasCtrl', function (contrato) {
    var self = this;
    self.contrato=contrato;
    var containerB = document.getElementById('estadistica');
          var groups = new vis.DataSet();
          groups.add({id: 0, content: "group0"})
          groups.add({id: 1, content: "group1"})

            var itemsB = [
              {x: '2016-10-11', y: 5, group:0},
              {x: '2016-11-12', y: 15, group:0},
              {x: '2017-12-13', y: 25, group:0},
              {x: '2017-01-14', y: 50, group:0},
              {x: '2017-02-15', y: 70, group:0},
              {x: '2017-03-16', y: 90, group:0},
              {x: '2016-10-11', y: 100, group:1},
              {x: '2016-11-12', y: 100, group:1},
              {x: '2016-12-13', y: 100, group:1},
              {x: '2017-01-14', y: 100, group:1},
              {x: '2017-02-15', y: 100,  group:1},
              {x: '2017-03-16', y: 100, group:1},
            ];

            var datasetB = new vis.DataSet(itemsB);
            var optionsB = {
              showCurrentTime:true,
              style:'bar',
              stack:false,
              barChart: {width:50, align:'center', stack:true}, // align: left, center, right
              drawPoints: false,
              dataAxis: {
                  icons:true
              },
              height: '300px',
              orientation:'top',
              start: '2016-09-10',
              end: '2017-05-10',
             };
    var graph2d = new vis.Graph2d(containerB, itemsB, groups, optionsB);
  });
