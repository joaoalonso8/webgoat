(function () {
    "use strict";

    angular.module("app")
        .factory("entityService", ["$http", "$q", "RequestContext", EntityFactory]);

    function EntityFactory($http, $q, RequestContext) {

        var service = {
            getEntities: getEntities,
            getEntity: getEntity,
            postEntity: postEntity,
            putEntity: putEntity,
            deleteEntity: deleteEntity,
            postEntityWithRecordIDAndData: postEntityWithRecordIDAndData
        };

        return service;

        // List
        function getEntities(entityPath) {
            var deferred = $q.defer();
            $http({
                method: "GET", cache: false,
                url: RequestContext.PathAPI + entityPath
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        // Read
        function getEntity(entityPath, recordID) {
            var deferred = $q.defer();
            $http({
                method: "GET", cache: false,
                url: RequestContext.PathAPI + entityPath + "/" + recordID
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        // Create
        function postEntity(entityPath, dataObj) {
            var deferred = $q.defer();
            $http({
                method: "POST",
                url: RequestContext.PathAPI + entityPath,
                data: dataObj
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        // Update
        function putEntity(entityPath, dataObj) {
            var deferred = $q.defer();
            $http({
                method: "PUT",
                url: RequestContext.PathAPI + entityPath,
                data: dataObj
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        // Delete
        function deleteEntity(entityPath, recordID) {
            var deferred = $q.defer();
            $http({
                method: "DELETE",
                url: RequestContext.PathAPI + entityPath + "/" + recordID
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }


        // save transformation - need to split into own file
        //  $http.post(RequestContext.PathAPI + 'Flex/EtlInstance/Promote/' + InterchangeInstance_RecordID,
        function postEntityWithRecordIDAndData(entityPath, recordid, dataObj) {

            var deferred = $q.defer();
            $http.post(RequestContext.PathAPI + entityPath + recordid,
                { data: dataObj })
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }
    }
})();