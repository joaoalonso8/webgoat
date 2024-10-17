(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .directive('aonEbFileMaxSize', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: link
            };
        });

    function link(scope, element, attrs, ctrl) {
        var maxSize = undefined;
        // Monitor validation parameter changes
        attrs.$observe('aonEbFileMaxSize', function (value) {
            var sizeOpts = /^(\d*)(|B|KB|MB|GB|TB)$/i.exec(value);
            if (!sizeOpts) {
                maxSize = undefined;
            }
            maxSize = sizeOpts[1];
            if (sizeOpts.length === 3) {
                switch (sizeOpts[2].toUpperCase()) {
                    case 'KB':
                        maxSize = maxSize * 1024;
                        break;
                    case 'MB':
                        maxSize = maxSize * 1024 * 1024;
                        break;
                    case 'GB':
                        maxSize = maxSize * 1024 * 1024 * 1024;
                        break;
                    case 'TB':
                        maxSize = maxSize * 1024 * 1024 * 1024 * 1024;
                        break;
                }
            }
            ctrl.$validate();
        });
        // Add validator
        ctrl.$validators.aonEbFileMaxSize = function (modelValue, viewValue) {
            if ((maxSize === undefined) || !(modelValue instanceof File)) {
                // consider non File model to be valid
                return true;
            }
            return (modelValue.size <= maxSize);
        };
    }

})();