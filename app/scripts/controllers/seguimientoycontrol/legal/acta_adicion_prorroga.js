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
    $scope.response_contrato = response;
    self.contrato_obj.id = response.data[0].Id;
    self.contrato_obj.TipoContrato = response.data[0].TipoContrato.TipoContrato;
    self.contrato_obj.ObjetoContrato = response.data[0].ObjetoContrato;
    self.contrato_obj.ValorContrato = response.data[0].ValorContrato;
    self.contrato_obj.Contratista = response.data[0].Contratista;
    self.contrato_obj.PlazoEjecucion = response.data[0].PlazoEjecucion;
    self.contrato_obj.Supervisor = response.data[0].Supervisor.Nombre;
    self.contrato_obj.fecha_inicio = response.data[0].fecha_inicio;
    self.contrato_obj.FechaRegistro = response.data[0].FechaRegistro;
    self.fecha_inicio = new Date();
    // self.fecha_inicio = self.contrato_obj.fecha_inicio.substring(0, 10);
    self.contrato_obj.ValorContrato = response.data[0].ValorContrato;
    self.contrato_obj.VigenciaContrato = response.data[0].VigenciaContrato;
    
    $log.log(response.data);
  });

  //CONSULTAR LOS DATOS NoSQL
  // argoNosqlRequest.get('novedad/8/2017').then(function(response) {     
  //   $log.log(response.data[0].motivo);
  // });

  $scope.total_valor_contrato = function(evento) {
    // var valor_adicion = (evento.target.value).replace(/\,/g,''); //SE CAPTURA EL VALOR DEL INPUT POR MEDIO DEL TARGET DEL CONTROL ELIMINANDO LAS COMAS QUE TENGA
    var valor_adicion = (evento.target.value).replace(/[^0-9\.]/g,''); //SE CAPTURA EL VALOR DEL INPUT POR MEDIO DEL TARGET DEL CONTROL ELIMINANDO OTROS CARACTERES DEJANDO SOLO NUMEROS Y EL PTO DECIMAL
    var valor_contrato = parseFloat(valor_adicion) + parseFloat(self.contrato_obj.ValorContrato);
    $scope.nuevo_valor_contrato = numberFormat(String(valor_contrato));

    // alert(valor_adicion);
    $scope.valor_adicion_letras = numeroALetras(valor_adicion, {
      plural: $translate.instant('PESOS'),
      singular: $translate.instant('PESO'),
      centPlural: $translate.instant('CENTAVOS'),
      centSingular: $translate.instant('CENTAVO')
    });

    $scope.nuevo_valor_contrato_letras = numeroALetras(valor_contrato, {
      plural: $translate.instant('PESOS'),
      singular: $translate.instant('PESO'),
      centPlural: $translate.instant('CENTAVOS'),
      centSingular: $translate.instant('CENTAVO')
    });

    $scope.valor_adicion = numberFormat(valor_adicion);
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
      self.contrato_obj.NumeroCdp = "";
      $scope.valor_adicion = "";
      $scope.fecha_adicion = "";
      $scope.nuevo_valor_contrato = "";
    }else{
      //si no esta visible
      $('.panel_adicion').show("fast");
      self.contrato_obj.NumeroCdp = $scope.response_contrato.data[0].NumeroCdp;
      $scope.fecha_adicion = new Date();
    }
  }

  $scope.click_check_prorroga = function(){
    if( $('.panel_prorroga').is(":visible") ){
      //si esta visible
      $('.panel_prorroga').hide("fast");
      $scope.tiempo_prorroga = "";
      $scope.fecha_prorroga = "";
      $scope.nuevo_plazo_contrato = "";
    }else{
      //si no esta visible
      $('.panel_prorroga').show("fast");
      $scope.fecha_prorroga = new Date();
    }
  }

  $scope.estado_novedad = false;
  self.comprobar_seleccion_novedad = function(){
    if ($scope.adicion == true || $scope.prorroga == true){
      $scope.estado_novedad = true;
      if ($scope.adicion == true) {
        $('#valor_adicion').prop('required',true);
      }else{
        $('#valor_adicion').prop('required',false);
      }
      if ($scope.prorroga == true) {
        $('#tiempo_prorroga').prop('required',true);
      }else{
        $('#tiempo_prorroga').prop('required',false);
      }
    }else{
      $scope.estado_novedad = false;
    }
    if ($scope.estado_novedad == false) {
      swal('Advertencia',
           'Primero debe seleccionar un tipo de novedad!',
           'info');
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
    if ($scope.estado_novedad != false) {
      self.data_acta_adicion_prorroga = {
                                          contrato: self.contrato_obj.id,
                                          numerosolicitud: $scope.numero_solicitud,
                                          fechasolicitud: self.fecha_inicio,
                                          numerocdp: String(self.contrato_obj.NumeroCdp),
                                          valoradicion: parseFloat($scope.valor_adicion.replace(/\,/g,'')),
                                          fechaadicion: $scope.fecha_adicion,
                                          tiempoprorroga: $scope.tiempo_prorroga,
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

          swal({
            title: 'Buen trabajo!',
            type: 'success',
            html: 'Se registro exitosamente la novedad de "'+$scope.estado_novedad+'"<br>al contrato # '+self.contrato_obj.id+' del '+self.contrato_obj.VigenciaContrato+'.',
            showCloseButton: false,
            showCancelButton: false,
            confirmButtonText: '<i class="fa fa-thumbs-up"></i> Aceptar',
            allowOutsideClick: false
          }).then(function () {
            window.location.href = "#/seguimientoycontrol/legal";
          });
          $scope.estado_novedad = undefined;
        }
      });
    }
  };

  /* =========================================================
  * FUNCION PARA CONVERTIR VALORES NUMERICOS EN LETRAS
  * ========================================================== */
  var numeroALetras = (function() {
    //Código basado en https://gist.github.com/alfchee/e563340276f89b22042a
    function Unidades(num){
      switch(num)
      {
        case 1: return $translate.instant('UN');
        case 2: return $translate.instant('DOS');
        case 3: return $translate.instant('TRES');
        case 4: return $translate.instant('CUATRO');
        case 5: return $translate.instant('CINCO');
        case 6: return $translate.instant('SEIS');
        case 7: return $translate.instant('SIETE');
        case 8: return $translate.instant('OCHO');
        case 9: return $translate.instant('NUEVE');
      }
      return '';
    }//Unidades()

    function Decenas(num){
      var decena = Math.floor(num/10);
      var unidad = num - (decena * 10);

      switch(decena)
      {
        case 1:
          switch(unidad)
          {
            case 0: return $translate.instant('DIEZ');
            case 1: return $translate.instant('ONCE');
            case 2: return $translate.instant('DOCE');
            case 3: return $translate.instant('TRECE');
            case 4: return $translate.instant('CATORCE');
            case 5: return $translate.instant('QUINCE');
            case 6: return $translate.instant('DIECISEIS');
            case 7: return $translate.instant('DIECISIETE');
            case 8: return $translate.instant('DIECIOCHO');
            case 9: return $translate.instant('DIECINUEVE');
            default: return $translate.instant('DIECI') + Unidades(unidad);
          }
        case 2:
          switch(unidad)
          {
            case 0: return $translate.instant('VEINTE');
            default: return $translate.instant('VEINTI') + Unidades(unidad);
          }
        case 3: return DecenasY($translate.instant('TREINTA'), unidad);
        case 4: return DecenasY($translate.instant('CUARENTA'), unidad);
        case 5: return DecenasY($translate.instant('CINCUENTA'), unidad);
        case 6: return DecenasY($translate.instant('SESENTA'), unidad);
        case 7: return DecenasY($translate.instant('SETENTA'), unidad);
        case 8: return DecenasY($translate.instant('OCHENTA'), unidad);
        case 9: return DecenasY($translate.instant('NOVENTA'), unidad);
        case 0: return Unidades(unidad);
      }
    }//Unidades()

    function DecenasY(strSin, numUnidades) {
      if (numUnidades > 0)
        return strSin + $translate.instant('Y') + Unidades(numUnidades)
      return strSin;
    }//DecenasY()

    function Centenas(num) {
    var centenas = Math.floor(num / 100);
    var decenas = num - (centenas * 100);

      switch(centenas)
      {
        case 1:
          if (decenas > 0)
            return $translate.instant('CIENTO') + Decenas(decenas);
          return $translate.instant('CIEN');
        case 2: return $translate.instant('DOSCIENTOS') + Decenas(decenas);
        case 3: return $translate.instant('TRESCIENTOS') + Decenas(decenas);
        case 4: return $translate.instant('CUATROCIENTOS') + Decenas(decenas);
        case 5: return $translate.instant('QUINIENTOS') + Decenas(decenas);
        case 6: return $translate.instant('SEISCIENTOS') + Decenas(decenas);
        case 7: return $translate.instant('SETECIENTOS') + Decenas(decenas);
        case 8: return $translate.instant('OCHOCIENTOS') + Decenas(decenas);
        case 9: return $translate.instant('NOVECIENTOS') + Decenas(decenas);
      }
      return Decenas(decenas);
    }//Centenas()

    function Seccion(num, divisor, strSingular, strPlural) {
    var cientos = Math.floor(num / divisor)
    var resto = num - (cientos * divisor)

    var letras = '';

      if (cientos > 0)
        if (cientos > 1)
          letras = Centenas(cientos) + ' ' + strPlural;
        else
          letras = strSingular;
      if (resto > 0)
        letras += '';
      return letras;
    }//Seccion()

    function Miles(num) {
    var divisor = 1000;
    var cientos = Math.floor(num / divisor)
    var resto = num - (cientos * divisor)

    var strMiles = Seccion(num, divisor, $translate.instant('UNMIL'), $translate.instant('MIL'));
    var strCentenas = Centenas(resto);

      if(strMiles == '')
        return strCentenas;

      return strMiles + ' ' + strCentenas;
    }//Miles()

    function Millones(num) {
    var divisor = 1000000;
    var cientos = Math.floor(num / divisor)
    var resto = num - (cientos * divisor)

    var strMillones = Seccion(num, divisor, $translate.instant('UNMILLON'), $translate.instant('MILLONES'));
    var strMiles = Miles(resto);

      if(strMillones == '')
        return strMiles;

      return strMillones + ' ' + strMiles;
    }//Millones()

    return function NumeroALetras(num, currency) {
      currency = currency || {};
    var data = {
        numero: num,
        enteros: Math.floor(num),
        centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
        letrasCentavos: '',
        letrasMonedaPlural: currency.plural || $translate.instant('PESOS'),
        letrasMonedaSingular: currency.singular || $translate.instant('PESO'),
        letrasMonedaCentavoPlural: currency.centPlural || 'CHIQUI PESOS',
        letrasMonedaCentavoSingular: currency.centSingular || 'CHIQUI PESO'
      };

      if (data.centavos > 0) {
        data.letrasCentavos = $translate.instant('CON') + (function () {
          if (data.centavos == 1)
            return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
          else
            return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
        })();
      };

      if(data.enteros == 0)
        return $translate.instant('CERO') + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
      if (data.enteros == 1)
        return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
      else
        return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    };
  })();

  /* =========================================================
  * FUNCION QUE DEVUELVE UN NUMERO SEPARANDO LOS SEPARADORES DE MILES
  * PUEDE RECIBIR VALORES NEGATIVOS Y CON DECIMALES
  * ========================================================== */
  function numberFormat(numero){
    // Variable que contendra el resultado final
    var resultado = "";
    var nuevoNumero = 0;

    // Si el numero empieza por el valor "-" (numero negativo)
    if(numero[0]=="-")
    {
      // Cogemos el numero eliminando las posibles comas que tenga, y sin
      // el signo negativo
      nuevoNumero=numero.replace(/\,/g,'').substring(1);
    }else{
      // Cogemos el numero eliminando las posibles comas que tenga
      nuevoNumero=numero.replace(/\,/g,'');
    }

    // Si tiene decimales, se los quitamos al numero
    if(numero.indexOf(".")>=0)
      nuevoNumero=nuevoNumero.substring(0,nuevoNumero.indexOf("."));

    // Ponemos un punto cada 3 caracteres
    for (var j, i = nuevoNumero.length - 1, j = 0; i >= 0; i--, j++)
      resultado = nuevoNumero.charAt(i) + ((j > 0) && (j % 3 == 0)? ",": "") + resultado;

    // Si tiene decimales, se lo añadimos al numero una vez forateado con 
    // los separadores de miles
    if(numero.indexOf(".")>=0)
      resultado+=numero.substring(numero.indexOf("."));

    if(numero[0]=="-")
    {
      // Devolvemos el valor añadiendo al inicio el signo negativo
      return "-"+resultado;
    }else{
      return resultado;
    }
  }
  // document.write(""+numberFormat("-123456789.12"));
  // document.write(""+numberFormat("-1100000.23"));
});
