(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .directive('giMinDate', ['dateUtils', function (dateUtils)  {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {
                    var minDate = undefined;
                    attrs.$observe('giMinDate', function (value) {
                        minDate = dateUtils.isIsoDate(value) ? value : undefined;
                        ctrl.$validate();
                    });
                    ctrl.$validators.giMinDate = function (modelValue, viewValue) {
                        return (!attrs.required && modelValue === null) || (minDate === undefined) || (modelValue === undefined) || (modelValue >= minDate);
                    };
                }
            };
        }]);

})();