'use strict';

/**
 * @ngdoc function
 * @name clienteApp.controller:ContratoRegistroCancelarCtrl
 * @description
 * # ContratoRegistroCancelarCtrl
 * Controller of the clienteApp
 */

angular.module('contractualClienteApp')
    .controller('ContratoRegistroCancelarCtrl', function (amazonAdministrativaRequest, administrativaRequest, adminMidRequest, oikosRequest, coreAmazonRequest, financieraRequest, sicapitalRequest, idResolucion, colombiaHolidaysService, $scope, $mdDialog, lista, resolucion, $translate, $window) {

        var self = this;
        self.contratoCanceladoBase = {};
        self.idResolucion = idResolucion;
        self.estado = false;
        self.cantidad = 0;
        self.maximoSemanas = 0;
        self.semanasTranscurridas = 0;
        var dias = 0;
        var decimal = 0;
        var semanasDecimal = 0;
        self.fechaActa = new Date();
        var diasTotales = 0;
        self.fecha_actual = new Date();
        self.fechaFinal = new Date();
        self.esconderBoton = false;
        self.FechaExpedicion = null;

        administrativaRequest.get('resolucion/' + self.idResolucion).then(function (response) {
            self.resolucionActual = response.data;
            if (self.resolucionActual.FechaExpedicion != undefined && self.resolucionActual.FechaExpedicion !== "0001-01-01T00:00:00Z") {
                self.FechaExpedicion = new Date(self.resolucionActual.FechaExpedicion);
            }
            self.maximoSemanas = self.resolucionActual.NumeroSemanas;
            return administrativaRequest.get('tipo_resolucion/' + self.resolucionActual.IdTipoResolucion.Id);
        }).then(function (response) {
            self.resolucionActual.IdTipoResolucion.NombreTipoResolucion = response.data.NombreTipoResolucion;
        });


        administrativaRequest.get("resolucion_vinculacion_docente/" + self.idResolucion).then(function (response) {
            self.datosFiltro = response.data;

            oikosRequest.get("dependencia/" + self.datosFiltro.IdFacultad.toString()).then(function (response) {
                self.sede_solicitante_defecto = response.data.Nombre;
            });


            adminMidRequest.get("gestion_desvinculaciones/docentes_cancelados", "id_resolucion=" + self.idResolucion.toString()).then(function (response) {
                self.contratados = response.data;
                var yeison = JSON.parse(JSON.stringify(self.contratados));
                self.cantidad = Object.keys(yeison).length;
            });
            coreAmazonRequest.get("ordenador_gasto", "query=DependenciaId%3A" + self.datosFiltro.IdFacultad.toString()).then(function (response) {
                if (response.data === null) {
                    coreAmazonRequest.get("ordenador_gasto/1").then(function (response) {
                        self.ordenadorGasto = response.data;
                    });
                } else {
                    self.ordenadorGasto = response.data[0];
                }
            });
        });

        self.cancelarExpedicion = function () {
            $mdDialog.hide();
        };


        self.asignarValoresDefecto = function () {
            self.contratoCanceladoBase.Usuario = "";
            self.contratoCanceladoBase.Estado = true;
        };

        self.cancelar = function () {
            $mdDialog.hide();
        };

        self.cancelarContrato = function () {
            self.asignarValoresDefecto();
            self.fechaCancelacion = self.fechaActaInicio();
            if (self.FechaExpedicion && self.semanasReversar && self.contratoCanceladoBase.MotivoCancelacion) {
                swal({
                    title: $translate.instant('EXPEDIR'),
                    text: $translate.instant('SEGURO_EXPEDIR'),
                    html: '<p><b>' + $translate.instant('NUMERO') + ': </b>' + resolucion.Numero.toString() + '</p>' +
                        '<p><b>' + $translate.instant('FACULTAD') + ': </b>' + resolucion.Facultad + '</p>' +
                        '<p><b>' + $translate.instant('NIVEL_ACADEMICO') + ': </b>' + resolucion.NivelAcademico + '</p>' +
                        '<p><b>' + $translate.instant('DEDICACION') + ': </b>' + resolucion.Dedicacion + '</p>' +
                        '<p><b>' + $translate.instant('NUMERO_CANCELACIONES') + ': </b>' + self.cantidad + '</p>' +
                        '<p><b>' + $translate.instant('FECHA_FIN_ACTA') + ': </b>' + self.fechaCancelacion + '</p>',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: $translate.instant('ACEPTAR'),
                    cancelButtonText: $translate.instant('CANCELAR'),
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false,
                    allowOutsideClick: false
                }).then(function () {
                    if (self.FechaExpedicion && self.semanasReversar && self.contratoCanceladoBase.MotivoCancelacion) {
                        self.expedirCancelar();
                    } else {
                        swal({
                            text: $translate.instant('COMPLETE_CAMPOS'),
                            type: 'error'
                        });
                    }
                }, function (dismiss) {
                    if (dismiss === 'cancel') {
                        swal({
                            text: $translate.instant('EXPEDICION_NO_REALIZADA'),
                            type: 'error'
                        });
                    }
                });
            } else {
                swal({
                    text: $translate.instant('COMPLETE_CAMPOS'),
                    type: 'warning'
                });
            }
        };

        self.expedirCancelar = function () {
            self.estado = true;
            self.esconderBoton = true;
            var conjuntoContratos = [];
            if (self.contratados) {
                self.contratados.forEach(function (contratado) {
                    var contratoCancelado = JSON.parse(JSON.stringify(self.contratoCanceladoBase));
                    contratoCancelado.FechaCancelacion = self.fechaUtc(self.fechaCancelacion);
                    contratoCancelado.NumeroContrato = contratado.NumeroContrato.String;
                    contratoCancelado.Vigencia = contratado.Vigencia.Int64;
                    var CancelacionContrato = {
                        ContratoCancelado: contratoCancelado,
                        VinculacionDocente: { Id: parseInt(contratado.Id) }
                    };
                    conjuntoContratos.push(CancelacionContrato);
                });
                var expedicionResolucion = {
                    Vinculaciones: conjuntoContratos,
                    idResolucion: self.idResolucion,
                    FechaExpedicion: self.FechaExpedicion
                };
                adminMidRequest.post("expedir_resolucion/cancelar", expedicionResolucion).then(function () {
                    self.estado = false;
                    swal({
                        title: $translate.instant('EXPEDIDA'),
                        text: $translate.instant('DATOS_CANCELADOS'),
                        type: 'success',
                        confirmButtonText: $translate.instant('ACEPTAR'),
                        allowOutsideClick: false
                    }).then(function () {
                        $window.location.reload();
                    });
                });
            } else {
                swal({
                    text: $translate.instant('NO_DOCENTES'),
                    title: "Alerta",
                    type: "warning",
                    confirmButtonText: $translate.instant('ACEPTAR'),
                    showLoaderOnConfirm: true,
                    allowOutsideClick: false
                });
            }
        };

        self.cancelados = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableSorting: true,
            enableFiltering: true,
            enableRowSelection: false,
            enableRowHeaderSelection: false,
            columnDefs: [
                { field: 'NombreCompleto', width: '22%', displayName: $translate.instant('NOMBRE') },
                { field: 'IdPersona', width: '13%', displayName: $translate.instant('DOCUMENTO_DOCENTES') },
                { field: 'Categoria', width: '10%', displayName: $translate.instant('CATEGORIA') },
                { field: 'NumeroHorasSemanales', width: '15%', displayName: $translate.instant('HORAS_SEMANALES') },
                { field: 'NumeroSemanas', width: '10%', displayName: $translate.instant('SEMANAS') },
                { field: 'NumeroDisponibilidad', width: '15%', displayName: $translate.instant('NUM_DISPO_DOCENTE') },
                { field: 'ValorContrato', width: '15%', displayName: $translate.instant('VALOR_CONTRATO'), cellClass: "valorEfectivo", cellFilter: "currency" }
            ]
        };

        //Función para visualizar docentes para cancelar su vinculacion resolución
        self.get_docentes_cancelados = function () {
            self.estado = true;
            self.info_desvincular = !self.info_desvincular;
            adminMidRequest.get("gestion_desvinculaciones/docentes_cancelados", "id_resolucion=" + self.idResolucion).then(function (response) {
                self.cancelados.data = response.data;
                amazonAdministrativaRequest.get("acta_inicio", $.param({
                    query: 'NumeroContrato:' + self.cancelados.data[0].NumeroContrato.String + ',Vigencia:' + self.cancelados.data[0].Vigencia.Int64
                })).then(function (response) {
                    self.acta = response.data[0];
                    self.fechaIni = new Date(self.acta.FechaInicio);
                    self.fechaActa = self.fechaUtc(self.fechaIni);
                    self.calculoSemanas();
                    self.maximoSemanas = self.maximoSemanas - self.semanasTranscurridas;
                    self.estado = false;
                });
            });
        };

        self.get_docentes_cancelados();

        //Función para convertir las fechas a UTC declaradas desde el cliente (Las que vengan por gets corregirlas desde los apis)
        self.fechaUtc = function (fecha) {
            var _fechaConUtc = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), fecha.getUTCHours(), fecha.getUTCMinutes(), fecha.getUTCSeconds());
            return _fechaConUtc;
        };

        //Función para hacer el cálculo de semanas para la vinculación docente
        self.calculoSemanas = function () {
            dias = (self.fechaUtc(self.fecha_actual) - self.fechaActa) / 1000 / 60 / 60 / 24;
            semanasDecimal = dias / 7;
            decimal = semanasDecimal % 1;
            self.semanasTranscurridas = semanasDecimal - decimal;
            if (decimal > 0) {
                self.semanasTranscurridas = self.semanasTranscurridas + 1;
            }
        };

        //Se calcula la fecha de cancelación (fin) del acta inicio a partir de la fecha inicio de la misma y las semanas insertadas
        self.fechaActaInicio = function () {
            self.semanasRev = self.resolucionActual.NumeroSemanas - self.semanasReversar;
            diasTotales = self.semanasRev * 7;
            self.fechaFinal = new Date(self.acta.FechaInicio);
            self.fechaFinal = self.fechaUtc(self.fechaFinal);
            self.fechaFinal.setDate(self.fechaFinal.getDate() + diasTotales);
            return self.fechaFinal;
        };
        $scope.validarFecha = colombiaHolidaysService.validateDate;
    });
