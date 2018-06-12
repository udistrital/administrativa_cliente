'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:NecesidadSolicitudNecesidadCtrl
 * @description
 * # NecesidadSolicitudNecesidadCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
    .controller('SolicitudNecesidadCtrl', function(administrativaRequest, $scope, agoraRequest, oikosRequest, coreAmazonRequest, financieraRequest, $translate) {
        var self = this;
        self.documentos = [];
        self.formuIncompleto = true;

        self.dep_ned = {
            JefeDependenciaSolicitante: 6
        };

        $scope.info_general = false;
        $scope.info_responsables = false;
        $scope.info_objeto = false;
        $scope.info_legal = false;
        $scope.espf = false;
        $scope.finan = false;
        self.fecha_actual = new Date();
        self.vigencia=self.fecha_actual.getFullYear();

        function validarDatos(datosPorValidar) {
            var faltanCampos = false;
            for (var dato in datosPorValidar) {
                if (datosPorValidar[dato] === undefined) {
                    faltanCampos = true;
                } else if (datosPorValidar[dato].length === 0) {
                    faltanCampos = true;
                }
            }
            return faltanCampos;
        }

        self.validar_formu = function(arrVariables, parteValidar) {
            switch (parteValidar) {
                case 0: // responsables
                    if ($scope.info_responsables) {
                        if (validarDatos(arrVariables)) {
                            $scope.info_responsables = true; // Si faltan datos mantiene abierta info_responsables
                            swal({
                                position: 'top-right',
                                type: 'error',
                                title: 'Complete todos los campos obligatorios en el formulario',
                                showConfirmButton: false,
                                timer: 2000
                            });
                        } else {
                            $scope.info_responsables = false;
                            self.formuIncompleto = false;
                        }
                    } else {
                        $scope.info_responsables = true;
                    }
                    break;

                case 1: // General
                    if ($scope.info_general) {
                        if (validarDatos(arrVariables)) {
                            $scope.info_general = true; // Si faltan datos mantiene abierta info_responsables
                            swal({
                                position: 'top-right',
                                type: 'error',
                                title: 'Complete todos los campos obligatorios en el formulario',
                                showConfirmButton: false,
                                timer: 2000
                            });
                        } else {
                            $scope.info_general = false;
                            self.formuIncompleto = false;
                        }
                    } else {
                        $scope.info_general = true;
                    }
                    break;

                case 2: // Objeto contractual
                    if ($scope.info_objeto) {
                        if (validarDatos(arrVariables)) {
                            $scope.info_objeto = true; // Si faltan datos mantiene abierta info_responsables
                            swal({
                                position: 'top-right',
                                type: 'error',
                                title: 'Complete todos los campos obligatorios en el formulario',
                                showConfirmButton: false,
                                timer: 2000
                            });
                        } else {
                            $scope.info_objeto = false;
                            self.formuIncompleto = false;
                        }
                    } else {
                        $scope.info_objeto = true;
                    }
                    break;
                case 3: // Marco legal
                    if ($scope.info_legal) {
                        $scope.info_legal = false;
                    } else {
                        $scope.info_legal = true;
                    }
                    break;
                case 4: // Especificaciones
                    if ($scope.info_espf) {
                        if (validarDatos(arrVariables)) {
                            $scope.info_espf = true; // Si faltan datos mantiene abierta info_responsables
                            swal({
                                position: 'top-right',
                                type: 'error',
                                title: 'Complete todos los campos obligatorios en el formulario',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        } else {
                            $scope.info_espf = false;
                            self.formuIncompleto = false;
                        }
                    } else {
                        $scope.info_espf = true;
                    }
                    break;
                default:
                    self.formuIncompleto = true;
                    break;
            }
        };

        $scope.$watch('solicitudNecesidad.dependencia_destino', function() {
            coreAmazonRequest.get('jefe_dependencia', $.param({
                query: "DependenciaId:" + self.dependencia_destino,
                limit: -1
            })).then(function(response2) {
                agoraRequest.get('informacion_persona_natural', $.param({
                    query: 'Id:' + response2.data[0].TerceroId,
                    limit: -1
                })).then(function(response) {
                    self.jefe_destino = response.data[0];
                    self.dep_ned.JefeDependenciaDestino = response2.data[0].Id;
                });
            });
        }, true);

        coreAmazonRequest.get('jefe_dependencia/' + self.dep_ned.JefeDependenciaSolicitante, '').then(function(response) {
            self.dependencia_solicitante_data = response.data;
        });


        $scope.$watchGroup(['solicitudNecesidad.necesidad.UnidadEjecutora', 'solicitudNecesidad.necesidad.TipoFinanciacionNecesidad'], function() {
            self.f_apropiacion_fun = [];
            self.f_apropiacion_inv = [];
        }, true);

        $scope.$watch('solicitudNecesidad.rol_ordenador_gasto', function() {
            coreAmazonRequest.get('jefe_dependencia', $.param({
                query: "DependenciaId:" + self.rol_ordenador_gasto,
                limit: -1
            })).then(function(response) {
                agoraRequest.get('informacion_persona_natural', $.param({
                    query: 'Id:' + response.data[0].TerceroId,
                    limit: -1
                })).then(function(response) {
                    self.ordenador_gasto = response.data[0];
                    self.dep_ned.OrdenadorGasto = parseInt(response.data[0].Id);
                });
            });
        }, true);

        $scope.$watch('solicitudNecesidad.especificaciones.Valor', function() {
            self.valor_iva = (self.especificaciones.Iva / 100) * self.especificaciones.Valor * self.especificaciones.Cantidad;
        }, true);

        $scope.$watch('solicitudNecesidad.especificaciones.Iva', function() {
            self.valor_iva = (self.especificaciones.Iva / 100) * self.especificaciones.Valor * self.especificaciones.Cantidad;
        }, true);

        $scope.$watch('solicitudNecesidad.especificaciones.Cantidad', function() {
            self.valor_iva = (self.especificaciones.Iva / 100) * self.especificaciones.Valor * self.especificaciones.Cantidad;
        }, true);

        $scope.$watch('solicitudNecesidad.valor_iva', function() {
            self.valor_total = (self.especificaciones.Valor * self.especificaciones.Cantidad) + self.valor_iva;
        }, true);

        coreAmazonRequest.get('snies_area', $.param({
            limit: -1,
            query: 'Estado:ACTIVO'
        })).then(function(response) {
            self.nucleo_area_data = response.data;
        });

        $scope.$watch('solicitudNecesidad.nucleoarea', function() {
            coreAmazonRequest.get('snies_nucleo_basico', $.param({
                query: 'IdArea.Id:' + self.nucleoarea,
                limit: -1
            })).then(function(response) {
                self.nucleo_conocimiento_data = response.data;
            });
        }, true);

        oikosRequest.get('dependencia', $.param({
            limit: -1,
            sortby: "Nombre",
            order: "asc",
        })).then(function(response) {
            self.dependencia_data = response.data;
        });

        coreAmazonRequest.get('ordenador_gasto', $.param({
            limit: -1,
            sortby: "Cargo",
            order: "asc",
        })).then(function(response) {
            self.ordenador_gasto_data = response.data;
        });

        oikosRequest.get('dependencia', $.param({
            query: 'Id:122',
            limit: -1
        })).then(function(response) {
            self.dependencia_solicitante = response.data[0];
        });

        agoraRequest.get('informacion_persona_natural', $.param({
            query: 'Id:52204982',
            limit: -1
        })).then(function(response) {
            self.persona_solicitante = response.data[0];
        });

        self.necesidad = {};
        self.necesidad.TipoContratoNecesidad = {};
        self.necesidad.TipoNecesidad = {
            Id: 1
        };
        self.variable = {};
        self.necesidad.UnicoPago = true;
        self.necesidad.AgotarPresupuesto = false;
        self.necesidad.Valor = 0;
        self.fecha = new Date();
        self.necesidad.DiasDuracion = 0;
        self.f_apropiacion_fun = [];
        self.f_apropiacion_inv = [];
        self.ActividadEspecifica = [];
        self.especificaciones = [];
        self.requisitos_minimos = [];
        self.actividades_economicas = [];
        self.actividades_economicas_id = [];
        self.productos = [];
        self.valor_inv = 0;
        self.valor_fun = 0;
        self.asd = [];
        self.valorTotalEspecificaciones = 0;



        self.planes_anuales = [{
            Id: 1,
            Nombre: "Necesidad1 -2017"
        }];

        financieraRequest.get('unidad_ejecutora', $.param({
            limit: -1,
            sortby: "Nombre",
            order: "asc",
        })).then(function(response) {
            self.unidad_ejecutora_data = response.data;
        });

        administrativaRequest.get('tipo_necesidad', $.param({
            limit: -1,
            sortby: "NumeroOrden",
            order: "asc",
        })).then(function(response) {
            self.tipo_necesidad_data = response.data;
        });

        agoraRequest.get('unidad', $.param({
            limit: -1,
            sortby: "Unidad",
            order: "asc",
        })).then(function(response) {
            self.unidad_data = response.data;
        });

        financieraRequest.get('iva', $.param({
            limit: -1
        })).then(function(response) {
            self.iva_data = response.data;
        });

        // function
        self.duracionEspecial = function(especial) {
            self.ver_duracion_fecha = false;
            if (especial === 'duracion') {
                self.ver_duracion_fecha = true;
                self.necesidad.UnicoPago = false;
                self.necesidad.AgotarPresupuesto = false;
            } else if (especial === "unico_pago") {
                self.necesidad.DiasDuracion = 0;
                self.necesidad.UnicoPago = true;
                self.necesidad.AgotarPresupuesto = false;
                self.ver_duracion_fecha = false;
            } else if (especial === "agotar_presupuesto") {
                self.necesidad.UnicoPago = false;
                self.necesidad.AgotarPresupuesto = true;
                self.ver_duracion_fecha = true;
            }
        };
        //

        self.calculo_total_dias = function() {
            if (self.anos === undefined) {
                self.anos = 0;
            }
            if (self.meses === undefined) {
                self.meses = 0;
            }
            if (self.dias === undefined) {
                self.dias = 0;
            }
            self.necesidad.DiasDuracion = ((parseInt(self.anos) * 360) + (parseInt(self.meses) * 30) + parseInt(self.dias));
        };
        //

        //Temporal viene dado por un servicio de javier
        agoraRequest.get('informacion_persona_natural', $.param({
            limit: -1,
            sortby: "PrimerNombre",
            order: "asc",
        })).then(function(response) {
            self.persona_data = response.data;
        });


        agoraRequest.get('parametro_estandar', $.param({
            query: "ClaseParametro:" + 'Tipo Perfil',
            limit: -1
        })).then(function(response) {
            self.parametro_estandar_data = response.data;
        });
        //-----


        administrativaRequest.get('estado_necesidad', $.param({
            query: "Nombre:Solicitada"
        })).then(function(response) {
            self.necesidad.EstadoNecesidad = response.data[0];
        });


        administrativaRequest.get('modalidad_seleccion', $.param({
            limit: -1,
            sortby: "NumeroOrden",
            order: "asc",
        })).then(function(response) {
            self.modalidad_data = response.data;
        });

        administrativaRequest.get('tipo_financiacion_necesidad', $.param({
            limit: -1
        })).then(function(response) {
            self.tipo_financiacion_data = response.data;
        });

        administrativaRequest.get('tipo_contrato_necesidad', $.param({
            limit: -1,
            query: 'Estado:true'
        })).then(function(response) {
            self.tipo_contrato_data = response.data;
        });



        self.agregar_ffapropiacion = function(apropiacion) {
            var Fap = {
                aprop: apropiacion,
                Apropiacion: apropiacion.Id,
                MontoParcial: 0,
            };

            if (self.necesidad.TipoFinanciacionNecesidad.Nombre === 'Funcionamiento') {
                // Busca si en f_apropiacion_fun ya existe el elemento que intenta agregarse, comparandolo con su id
                // si lo que devuelve filter es un arreglo mayor que 0, significa que el elemento a agregar ya existe
                // por lo tanto devuelve un mensaje de alerta
                if (self.f_apropiacion_fun.filter(function(element) {
                        return element.Apropiacion === apropiacion.Id;
                    }).length > 0) {
                    swal(
                        'Apropiación ya agregada',
                        'El rubro: <b>' + Fap.aprop.Rubro.Nombre + '</b> ya ha sido agregado',
                        'warning'
                    );
                    // Por el contrario, si el tamaño del arreglo que devuelve filter es menor a 0
                    // significa que no encontró ningún elemento que coincida con el id y agrega el objeto al arreglo
                } else {
                    self.f_apropiacion_fun.push(Fap);
                }

            } else {
                // lo mismo que el if anterior pero con f_apropiacion_inv
                if (self.f_apropiacion_inv.filter(function(element) {
                        return element.Apropiacion === apropiacion.Id;
                    }).length > 0) {
                    swal(
                        'Apropiación ya agregada',
                        'El rubro: <b>' + Fap.aprop.Rubro.Nombre + '</b> ya ha sido agregado',
                        'warning'
                    );
                } else {
                    self.f_apropiacion_inv.push(Fap);
                }
            }
        };

        self.eliminarRubro = function(rubro) {
            if (self.necesidad.TipoFinanciacionNecesidad.Nombre === 'Funcionamiento') {
                for (var i = 0; i < self.f_apropiacion_fun.length; i++) {
                    if (self.f_apropiacion_fun[i] === rubro) {
                        self.f_apropiacion_fun.splice(i, 1);
                    }
                }
            } else {
                for (var j = 0; j < self.f_apropiacion_inv.length; j++) {
                    if (self.f_apropiacion_inv[j] === rubro) {
                        self.f_apropiacion_inv.splice(j, 1);
                    }
                }
            }
        };

        self.eliminarRequisito = function(requisito) {
            for (var i = 0; i < self.requisitos_minimos.length; i++) {
                if (self.requisitos_minimos[i] === requisito) {
                    self.requisitos_minimos.splice(i, 1);
                }
            }
        };

        self.eliminarActividad = function(actividad) {
            for (var i = 0; i < self.ActividadEspecifica.length; i++) {
                if (self.ActividadEspecifica[i] === actividad) {
                    self.ActividadEspecifica.splice(i, 1);
                }
            }
        };

        $scope.$watch('solicitudNecesidad.f_apropiacion_inv', function() {
            self.valor_inv = 0;
            for (var i = 0; i < self.f_apropiacion_inv.length; i++) {
                self.f_apropiacion_inv[i].MontoParcial = 0;
                if (self.f_apropiacion_inv[i].fuentes !== undefined) {
                    for (var k = 0; k < self.f_apropiacion_inv[i].fuentes.length; k++) {
                        self.f_apropiacion_inv[i].MontoParcial += self.f_apropiacion_inv[i].fuentes[k].Monto;
                    }
                }
                self.valor_inv += self.f_apropiacion_inv[i].MontoParcial;
            }
        }, true);

        $scope.$watch('solicitudNecesidad.f_apropiacion_fun', function() {
            self.valor_fun = 0;
            for (var i = 0; i < self.f_apropiacion_fun.length; i++) {
                self.valor_fun += self.f_apropiacion_fun[i].MontoParcial;
            }
        }, true);

        $scope.$watch('solicitudNecesidad.productos', function() {
            self.valorTotalEspecificaciones = 0;
            for (var i = 0; i < self.productos.length; i++) {
                self.valorTotalEspecificaciones += ((self.productos[i].Valor * 0.19) + self.productos[i].Valor) * self.productos[i].Cantidad;
            }
        }, true);

        $scope.$watch('solicitudNecesidad.necesidad.TipoContratoNecesidad.Nombre', function() {
            if (self.necesidad.TipoContratoNecesidad.Nombre === 'Compra') {
                self.MostrarTotalEspc = true;
            } else {
                self.MostrarTotalEspc = false;
            }

            self.valorTotalEspecificaciones = 0;
            self.productos = [];
        }, true);

        self.agregarActEsp = function(actividad) {
            var a = {};
            a.Descripcion = actividad;
            self.ActividadEspecifica.push(a);
        };

        self.agregarReq = function() {
            for (var j = 0; j < self.requisitos_minimos.length; j++) {
                for (var h = 0; h < self.productos.length; h++) {
                    if (self.requisitos_minimos[j].reqi === self.productos[h].i) {
                    }
                }
            }
        };

        self.quitar_act_esp = function(i) {
            self.ActividadEspecifica.splice(i, 1);
        };

        self.submitForm = function(form) {
            if (form.$valid) {
                self.crear_solicitud();
            } else {
                swal(
                    'Faltan datos en el formulario',
                    'Completa todos los datos obligatorios del formulario',
                    'warning'
                );
            }
        };

        self.crear_solicitud = function() {
            self.marcos_legales = [];
            self.f_apropiaciones = [];


            if (self.actividades_economicas.length > 0) {
                for (var i = 0; i < self.actividades_economicas.length; i++) {
                    var Act_Economica = {};
                    Act_Economica.ActividadEconomica = self.actividades_economicas[i].Id;
                    self.actividades_economicas_id.push(Act_Economica);
                }
            }

            if (self.documentos.length > 0) {
                for (var j = 0; j < self.documentos.length; j++) {
                    var marco = {};
                    marco.MarcoLegal = self.documentos[j];
                    self.marcos_legales.push(marco);
                }
            }

            if (self.necesidad.TipoFinanciacionNecesidad.Nombre === 'Inversión') {
                if (self.valor_inv !== self.valorTotalEspecificaciones && self.necesidad.TipoContratoNecesidad.Nombre === 'Compras') {
                    swal(
                        'Error',
                        'El valor del contrato (' + self.valorTotalEspecificaciones + ') debe ser igual que el de la financiación(' + self.valor_inv + ')',
                        'warning'
                    );
                    return;
                }
                for (var h = 0; h < self.f_apropiacion_inv.length; h++) {
                    if (self.f_apropiacion_inv[h].fuentes !== undefined) {
                        for (var k = 0; k < self.f_apropiacion_inv[h].fuentes.length; k++) {
                            var f_ap = {};
                            f_ap.Apropiacion = self.f_apropiacion_inv[h].Apropiacion;
                            f_ap.MontoParcial = self.f_apropiacion_inv[h].fuentes[k].Monto;
                            f_ap.FuenteFinanciamiento = self.f_apropiacion_inv[h].fuentes[k].FuenteFinanciamiento.Id;
                            self.f_apropiaciones.push(f_ap);
                        }
                    }
                }
                self.necesidad.Valor = self.valor_inv;
            } else {
                if (self.valor_fun !== self.valorTotalEspecificaciones && self.necesidad.TipoContratoNecesidad.Nombre === 'Compras') {
                    swal(
                        'Error',
                        'El valor del contrato (' + self.valorTotalEspecificaciones + ') debe ser igual que el de la financiación(' + self.valor_fun + ')',
                        'warning'
                    );
                    return;
                }
                self.f_apropiaciones = self.f_apropiacion_fun;
                self.necesidad.Valor = self.valor_fun;
            }

            self.agregarReq();


            self.tr_necesidad = {
                Necesidad: self.necesidad,
                ActividadEspecifica: self.ActividadEspecifica,
                ActividadEconomicaNecesidad: self.actividades_economicas_id,
                MarcoLegalNecesidad: self.marcos_legales,
                Ffapropiacion: self.f_apropiaciones,
                DependenciaNecesidad: self.dep_ned,
                DetalleServicioNecesidad: self.detalle_servicio_necesidad
            };


            administrativaRequest.post("tr_necesidad", self.tr_necesidad).then(function(response) {
                self.alerta = "";
                for (var i = 1; i < response.data.length; i++) {
                    self.alerta = self.alerta + response.data[i] + "\n";
                }
                swal({
                    text: self.alerta,
                    type: response.data[0],
                    confirmButtonColor: "#449D44",
                    confirmButtonText: $translate.instant('CONFIRMAR')
                }).then(function() {
                    //si da click en ir a contratistas
                    if (response.data[0] === "success") {
                        location.href = '#/necesidades';
                    }
                });
            });
        };


    });