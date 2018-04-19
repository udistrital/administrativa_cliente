
angular.module('contractualClienteApp')
    .directive('fechaValida', ['$q', 'colombiaHolidaysRequest', function ($q, colombiaHolidays) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$asyncValidators.fechaValida = function (modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return true;
                    }
                    var def = $q.defer();

                    colombiaHolidays.colombiaHolidays().then(function (colombiaHolidays) {
                        if(viewValue.getDay() == 0 || viewValue.getDay() == 6) {
                            def.reject();
                            return def.promise;
                        } 
                        var myHolidays = colombiaHolidays.getColombiaHolidaysByYear(viewValue.getFullYear());
                        strDate = viewValue.toJSON().split('T')[0];
                        for (var i = 0; i < myHolidays.length; i++) {
                            if (myHolidays[i].holiday == strDate) {
                                def.reject();
                                return;
                            }
                        }
                        def.resolve();

                    });
                    return def.promise;
                };
            }
        };
    }]);