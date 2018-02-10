'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:AprobacionCoordinadorCtrl
 * @description
 * # AprobacionCoordinadorCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('AprobacionCoordinadorCtrl', function (oikosRequest, $http, uiGridConstants, contratoRequest, $translate, administrativaRequest, academicaWsoService, coreRequest, $q, $window, $sce, nuxeo) {
    //Variable de template que permite la edición de las filas de acuerdo a la condición ng-if
    var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"</div>';

    //Se utiliza la variable self estandarizada
    var self = this;
    self.objeto_docente = [];
    /*
      Creación tabla que tendrá todos los docentes relacionados al coordinador
    */
    self.gridOptions1 = {
      enableSorting: true,
      enableFiltering: true,
      resizable: true,
      rowHeight: 40,
      columnDefs: [{
        field: 'Persona',
        cellTemplate: tmpl,
        displayName: $translate.instant('DOCUMENTO'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
        width: "15%"
      },
      {
        field: 'Nombre',
        cellTemplate: tmpl,
        displayName: $translate.instant('NAME_TEACHER'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },

      {
        field: 'NumeroContrato',
        cellTemplate: tmpl,
        displayName: $translate.instant('NUM_VIN'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'Mes',
        cellTemplate: tmpl,
        displayName: $translate.instant('MES_SOLICITUD'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'Ano',
        cellTemplate: tmpl,
        displayName: $translate.instant('ANO_SOLICITUD'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate: '<a type="button" title="Ver soportes" type="button" class="fa fa-eye fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinador.obtener_doc(row.entity)" data-toggle="modal" data-target="#modal_ver_soportes"</a>&nbsp;' +
          '<a type="button" title="Visto bueno" type="button" class="fa fa-check fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinador.dar_visto_bueno(row.entity)"></a>&nbsp;'+
          '<a type="button" title="Rechazar" type="button" class="fa fa-close fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinador.rechazar(row.entity)"></a>',
        width: "10%"
      }
      ]
    };


    /*
      Función que permite obtener la data de la fila seleccionada
    */
    self.gridOptions1.onRegisterApi = function (gridApi) {
      self.gridApi = gridApi;
    };

    /*
    Función que al recibir el número de documento del coordinador cargue los correspondientes
    */
    self.obtener_docentes_coordinador = function () {

      self.obtener_informacion_coordinador(self.Documento);
      //Petición para obtener el Id de la relación de acuerdo a los campos
      administrativaRequest.get('pago_mensual', $.param({
        limit: 0,
        query: 'Responsable:' + self.Documento + ',EstadoPagoMensual.CodigoAbreviacion:PRC'
      })).then(function (response) {
        self.documentos = response.data;
        //self.obtener_informacion_docente();
        angular.forEach(self.documentos, function (value) {
          console.log(value);
          contratoRequest.get('informacion_contrato_elaborado_contratista', value.NumeroContrato + '/' + value.VigenciaContrato).
            then(function (response) {
              value.Nombre = response.data.informacion_contratista.nombre_completo;
            });
        });
        self.gridOptions1.data = self.documentos;
      });
    };


    /*
      Función que obtiene la información correspondiente al coordinador
    */
    self.obtener_informacion_coordinador = function (documento) {
      //Se realiza petición a servicio de academica que retorna la información del coordinador
      academicaWsoService.get('coordinador_carrera_snies', documento).
        then(function (response) {
          self.informacion_coordinador = response.data;
          console.log(self.informacion_coordinador);
          self.coordinador = self.informacion_coordinador.coordinadorCollection.coordinador[0];
         console.log(self.coordinador.nombre_coordinador);
        })
    };


    self.dar_visto_bueno = function (pago_mensual) {
      console.log(pago_mensual);
      contratoRequest.get('contrato_elaborado', pago_mensual.NumeroContrato + '/' + pago_mensual.VigenciaContrato).then(function (response) {
        self.aux_pago_mensual = pago_mensual;
        self.contrato = response.data.contrato;
        self.aux_pago_mensual.Responsable = self.contrato.supervisor.documento_identificacion;

        administrativaRequest.get('estado_pago_mensual', $.param({
          limit: 0,
          query: 'CodigoAbreviacion:PAD'
        })).then(function (responseCod) {

          var sig_estado = responseCod.data;
          self.aux_pago_mensual.EstadoPagoMensual.Id = sig_estado[0].Id;
          self.aux_pago_mensual.FechaModificacion = new Date();

          administrativaRequest.put('pago_mensual', self.aux_pago_mensual.Id, self.aux_pago_mensual).then(function (response) {

           if(response.data==="OK"){

            swal(
              'Visto bueno registrado',
              'Se ha registrado el visto bueno del cumplido',
              'success'
            )
            self.obtener_docentes_coordinador();
            self.gridApi.core.refresh();
           }else{


            swal(
              'Error',
              'No se ha podido registrar el visto bueno',
              'error'
            );
           }

          });

        })
      });

    };

    self.rechazar = function (pago_mensual) {

      contratoRequest.get('contrato_elaborado', pago_mensual.NumeroContrato + '/' + pago_mensual.VigenciaContrato).then(function (response) {
        self.aux_pago_mensual = pago_mensual;
       // self.contrato = response.data.contrato;
        //self.aux_pago_mensual.Responsable = self.contrato.supervisor.documento_identificacion;

        administrativaRequest.get('estado_pago_mensual', $.param({
          limit: 0,
          query: 'CodigoAbreviacion:RC'
        })).then(function (responseCod) {

          var sig_estado = responseCod.data;
          self.aux_pago_mensual.EstadoPagoMensual.Id = sig_estado[0].Id;
          self.aux_pago_mensual.FechaModificacion = new Date();

          administrativaRequest.put('pago_mensual', self.aux_pago_mensual.Id, self.aux_pago_mensual).then(function (response) {

            if(response.data==="OK"){

              swal(
                'Rechazo registrado',
                'Se ha registrado el rechazo del cumplido',
                'success'
              )
              self.obtener_docentes_coordinador();
              self.gridApi.core.refresh();
             }else{


              swal(
                'Error',
                'No se ha podido registrar el rechazo',
                'error'
              );
             }

          });

        })
      });

    };

    /*
      Función para ver documentos de los docentes a cargo
    */
    self.obtener_doc = function (fila){
      self.fila_sol_pago = fila;
      var nombre_docs = self.fila_sol_pago.VigenciaContrato + self.fila_sol_pago.NumeroContrato + self.fila_sol_pago.Persona + self.fila_sol_pago.Mes + self.fila_sol_pago.Ano;
      coreRequest.get('documento', $.param ({
       query: "Nombre:" + nombre_docs + ",Activo:true",
       limit:0
     })).then(function(response){
       self.documentos = response.data;
       console.log(self.documentos);
       angular.forEach(self.documentos, function(value) {
         self.descripcion_doc = value.Descripcion;
         console.log(self.descripcion_doc);
         value.Contenido = JSON.parse(value.Contenido);

         if (value.Contenido.Tipo === "Enlace") {
             value.Contenido.NombreArchivo = value.Contenido.Tipo;
         };
       });
     })
   };

   /*
     Función para visualizar enlace
   */
   self.visualizar_enlace = function (url){
     $window.open(url);
   };

   /*
     Función que permite obtener un documento de nuxeo por el Id
   */
   self.getDocumento = function(docid){
    nuxeo.header('X-NXDocumentProperties', '*');

    self.obtenerDoc = function () {
      var defered = $q.defer();

      nuxeo.request('/id/'+docid)
          .get()
          .then(function(response) {
            self.doc=response;
            var aux=response.get('file:content');
            self.document=response;
            console.log(self.document);
            defered.resolve(response);
          })
          .catch(function(error){
              defered.reject(error)
          });
      return defered.promise;
    };

    self.obtenerFetch = function (doc) {
      var defered = $q.defer();

      doc.fetchBlob()
        .then(function(res) {
          defered.resolve(res.blob());

        })
        .catch(function(error){
              defered.reject(error)
          });
      return defered.promise;
    };

      self.obtenerDoc().then(function(){

         self.obtenerFetch(self.document).then(function(r){
             self.blob=r;
             var fileURL = URL.createObjectURL(self.blob);
             console.log(fileURL);
             self.content = $sce.trustAsResourceUrl(fileURL);
             $window.open(fileURL, 'Soporte Cumplido', 'resizable=yes,status=no,location=no,toolbar=no,menubar=no,fullscreen=yes,scrollbars=yes,dependent=no,width=700,height=900', true);            
          });
      });
    };

    /*
      Función para "borrar" un documento
    */
    self.enviar_comentario = function(documento){
        swal({
          title: '¿Está seguro(a) de enviar la observación?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Aceptar'
        }).then(function () {
         documento.Contenido = JSON.stringify(documento.Contenido);
         coreRequest.put('documento', documento.Id, documento).
         then(function(response){
              console.log(documento);
              console.log(response);
              self.obtener_doc(self.fila_sol_pago);
        });

        });


    };






  });
