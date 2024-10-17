(function () {
    'use strict';

    angular.module('app').factory('EnvironmentSettingsFactory', ['$http', '$q', 'RequestContext', 'localStorageService', EnvironmentSettingsFactory]);

    function EnvironmentSettingsFactory($http, $q, RequestContext, localStorageService) {

        var service = {
            GetSettings: getSettings
        };

        return service;

        function getOrigin() {
            var origin = null;
            if (localStorageService.isSupported) {
                var value = localStorageService.get('originKey');
                if (value) {
                    origin = value;
                } else {
                    localStorageService.set('originKey', RequestContext.Referrer);
                    origin = RequestContext.Referrer;
                }
            } else {
                var cookieValue = localStorageService.cookie.get('originKey');
                if (cookieValue) {
                    origin = cookieValue;
                } else {
                    if (RequestContext.Referrer != null) {
                        localStorageService.cookie.set('originKey', RequestContext.Referrer);
                        origin = RequestContext.Referrer;
                    }
                }
            }
            return origin;
        }

        function getSettings() {
            var deferred = $q.defer();
            var url = RequestContext.PathAPI + 'Lookup/EnvironmentSettings';

            var origin = getOrigin();

            if (origin != null)
                url += "?referrer=" + RequestContext.Referrer;
            $http.get(url, {
                cache: true,
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }


    }

})();