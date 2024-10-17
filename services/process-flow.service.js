(function () {
    'use strict';

    angular.module('app').service('processFlowService', ['$rootScope', processFlowService]);

    function processFlowService($rootScope) {

        /* Service */

        var service = {
            canProceed: null,
            canGoBack: null,
            proceed: null,
            goBack: null,  
            setCanProceed: setCanProceed,
            setCanGoBack: setCanGoBack,
            setProceed: setProceed,
            setGoBack: setGoBack
        };

        return service;

        /* Members */

        function setCanProceed(canProceed) {
            service.canProceed = canProceed;
        };

        function setCanGoBack(canGoBack) {
            service.canGoBack = canGoBack;
        };

        function setProceed(proceed) {
            service.proceed = proceed;
        };

        function setGoBack(goBack) {
            service.goBack = goBack;
        };
    }

})();