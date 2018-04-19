'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.colombiaHolidays
 * @description
 * # colombiaHolidays
 * Factory in the contractualClienteApp.
 */


angular.module('colombiaHolidaysService', [])
.factory('colombiaHolidaysRequest', ['$document', '$q', '$rootScope',
   function($document,$q,$rootScope) {
     var d = $q.defer();
     function onScriptLoad() {
       // Load client in the browser
       $rootScope.$apply(function() { d.resolve(window.holidays); });
     }
     var scriptTag = $document[0].createElement('script');
     scriptTag.type = 'text/javascript'; 
     scriptTag.async = true;
     scriptTag.src = 'bower_components/colombia-holidays/js/holidays.js';
     scriptTag.onreadystatechange = function () {
       if (this.readyState == 'complete') onScriptLoad();
     }
     scriptTag.onload = onScriptLoad;

     var s = $document[0].getElementsByTagName('body')[0];
     s.appendChild(scriptTag);

     return {
       colombiaHolidays: function() { return d.promise; }
     };
}]);

