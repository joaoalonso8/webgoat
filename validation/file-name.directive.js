(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .directive('aonEbFileName', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: link
            };
        });

    function link(scope, element, attrs, ctrl) {
        var defaultRegex = /^[a-z0-9_. -]+$/i;
        var fileRegex = defaultRegex;
        // Monitor validation parameter changes
        attrs.$observe('aonEbFileName', function (value) {
            if (value) {
                try {
                    new RegExp(value);
                } catch (e) {
                    fileRegex = defaultRegex;
                }
            }
            else {
                fileRegex = defaultRegex;
            }
            ctrl.$validate();
        });
        // Add validator
        ctrl.$validators.aonEbFileName = function (modelValue, viewValue) {
            if (!(modelValue instanceof File)) {
                // consider non File model to be valid
                return true;
            }
            return (fileRegex.test(modelValue.name));
        };
    }

})();