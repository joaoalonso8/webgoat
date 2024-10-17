(function () {
    'use strict';

    angular
        .module('app')
        .factory('tenantService', TenantService);

    TenantService.$inject = ['$http', '$q', 'RequestContext'];

    function TenantService($http, $q, RequestContext) {

        var LogMessageStub = 'tenantService: ';

        return {
            getTenant: getTenant,
            getAllUserTenants: getAllUserTenants,
            getAllTenants: getAllTenants
        };

        function getTenant(Tenant_RecordID) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Tenant/Tenant/?id=' + Tenant_RecordID)
                .then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }

        function getAllTenants() {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Tenant/Tenant/')
                .then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }
        
        function getAllUserTenants() {
            var deferred = $q.defer();
            $http({
                method: "GET", cache: false,
                url: RequestContext.PathAPI + 'Tenants/UserTenants/'
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }
    }

})();