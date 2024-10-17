(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .service('uiUtils', ['$timeout', '$location', '$anchorScroll', constructor]);

    /**
     * UIUtils provides helper functions to ui related functions
     */
    function constructor($timeout, $location, $anchorScroll) {

        var service = {
            scrollToAnchor: scrollToAnchor           
        };

        return service;

        function scrollToAnchor(anchor) {
            $timeout(function () {
                var old = $location.hash();
                $location.hash(anchor);
                $anchorScroll();
                $location.hash(old);
            }, 350);
        }      
    }

})();