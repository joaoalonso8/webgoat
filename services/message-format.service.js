(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .service('aonEbMessageFormat', constructor);

    constructor.$inject = [];

    function constructor() {

        var service = {
            formatMessage: formatMessage
        };

        return service;

        function formatMessage() {
            if (arguments.length > 1) {
                var msg = arguments[0];
                var params = Array.prototype.slice.call(arguments, 1);
                return msg.replace(/{(\d+)}/g, function (match, index) {
                    return typeof params[index] != 'undefined'
                      ? params[index]
                      : match;
                });
            }
            else if (arguments.length > 0) {
                return arguments[0];
            }
            else {
                return "";
            }
        }

    }

})();