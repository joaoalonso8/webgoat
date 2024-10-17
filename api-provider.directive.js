(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .directive('aonEbApiProvider', function () {
            return {
                restrict: 'EA',
                bindToController: {
                    api: '<aonEbApiProvider'
                },
                controller: function () { }
            };
        });

})();