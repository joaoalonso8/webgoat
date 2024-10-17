(function () {
    'use strict';

    angular.module('flex.data')
        .factory('cacheManager', cacheManager);

    cacheManager.$inject = ['$q', 'flexApi', 'flexFilterService', 'aonEbApp', 'giConstant'];

    function cacheManager($q, flexApi, flexFilterService, aonEbApp, giConstant) {

        function cacheFactory(schema) {

            var self = {};
            var internalIndex = {};
            var internalDefaults = {};
            var internalDefaultsPromises = [];
            self.schema = schema;
            //get initialized and create schema for all idexes
            init(schema);

            self.load = function (data) {
                var d = $q.defer();
                $q.when(data).then(function (result) {
                    createIndex(result, schema);
                    d.resolve(result);
                }).catch(function (error) {
                    d.reject(error);
                });
                return d.promise;
            }

            function init(schema) {
                initializeSchema(schema);
                $q.all(internalDefaultsPromises).then(function (data) {
                    for (var i = 0; i < internalDefaults.length; i++) {
                        internalDefaults[i] = data[i];
                    }
                });
            }

            function initializeSchema(schema) {
                var schType = schema.type;
                var indexType = 'index' + schema.type;
                var defaultType = 'default' + schema.type;
                var includes = schema.includes;

                if (!self[schType]) {
                    internalDefaultsPromises.push(flexFilterService.getDefaultedEntity(schType));
                    internalDefaults[defaultType] = [];

                    self[schType] = {};
                    internalIndex[indexType] = [];
                }

                //get all entities from cache
                self[schType].query = function (params) {
                    var cachedItems = internalIndex[indexType].filter(function (item) {
                        return item.Parent_RecordID === params.parentId;
                    });
                    return cachedItems.map(function (cachedItem) {
                        return aonEbApp.shallowClone(cachedItem);
                    });
                };

                self[schType].get = function (params) {
                    var cachedItem = internalIndex[indexType].find(function (item) {
                        return item.RecordID === params.id;
                    });
                    if (cachedItem) {
                        var clonedItem = aonEbApp.shallowClone(cachedItem);
                        if (includes && includes.length > 0) {
                            includes.forEach(function (item) {
                                clonedItem[item] = cachedItem[item];
                            });
                        }
                        return clonedItem;
                    }
                };

                self[schType].newEntity = function (defaults) {
                    return angular.merge(defaults, internalDefaults[defaultType]);
                };

                self[schType].save = function (params, data) {
                    return flexApi[schType].save(params, data).then(function (result) {
                        var cachedItem = internalIndex[indexType].find(function (item) {
                            return item.RecordID === data.RecordID || item.RecordID === giConstant.NEW_RECORD;
                        });
                        //update in index
                        if (cachedItem) {
                            angular.merge(cachedItem, result);
                        }
                        else {
                            internalIndex[indexType].push(result);
                            //Update in parent                         
                            var cType = internalIndex.reverseSchema.find(function (rs) { return rs.childType === schType });
                            if (cType) {
                                var parentRec = internalIndex['index' + cType.parentType].find(function (item) { return item.RecordID === data.Parent_RecordID });
                                if (parentRec) {
                                    if (!parentRec[cType.childProperty]) {
                                        parentRec[cType.childProperty] = [];
                                    }
                                    parentRec[cType.childProperty].push(result);
                                }
                            }
                        }
                        return result;
                    });
                };

                if (flexApi[schType] && flexApi[schType].patch) {
                    self[schType].patch = function (params, patch) {
                        return flexApi[schType].patch(params, patch).then(function (result) {
                            var cachedItem = internalIndex[indexType].find(function (item) {
                                return item.RecordID === params.id;
                            });
                            if (cachedItem) {
                                angular.merge(cachedItem, result);
                            }
                            return result;
                        });
                    };
                }

                self[schType].delete = function (params) {
                    return flexApi[schType].delete(params).then(function (result) {
                        var cachedItem = internalIndex[indexType].find(function (item) {
                            return item.RecordID === params.id;
                        });
                        if (cachedItem) {
                            cachedItem.RecordExpiration = cachedItem.RecordEffective
                        };
                        return result;
                    });
                };

                if (flexApi[schType] && flexApi[schType].copy) {
                    self[schType].copy = function (params, patch) {
                        return flexApi[schType].copy(params, patch).then(function (result) {
                            internalIndex[indexType].push(result);
                            return result;
                        });
                    };
                }

                if (flexApi[schType] && flexApi[schType].structureIntersects) {
                    self[schType].structureIntersects = function () {
                        return flexApi[schType].structureIntersects;
                    };
                }

                schema.children && schema.children.forEach(function (child) {
                    // form the reverse schema to know the parent entity
                    if (internalIndex.reverseSchema) {
                        var cType = internalIndex.reverseSchema.find(function (rs) { return rs.childType === child.type });
                        if (!cType) {
                            internalIndex.reverseSchema.push({ parentType: schType, childType: child.type, childProperty: child.property });
                        }
                    }
                    else {
                        internalIndex.reverseSchema = [{ parentType: schType, childType: child.type, childProperty: child.property }];
                    }
                    //create index for all child entities
                    initializeSchema(child);
                });
                return internalDefaultsPromises;
            }

            function createIndex(data, schema) {
                var indexType = 'index' + schema.type;

                if (data && !Array.isArray(data)) {
                    var match = internalIndex[indexType].find(function (item) {
                        return item.RecordID === data.RecordID;
                    })
                    if (!match) {
                        internalIndex[indexType].push(data);
                    }
                }

                schema.children && schema.children.forEach(function (child) {
                    if (data && data[child.property] && data[child.property].length > 0) {
                        data[child.property].forEach(function (dataItem) {
                            //fill index for all child entities
                            createIndex(dataItem, child);
                        });
                    }
                });
            }

            self.flush = function (data, schema) {
                var schType = schema.type;
                var indexType = 'index' + schema.type;
                if (data) {
                    var dataArray = data;
                    if (!Array.isArray(data)) {
                        dataArray = [data];
                    }

                    dataArray.forEach(function (src) {
                        var cachedItem = internalIndex[indexType].find(function (x) {
                            return x.RecordID === src.RecordID;
                        })
                        if (cachedItem) {
                            angular.merge(cachedItem, src);
                        }
                        else {
                            internalIndex[indexType].push(src);
                            //Update in parent                         
                            var cType = internalIndex.reverseSchema.find(function (rs) { return rs.childType === schType });
                            if (cType) {
                                var parentRec = internalIndex['index' + cType.parentType].find(function (item) { return item.RecordID === src.Parent_RecordID });
                                if (parentRec) {
                                    if (!parentRec[cType.childProperty]) {
                                        parentRec[cType.childProperty] = [];
                                    }
                                    parentRec[cType.childProperty].push(src);
                                }
                            }
                        }

                        schema.children && schema.children.forEach(function (child) {
                            if (src && data[child.property] && src[child.property].length > 0) {
                                src[child.property].forEach(function (dataItem) {
                                    //fill index for all child entities
                                    flush(dataItem, child);
                                });
                            }
                        });
                    });
                }
            }

            return self;
        }

        return cacheFactory;
    }

})();