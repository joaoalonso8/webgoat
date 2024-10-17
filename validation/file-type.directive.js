(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .directive('aonEbFileTypes', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: link
            };
        });

    function link(scope, element, attrs, ctrl) {
        var types = undefined;
        // Monitor validation parameter changes
        attrs.$observe('aonEbFileTypes', function (value) {
            types = (value.length > 0) ? value.split(',') : undefined;
            ctrl.$validate();
        });
        // Add validator
        ctrl.$validators.aonEbFileTypes = function (modelValue, viewValue) {
            if ((types === undefined) || !(modelValue instanceof File)) {
                // Consider empty types or non File model value to be valid
                return true;
            }
            // Get extension
            var name = modelValue.name;
            var ext = name.substring(name.lastIndexOf('.')).toLowerCase();
            // Match with list of valid types
            var match = _.find(types, function (type) {
                return ext === type.trim();
            });
            return (match !== undefined);
        };
    }

})();