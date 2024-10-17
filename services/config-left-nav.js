(function () {
    'use strict';

    angular.module('flex.data')
        .factory('configLeftNav', configLeftNav);

    configLeftNav.$inject = ['aonEbApp', 'giConstant'];

    function configLeftNav(aonEbApp, giConstant) {
        function configLeftNavFactory(schema, id, cm, userFilter, translator) {          
            var schemaType = schema.type;
            function getStructure() {
                var data = cm[schema.type].get({ id: id });

                var lineSideMenu = [{
                    RecordID: data.RecordID,
                    Name: data.RecordID === giConstant.NEW_RECORD ? giConstant.NEW_RECORD : data.Name,
                    state: 'tenant.' + aonEbApp.camelToKebabCase(schema.type) + '-wizard.details',
                    icon: schema.icon ? schema.icon: null,
                    stateParams: { id: data.RecordID },
                    Children: schema.children ? getChildren(schema, {}, data.RecordID) : []
                }];
                return lineSideMenu;
            }

            function getChildren(schema, stateParams, parentId) {  
                var idParam = schema.type.substring(0, 1).toLowerCase() + schema.type.substring(1, schema.type.length) + 'Id';
                var childNodes = schema.children && schema.children.map(function (child) {
                    var statParams = angular.copy(stateParams);
                    statParams[idParam] = parentId;
                    var name = child.labelKey ? child.labelKey : aonEbApp.camelPlusSpace(child.property);
                    if (!child.hidden && !isEntityHidden(child.type)) {
                        return {
                            RecordID: child.type + '_' + parentId,
                            Name: translator.translate(name, name),
                            state: child.state ? child.state : 'tenant.' + aonEbApp.camelToKebabCase(schemaType) + '-wizard.' + aonEbApp.camelToKebabCase(aonEbApp.pluralize(child.type)),
                            icon: child.icon ? child.icon : null,
                            stateParams: angular.merge(statParams, { parentId: parentId }),
                            Children: getChildrenNodes(child, statParams, parentId)
                        }
                    }
                    else {
                        return {};
                    }
                });
                return childNodes.filter(function (item) {
                    return !angular.equals({}, item)
                });
            }

            function getChildrenNodes(schema, stateParams, parentId) {               
                var data = aonEbApp.filterConfig(schema.type, cm[schema.type].query({ parentId: parentId }));              
                if (data && data.length>0 && schema.filter) {
                    var filterObjName = Object.getOwnPropertyNames(schema.filter)[0];
                    data = data.filter(function (item) {
                        return item[filterObjName] === schema.filter[filterObjName]
                    });
                }
                var cNodes = data.map(function (item) {
                    var stParams = angular.copy(stateParams);
                    return {
                        RecordID: item.RecordID,
                        Name: item.Name,
                        state: schema.state ? schema.state.substring(0, schema.state.length - 1) + '-details' : 'tenant.' + aonEbApp.camelToKebabCase(schemaType) + '-wizard.' + aonEbApp.camelToKebabCase(schema.type) + '-details',
                        icon: schema.icon ? schema.icon : null,
                        stateParams: angular.merge(stParams, { parentId: parentId, id: item.RecordID }),
                        Children: schema.children ? getChildren(schema, stateParams, item.RecordID) : []
                    }
                })
                return cNodes;
            }

            function isEntityHidden(entityName) {
                return userFilter.Exclusions.some(function (item) {
                    return item.Entity === entityName && item.Type === giConstant.Filter.EXCLUDE_FULL;
                });
            }
            var menu = getStructure();
            return menu;
        }
        return configLeftNavFactory;       
    }

})();