'use strict';
/**
 * @ngdoc function
 * @name contractualClienteApp.controller:menuCtrl
 * @description
 * # menuCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
.controller('menuCtrl', function($location, $http, $scope, token_service, notificacion, $translate, $route, $mdSidenav) {
    var paths = [];
    $scope.language = {
        es:"btn btn-primary btn-circle btn-outline active",
        en:"btn btn-primary btn-circle btn-outline"
    };

    $scope.notificacion = notificacion;
    $scope.actual = "";
    $scope.token_service = token_service;
    $scope.breadcrumb = [];

            $scope.menu_app = [{
                id: "kronos",
                title: "KRONOS",
                url: "http://10.20.0.254/kronos"
            },
            {
                id: "agora",
                title: "AGORA",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/agora"
            }, {
                id: "argo",
                title: "ARGO",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/argo"
            }, {
                id: "arka",
                title: "ARKA",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/arka"
            }, {
                id: "temis",
                title: "TEMIS",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/gefad"
            }, {
                id: "polux",
                title: "POLUX",
                url: "http://10.20.0.254/polux"
            }, {
                id: "jano",
                title: "JANO",
                url: "http://10.20.0.254/kronos"
            }, {
                id: "kyron",
                title: "KYRON",
                url: "http://10.20.0.254/kronos"
            }, {
                id: "sga",
                title: "SGA",
                url: "http://10.20.0.254/kronos"
            }
        ];

    $scope.menu_service = [
      { //aqui va el servicio de el app de configuracion
        "Id": 3,
        "Nombre": "Seguimiento y control",
        "Url": "url_nivel_1",
        "Opciones": [
        {
          "Id": 1,
          "Nombre": "Segumiento Financiero",
          "Url": "seguimientoycontrol/financiero",
          "Opciones": null
        },
        {
          "Id": 2,
          "Nombre": "Segumiento Legal",
          "Url": "seguimientoycontrol/legal",
          "Opciones": null
        },
        {
          "Id": 3,
          "Nombre": "Segumiento Tecnico",
          "Url": "",
          "Opciones": null
        }
      ]
      },
    { //aqui va el servicio de el app de configuracion
      "Id": 2,
      "Nombre": "Necesidad",
      "Url": "url_nivel_1",
      "Opciones": [{
        "Id": 3,
        "Nombre": "Solicitud de Necesidad",
        "Url": "necesidad/solicitud_necesidad",
        "Opciones": null
      },
      {
        "Id": 4,
        "Nombre": "Gestion de Necesidades",
        "Url": "necesidades",
        "Opciones": null
      }]
    },
    { //RP
      "Id": 1,
      "Nombre": "RP",
      "Url": "",
      "Opciones": [
        { //Consulta de solicitud de RP
          "Id": 1,
          "Nombre": "Solicitar registro presupuestal",
          "Url": "rp_solicitud_personas",
          "Opciones": null
        }
      ]
    }
  ];

          function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            };
        }

        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');
  

    var recorrerArbol = function(item, padre) {
      var padres = "";
      for (var i = 0; i < item.length; i++) {
        if (item[i].Opciones === null) {
          padres = padre + " , " + item[i].Nombre;
          paths.push({
            'path': item[i].Url,
            'padre': padres.split(",")
          });
        } else {
          recorrerArbol(item[i].Opciones, padre + "," + item[i].Nombre);
        }
      }
      return padres;
    };



    var update_url = function() {
      $scope.breadcrumb = [''];
      for (var i = 0; i < paths.length; i++) {
        if ($scope.actual === "/" + paths[i].path) {
          $scope.breadcrumb = paths[i].padre;
        } else if ('/' === $scope.actual) {
          $scope.breadcrumb = [''];
        }
      }
    };
    recorrerArbol($scope.menu_service, "");
    paths.push({padre:["","Notificaciones","Ver Notificaciones"],path:"notificaciones"});

    $scope.$on('$routeChangeStart', function(next, current) {
      $scope.actual = $location.path();
      update_url();
    });

    $scope.changeLanguage = function (key){
        $translate.use(key);
        switch (key) {
            case 'es':
                $scope.language.es = "btn btn-primary btn-circle btn-outline active";
                $scope.language.en = "btn btn-primary btn-circle btn-outline";
                break;
            case 'en':
                $scope.language.en = "btn btn-primary btn-circle btn-outline active";
                $scope.language.es = "btn btn-primary btn-circle btn-outline";
                break;
            default:
        }
        $route.reload();
    };
    //Pendiente por definir json del menu
    (function($) {
      $(document).ready(function() {
        $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          $(this).parent().siblings().removeClass('open');
          $(this).parent().toggleClass('open');
        });
      });
    })(jQuery);
  });
