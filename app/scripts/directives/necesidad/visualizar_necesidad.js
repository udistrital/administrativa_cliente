'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:necesidad/visualizarNecesidad
 * @description
 * # necesidad/visualizarNecesidad
 */
angular.module('contractualClienteApp')
    .directive('visualizarNecesidad', function() {
        return {
            restrict: 'E',
            scope: {
                vigencia: '=',
                numero: '='
            },
            templateUrl: 'views/directives/necesidad/visualizar_necesidad.html',
            controller: function(financieraRequest, administrativaRequest, agoraRequest, oikosRequest, coreAmazonRequest, $scope) {
                var self = this;

                $scope.$watch('[vigencia,numero]', function() {
                    self.cargar_necesidad();
                });

                self.cargar_necesidad = function() {
                    administrativaRequest.get('necesidad', $.param({
                        query: "NumeroElaboracion:" + $scope.numero + ",Vigencia:" + $scope.vigencia
                    })).then(function(response) {
                        self.v_necesidad = response.data[0];
                        administrativaRequest.get('marco_legal_necesidad', $.param({
                            query: "Necesidad:" + response.data[0].Id,
                            fields: "MarcoLegal"
                        })).then(function(response) {
                            self.marco_legal = response.data;
                        });
                        administrativaRequest.get('fuente_financiacion_rubro_necesidad', $.param({
                            query: "Necesidad:" + response.data[0].Id,
                            fields: "FuenteFinanciamiento,Apropiacion,MontoParcial"
                        })).then(function(response) {
                            var dateArrKeyHolder = [];
                            var dateArr = [];
                            angular.forEach(response.data, function(item) {
                                dateArrKeyHolder[item.Apropiacion] = dateArrKeyHolder[item.Apropiacion] || {};
                                var obj = dateArrKeyHolder[item.Apropiacion];
                                if (Object.keys(obj).length === 0) {
                                    dateArr.push(obj);
                                }

                                financieraRequest.get('apropiacion', $.param({
                                    query: "Id:" + item.Apropiacion,
                                    fields: "Rubro,Valor"
                                })).then(function(response) {
                                    obj.Apropiacion = response.data[0];
                                });

                                obj.Fuentes = obj.Fuentes || [];

                                var i_fuente = {};
                                if (self.v_necesidad.TipoFinanciacionNecesidad.Id === 1) {
                                    financieraRequest.get('fuente_financiamiento', $.param({
                                        query: "Id:" + item.FuenteFinanciamiento
                                    })).then(function(response) {
                                        i_fuente.FuenteFinanciamiento = response.data[0];
                                    });
                                    i_fuente.MontoParcial = item.MontoParcial;
                                    obj.Fuentes.push(i_fuente);
                                }
                            });
                            self.ff_necesidad = dateArr;

                        });

                        administrativaRequest.get('dependencia_necesidad', $.param({
                            query: "Necesidad:" + response.data[0].Id,
                            fields: "JefeDependenciaSolicitante,JefeDependenciaDestino,OrdenadorGasto"
                        })).then(function(response) {
                            self.dependencias = response.data[0];

                            coreAmazonRequest.get('jefe_dependencia', $.param({
                                query: 'Id:' + response.data[0].JefeDependenciaSolicitante
                            })).then(function(response) {
                                agoraRequest.get('informacion_persona_natural', $.param({
                                    query: 'Id:' + response.data[0].TerceroId
                                })).then(function(response2) {
                                    self.jefe_dependencia_solicitante = response2.data[0];
                                });
                                oikosRequest.get('dependencia', $.param({
                                    query: 'Id:' + response.data[0].DependenciaId
                                })).then(function(response3) {
                                    self.dependencia_solicitante = response3.data[0];
                                });
                            });

                            coreAmazonRequest.get('jefe_dependencia', $.param({
                                query: 'Id:' + response.data[0].JefeDependenciaDestino
                            })).then(function(response) {
                                agoraRequest.get('informacion_persona_natural', $.param({
                                    query: 'Id:' + response.data[0].TerceroId
                                })).then(function(response2) {
                                    self.jefe_dependencia_destino = response2.data[0];
                                });
                                oikosRequest.get('dependencia', $.param({
                                    query: 'Id:' + response.data[0].DependenciaId
                                })).then(function(response3) {
                                    self.dependencia_destino = response3.data[0];
                                });
                            });


                            agoraRequest.get('informacion_persona_natural', $.param({
                                query: 'Id:' + response.data[0].OrdenadorGasto
                            })).then(function(response) {
                                self.ordenador_gasto = response.data[0];
                            });


                        });
                    });
                };

            },
            controllerAs: 'd_visualizarNecesidad'
        };
    });