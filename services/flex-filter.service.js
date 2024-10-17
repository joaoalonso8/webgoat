(function () {
    'use strict';

    angular
        .module('app')
        .service('flexFilterService', flexFilterService);

    flexFilterService.$inject = ['RequestContext', '$http', '$q', 'giConstant'];

    function flexFilterService(RequestContext, $http, $q, giConstant) {

        var service = {
            getFlexFilter: getFlexFilter,
            getHiddenFieldsForEntity: getHiddenFieldsForEntity,
            applyDefaultsToEntity: applyDefaultsToEntity,
            isEntityHidden: isEntityHidden,
            getDefaultedEntity: getDefaultedEntity
        };

        return service;

        function getFlexFilter() {
            return $http.get(RequestContext.PathAPI + 'Flex/Filters/CurrentUser', { cache: true }).then(function (response) {
                return response.data;
            });
        }

        function getHiddenFieldsForEntity(entityName) {
            return getFlexFilter().then(function (userFilter) {

                var hiddenFields = [];
                var exclusions = _.where(userFilter.Exclusions, { Entity: entityName });

                // loop over each exclusion
                _.each(exclusions, function (item, index) {

                    if (item.Type === giConstant.Filter.EXCLUDE_FULL) {
                        hiddenFields.push(giConstant.Filter.EXCLUDE_ENTITY);
                        return hiddenFields;
                    }
                    else if (item.Type === giConstant.Filter.EXCLUDE_PARTIAL) {
                        hiddenFields.push(item.Field);
                    }                  
                });

                return hiddenFields;
            });
        }

        function isEntityHidden(entityName) {
            return getFlexFilter().then(function (userFilter) {
                var result = _.findWhere(userFilter.Exclusions, { Entity: entityName, Type: giConstant.Filter.EXCLUDE_FULL });
                return result;
            });
        }

        function applyDefaultsToEntity(entityName, entity) {
            return getFlexFilter().then(function (userFilter) {

                var exclusions = _.where(userFilter.Exclusions, { Entity: entityName });

                // loop
                _.each(exclusions, function (item, index) {
                    if (item.Default) {
                        entity[item.Field] = item.Default;
                    }
                });

                return entity;
            });
        }

        function getDefaultedEntity(entityName) {            
            return applyDefaultsToEntity(entityName, {});
        }

    }

})();