'use strict';

/**
* @ngdoc function
* @name clienteApp.controller:ResolucionVistaCtrl
* @description
* # ResolucionVistaCtrl
* Controller of the clienteApp
*/
angular.module('contractualClienteApp')
.controller('ResolucionVistaCtrl', function (administrativaRequest,oikosRequest,coreRequest,adminMidRequest,pdfMakerService,$mdDialog,$scope,$http,$translate) {

  var self=this;

  self.resolucion = JSON.parse(localStorage.getItem("resolucion"));
  if (self.resolucion.FechaExpedicion != undefined && self.resolucion.FechaExpedicion !== "0001-01-01T00:00:00Z") {
    self.resolucion.FechaExpedicion = new Date(self.resolucion.FechaExpedicion);
  }
  self.proyectos=[];

  oikosRequest.get("dependencia/proyectosPorFacultad/"+self.resolucion.IdFacultad+"/"+self.resolucion.NivelAcademico_nombre,"").then(function(response){
    self.proyectos = response.data;
  });

  adminMidRequest.get("gestion_documento_resolucion/get_contenido_resolucion", "id_resolucion="+self.resolucion.Id+"&id_facultad="+self.resolucion.IdFacultad).then(function(response){
      self.contenidoResolucion=response.data;
      if(self.resolucion.NivelAcademico_nombre === "PREGRADO"){
        adminMidRequest.get("gestion_previnculacion/docentes_previnculados_all", "id_resolucion="+self.resolucion.Id).then(function(response){
          self.contratados=response.data;
          self.generarResolucion();
        });
      }

      if(self.resolucion.NivelAcademico_nombre === "POSGRADO"){
        adminMidRequest.get("gestion_previnculacion/docentes_previnculados", "id_resolucion="+self.resolucion.Id).then(function(response){
          self.contratados=response.data;
          self.generarResolucion();
        });
      }

  });

   //Función para generar el pdf de la resolución con la información almacenada en la base de datos
  self.generarResolucion = function() {
    var documento=pdfMakerService.getDocumento(self.contenidoResolucion, self.resolucion, self.contratados, self.proyectos);
    //Se hace uso de la libreria pdfMake para generar el documento y se asigna a la etiqueta con el id vistaPDF
    pdfMake.createPdf(documento).getDataUrl(function(outDoc){
      document.getElementById('vistaPDF').src = outDoc;
    });
  };
});