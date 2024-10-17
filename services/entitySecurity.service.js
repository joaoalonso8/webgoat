(function () {
    'use strict';

    angular.module ('app').factory ('entitySecurityService', EntitySecurityService);

    EntitySecurityService.$inject = ['$http', '$q', 'giConstant', 'RequestContext'];
     
    function EntitySecurityService($http, $q, giConstant, RequestContext) {
         
        var service = {
            checkEntitySecurity: checkEntitySecurity,
            getEntitySecurity: getEntitySecurity,
            getAllEntitySecurity: getAllEntitySecurity
        };

        return service;

        function checkEntitySecurity(entityName, privilege) {

            // Check if entity security cache exists; if not >> call and build from api
            return getEntitiesForAuthorization().then (function (privileges) {

                var entity = _.findWhere (privileges, { Type: entityName.toUpperCase() });

                // default a read check
                switch (privilege) {
                case giConstant.Privilege.ADD:
                    return entity.Privilege_Create;

                case giConstant.Privilege.UPDATE:
                    return entity.Privilege_Update;

                case giConstant.Privilege.DELETE:
                    return entity.Privilege_Delete;

                case giConstant.Privilege.READ:
                default:
                    return entity.Privilege_Read;

                }
            });
        }

        // get all privileges
        function getEntitySecurity(entityName) {

            // Check if entity security cache exists; if not >> call and build from api
            return getEntitiesForAuthorization().then (function (privileges) {

                var entitySecurity = _.findWhere (privileges, { Type: entityName.toUpperCase() });

                // If entity isn't found in user list, then return all false
                if (entitySecurity == null) {
                    entitySecurity = {};
                    entitySecurity.Privilege_Create = false;
                    entitySecurity.Privilege_Delete = false;
                    entitySecurity.Privilege_Update = false;
                    entitySecurity.Privilege_Read = false;
                }

                return entitySecurity;
            });
        }

        // get all entity privileges
        // **code that calls this will have to handle cases where entity does not exist in list
        function getAllEntitySecurity() {

            // Check if entity security cache exists; if not >> call and build from api
            return getEntitiesForAuthorization().then (function (privileges) {

                return privileges;
            });
        }

        function getEntitiesForAuthorization() {

            return $http.get (RequestContext.PathAPI + "EntitySecurity/UserPrivileges", { cache: true }).then (function (response) {
                return response.data;
            });

        }

    }

})();