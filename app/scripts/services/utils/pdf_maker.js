angular.module('contractualClienteApp')
    .factory('pdfMakerService', function ($http, $translate) {
        var self = {};
        self.imagen = { imagen: "" };
        //TODO: una imagen en base64 en un archivo JSON? por qué no directo
        $http.get("scripts/models/imagen_ud.json")
            .then(function (response) {
                self.imagen = response.data;

            });
        //Función para obtener el contenido de las tablas por proyecto currícular de los docentes asociados a la resolución
        self.getCuerpoTabla = function (idProyecto, nivelAcademico, datos, columnas) {
            var cuerpo = [];
            var encabezado = [];
            if (nivelAcademico === 'POSGRADO') {
                encabezado = [{ text: $translate.instant('NOMBRE'), style: 'encabezado' }, { text: $translate.instant('TIPO_DOCUMENTO'), style: 'encabezado' }, { text: $translate.instant('CEDULA'), style: 'encabezado' }, { text: $translate.instant('EXPEDICION'), style: 'encabezado' }, { text: $translate.instant('CATEGORIA'), style: 'encabezado' }, { text: $translate.instant('DEDICACION'), style: 'encabezado' }, { text: $translate.instant('HORAS_SEMESTRALES'), style: 'encabezado' }, { text: $translate.instant('VALOR_CONTRATO'), style: 'encabezado' }, { text: $translate.instant('DISPONIBILIDAD_PDF'), style: 'encabezado' }];
            }
            if (nivelAcademico === 'PREGRADO') {
                encabezado = [{ text: $translate.instant('NOMBRE'), style: 'encabezado' }, { text: $translate.instant('TIPO_DOCUMENTO'), style: 'encabezado' }, { text: $translate.instant('CEDULA'), style: 'encabezado' }, { text: $translate.instant('EXPEDICION'), style: 'encabezado' }, { text: $translate.instant('CATEGORIA'), style: 'encabezado' }, { text: $translate.instant('DEDICACION'), style: 'encabezado' }, { text: $translate.instant('HORAS_SEMANALES'), style: 'encabezado' }, { text: $translate.instant('PERIODO_VINCULACION'), style: 'encabezado' }, { text: $translate.instant('VALOR_CONTRATO'), style: 'encabezado' }, { text: $translate.instant('DISPONIBILIDAD_PDF'), style: 'encabezado' }];
            }

            cuerpo.push(encabezado);
            if (datos) {
                datos.forEach(function (fila) {
                    //Se veriica que el docente este asociado al proyecto curricular actual
                    if (fila.IdProyectoCurricular === idProyecto) {
                        var datoFila = [];
                        columnas.forEach(function (columna) {
                            //Cada dato es almacenado como un String dentro de la matriz de la tabla
                            datoFila.push(fila[columna].toString());
                        });
                        //La fila es agregada a la tablacon los datos correspondientes
                        cuerpo.push(datoFila);
                    }
                });
            }
            return cuerpo;
        };
        //Función que devuelve en contenido de la resolución en un arreglo de estructuras
        self.getContenido = function (contenidoResolucion, resolucion, contratados, proyectos) {
            var contenido = [];
            var fechaParaPDF = "";
            var fechaExpedicion = resolucion.FechaExpedicion;
            if(typeof fechaExpedicion === "object"){
                fechaExpedicion = fechaExpedicion.toJSON();
            }
            if (fechaExpedicion == undefined || fechaExpedicion === "0001-01-01T00:00:00Z") {
                fechaParaPDF = "Fecha de expedición pendiente";
            } else {
                fechaExpedicion = fechaExpedicion.split('T')[0];
                fechaParaPDF = fechaExpedicion;
            }
            contenido.push({
                text: "UNIVERSIDAD DISTRITAL FRANCISCO JOSÉ DE CALDAS",
                style: 'titulo'
            });
            contenido.push({
                text: resolucion.FacultadNombre,
                style: 'titulo'
            });
            contenido.push({
                text: $translate.instant('RESOLUCION') + " " + 'No ' + contenidoResolucion.Numero,
                style: 'titulo'
            });
            contenido.push({
                text: "(" + fechaParaPDF + ")",
                style: 'titulo'
            });
            contenido.push({
                text: " ",
                style: 'titulo'
            });
            contenido.push({
                text: contenidoResolucion.Titulo,
                style: 'titulo_res'
            });
            contenido.push(self.getPreambuloTexto(contenidoResolucion.Preambulo));
            contenido.push({
                text: $translate.instant('CONSIDERANDO'),
                style: 'titulo'
            });
            contenido.push(self.getConsideracionTexto(contenidoResolucion.Consideracion));
            contenido.push({
                text: $translate.instant('RESUELVE'),
                style: 'titulo'
            });
            var numero = 0;
            //Se agregan artículos al documento
            if (contenidoResolucion.Articulos) {
                var index = 1;
                contenidoResolucion.Articulos.forEach(function (articulo) {
                    contenido.push(self.getArticuloTexto(articulo, numero));
                    if (index === 1) {
                        proyectos.forEach(function (proyecto) {
                            var proyectoVisible = false;
                            if (contratados) {
                                contratados.forEach(function (fila) {
                                    if (fila.IdProyectoCurricular === proyecto.Id) {
                                        proyectoVisible = true;
                                    }
                                });
                            }
                            if (proyectoVisible) {
                                contenido.push({
                                    text: proyecto.Nombre,
                                    style: 'proyecto'
                                });
                                //Definicion de los encabezados en base a las claves almacenadas dentro de la estructura de los datos
                                if (resolucion.NivelAcademico_nombre === 'PREGRADO') {
                                    contenido.push(self.getTabla(proyecto.Id, resolucion.NivelAcademico_nombre, contratados, ['NombreCompleto', 'TipoDocumento', 'IdPersona', 'LugarExpedicionCedula', 'Categoria', 'Dedicacion', 'NumeroHorasSemanales', 'NumeroMeses', 'ValorContratoFormato', 'NumeroDisponibilidad']));
                                }
                                if (resolucion.NivelAcademico_nombre === 'POSGRADO') {
                                    contenido.push(self.getTabla(proyecto.Id, resolucion.NivelAcademico_nombre, contratados, ['NombreCompleto', 'TipoDocumento', 'IdPersona', 'LugarExpedicionCedula', 'Categoria', 'Dedicacion', 'NumeroHorasSemanales', 'ValorContratoFormato', 'NumeroDisponibilidad']));
                                }
                            }

                        });
                    }
                    index++;
                    numero++;
                });
            }
            contenido.push({
                text: $translate.instant('COMUNIQUESE_Y_CUM'),
                style: 'finalizacion'
            });
            contenido.push({
                text: contenidoResolucion.OrdenadorGasto.NombreOrdenador,
                style: 'nombre_ordenador'
            });
            contenido.push({
                text: '--' + contenidoResolucion.OrdenadorGasto.Cargo + ' --',
                style: 'nombre_cargo'
            });
            contenido.push(self.getTablaRevision());
            return contenido;
        };

        //Devuelve el contenido del documento en una estrutura formato "JSON"
        self.getDocumento = function (contenidoResolucion, resolucion, contratados, proyectos) {
            var documento = {
                info: {
                    title: $translate.instant('RESOLUCION')
                },
                pageMargins: [40, 140, 40, 40],
                header: {
                    height: 120,
                    width: 120,
                    image: self.imagen.imagen,
                    margin: [100, 15, 5, 5],
                    alignment: 'center'
                },
                content: self.getContenido(contenidoResolucion, resolucion, contratados, proyectos),
                //Definición de los estilosutilizados dentro del documento
                styles: {
                    //Encabezados de las tablas
                    encabezado: {
                        fontSize: 9,
                        alignment: 'center'
                    },
                    //Contenido de las tablas
                    tabla: {
                        fontSize: 8,
                        margin: [-20, 5, -10, 0]
                    },
                    //Texto normal
                    texto: {
                        fontSize: 10,
                        margin: [30, 5],
                        alignment: 'justify',
                    },
                    //Títulos (Preámbulo, onsideración, ...)
                    titulo: {
                        bold: true,
                        fontSize: 12,
                        alignment: 'center'
                    },
                    titulo_res: {
                        bold: true,
                        fontSize: 9,
                        alignment: 'center'
                    },
                    tabla_revision: {
                        fontSize: 6,
                        alignment: 'center'
                    },        //Proyectos curriculares
                    proyecto: {
                        fontSize: 11,
                        margin: [30, 5]
                    },
                    //Nombre del ordenador del gasto
                    nombre_cargo: {
                        bold: true,
                        fontSize: 10,
                        margin: [30, 0, 30, 0],
                        alignment: 'center'
                    },
                    //Parte final de la resolución y complementos
                    finalizacion: {
                        bold: true,
                        fontSize: 12,
                        alignment: 'center'
                    },
                    pie_pagina: {
                        fontSize: 8,
                        alignment: 'center'
                    },
                    nombre_ordenador: {
                        bold: true,
                        fontSize: 10,
                        margin: [30, 50, 30, 0],
                        alignment: 'center'
                    }
                },
                //Pie de página de la resolución
                footer: function (page, pages) {
                    return {
                        columns: [
                            $translate.instant('RESOLUCION') + " " + 'No ' + contenidoResolucion.Numero + " " + resolucion.NivelAcademico_nombre + " " + resolucion.Dedicacion + " " + "2018-I" + "\n" + resolucion.FacultadNombre,
                            {
                                alignment: 'right',
                                text: [
                                    { text: page.toString(), italics: true },
                                    ' de ',
                                    { text: pages.toString(), italics: true }
                                ]
                            }
                        ],
                        margin: [10, 0],
                        style: "pie_pagina"
                    };
                },
            };
            return documento;
        };

        //Función para obtener la estructura de la tabla de contratados
        self.getTabla = function (idProyecto, nivelAcademico, datos, columnas) {
            return {
                style: 'tabla',
                table: {
                    headerRows: 1,
                    body: self.getCuerpoTabla(idProyecto, nivelAcademico, datos, columnas)
                }
            };
        };

        //Obtener tabla del final
        self.getTablaRevision = function () {
            return {
                style: 'tabla_revision',
                table: {
                    headerRows: 1,
                    widths: [80, 150, 150, 80],
                    body: [
                        ['', { text: $translate.instant('NOMBRE_COMPLETO'), style: 'tabla_revision' }, { text: $translate.instant('CARGO_PDF'), style: 'tabla_revision' }, { text: $translate.instant('FIRMA'), style: 'tabla_revision' }],
                        [{ text: $translate.instant('PROYECTO'), style: 'tabla_revision' }, '', '', ''],
                        [{ text: $translate.instant('REVISO'), style: 'tabla_revision' }, { text: 'JORGE ADELMO HERNANDEZ PARDO', style: 'tabla_revision' }, { text: $translate.instant('OF_DOCENCIA'), style: 'tabla_revision' }, ''],
                    ]
                }
            };
        };

        //Función para obtener el texto del preámbulo dentro de una estructura
        self.getPreambuloTexto = function (preambulo) {
            return {
                text: preambulo,
                style: 'texto'
            };
        };

        //Función para obtener el texto de la consideración dentro de una estructura
        self.getConsideracionTexto = function (consideracion) {
            return {
                text: consideracion,
                style: 'texto'
            };
        };

        //Funcion para obtener el texto de los artiulos consu paragrafos dentro de una estructura
        self.getArticuloTexto = function (articulo, numero) {
            var aux = [{ text: $translate.instant('ARTICULO') + " " + self.numeroALetras(numero + 1) + ' - ', bold: true }, articulo.Texto];
            if (articulo.Paragrafos !== null) {
                var numeroParagrafo = 1;
                //Cada paragrafo se inserta dentro del texto del articulo
                articulo.Paragrafos.forEach(function (paragrafo) {
                    aux.push({ text: " " + $translate.instant('PARAGRAFO') + " " + self.numeroALetras(numeroParagrafo) + ' - ', bold: true });
                    aux.push(paragrafo.Texto);
                    numeroParagrafo++;
                });
            }

            return {
                text: aux,
                style: 'texto'
            };
        };

        /*
        *Funciones para convertir numero a texto, utilizado para paragrafos y artículos
        */

        //Función que retorna las unidades del número en texto
        self.getUnidades = function (num) {
            switch (num) {
                case 1: return 'PRIMERO';
                case 2: return 'SEGUNDO';
                case 3: return 'TERCERO';
                case 4: return 'CUARTO';
                case 5: return 'QUINTO';
                case 6: return 'SEXTO';
                case 7: return 'SEPTIMO';
                case 8: return 'OCTAVO';
                case 9: return 'NOVENO';
            }
            return '';
        };

        //Función que retorna las decenas del número en texto
        self.getDecenas = function (numero) {
            var decena = Math.floor(numero / 10);
            var unidad = numero - (decena * 10);
            switch (decena) {
                case 0: return self.getUnidades(unidad);
                case 1: return 'DECIMO' + self.getUnidades(unidad);
                case 2: return 'VIGÉSIMO ' + self.getUnidades(unidad);
                case 3: return 'TRIGÉSIMO ' + self.getUnidades(unidad);
                case 4: return 'CUADRAGÉSIMO ' + self.getUnidades(unidad);
                case 5: return 'QUINCUAGÉSIMO ' + self.getUnidades(unidad);
                case 6: return 'SEXAGÉSIMO ' + self.getUnidades(unidad);
                case 7: return 'SEPTUAGÉSIMO ' + self.getUnidades(unidad);
                case 8: return 'OCTAGÉSIMO ' + self.getUnidades(unidad);
                case 9: return 'NONAGÉSIMO ' + self.getUnidades(unidad);
            }
            return '';
        };

        //Función que retorna los números de entrada en texto formato orden
        self.numeroALetras = function (numero) {
            if (numero === 0) {
                return 'CERO ';
            } else {
                return self.getDecenas(numero);
            }
        };

        //Función que retorna un número en formato monetario "99.999.999"
        self.FormatoNumero = function (amount, decimals) {

            amount += '';
            amount = parseFloat(amount.replace(/[^0-9\.]/g, ''));

            decimals = decimals || 0;

            if (isNaN(amount) || amount === 0) {
                return parseFloat(0).toFixed(decimals);
            }

            amount = '' + amount.toFixed(decimals);

            var amount_parts = amount.split('.'),
                regexp = /(\d+)(\d{3})/;

            while (regexp.test(amount_parts[0])) {
                amount_parts[0] = amount_parts[0].replace(regexp, '$1' + ',' + '$2');
            }

            return amount_parts.join('.');
        };
        return self;
    });
