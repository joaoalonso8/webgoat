(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .service('flexContext', constructor);

    constructor.$inject = ['RequestContext', '$http'];

    function constructor(RequestContext, $http) {

        var service = {
            init: init
        };

        return service;

        function init() {
            console.log("Loading context");
            return $http.get(RequestContext.PathAPI + 'Flex/Context/').then(function (response) {
                var data = response.data;
                data.Tenant.IsCommonTenant = (data.Tenant.CommonTenant_RecordID === data.Tenant.RecordID);
                angular.merge(service, data);
                console.log("Context successfully loaded");
                return;
            })
            .catch(function (error) {
                console.log("Error loading context");
                throw error;
            });
        }
    }

})();