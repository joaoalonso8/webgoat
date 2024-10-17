(function () {
    'use strict';

    var module = angular.module('aon.eb.common');

    module.filter('aonEbDate', ['dateUtils', function (dateUtils) {
        return function (value, format) {
            return dateUtils.format(value, format);
        };
    }]);
})();