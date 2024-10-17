(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .directive('giMaxDate', ['dateUtils', function (dateUtils) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {
                    var maxDate = undefined;
                    attrs.$observe('giMaxDate', function (value) {
                        maxDate = dateUtils.isIsoDate(value) ? value : undefined;
                        ctrl.$validate();
                    });
                    ctrl.$validators.giMaxDate = function (modelValue, viewValue) {
                        return (!attrs.required && modelValue === null) || (maxDate === undefined) || (modelValue === undefined) || (modelValue <= maxDate);
                    };
                }
            };
        }]);

})();