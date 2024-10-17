(function () {
    'use strict';

    angular
        .module('app')
        .factory('lookupService', ['$http', '$q', '$cacheFactory', 'RequestContext', LookupService]);

    function LookupService($http, $q, $cacheFactory, RequestContext) {

        var service = {
            getLookupList: getLookupList,
            getLookupListDefered: getLookupListDefered,
            hasValue: hasValue,
            findValue: findValue,
            kendoLookupValues: kendoLookupValues
        };

        var cache = $cacheFactory('gi.core.lookupService.lookups');
        var pendingPromises = {};

        return service;

        function getLookupList(path) {
            return getCachedLookupList(path).then(function (lookupList) {
                return lookupList;
            });
        }

        function getLookupListDefered(path) {
            return getCachedLookupList(path);
        }

        function hasValue(key, lookupList, keyName) {
            if (keyName === undefined) {
                keyName = 'RecordID';
            }
            if (typeof (key) !== 'undefined') {
                var result = _.find(lookupList, function (item) {
                    return item[keyName] === key;
                })
                return (result !== undefined);
            }
            return false;
        }

        function kendoLookupValues(lookupList, keyName, valueName) {
            var values = [];
            if (keyName === undefined) {
                keyName = 'RecordID';
            }
            if (valueName === undefined) {
                valueName = 'Name';
            }
            //var values = _.map(_.sortBy(lookup, 'SortOrder'), function (item) {
            var values = _.map(lookupList, function (item) {
                return {
                    value: item[keyName],
                    text: item[valueName]
                };
            });
            return values;
        }

        function findValue(key, lookupList) {
            if (key !== undefined) {
                var result = _.find(lookupList, function (item) {
                    return item.RecordID === key;
                })
                return (result === undefined) ? "" : result.Name;
            }
            return "";
        }

        function getCachedLookupList(path) {
            var d = $q.defer();
            var cachedLookup = cache.get(path);

            if (angular.isUndefined(cachedLookup)) {
                if (pendingPromises[path] !== undefined) {
                    // queue this up, the call is in progress already and we don't want a bunch of dupes.
                    pendingPromises[path].push(d);
                } else {
                    pendingPromises[path] = [d];
                    $http.get(RequestContext.PathAPI +path, {
                        cache: true
                    }).then(function (response) {
                        var lookupList = response.data;
                        // TODO: Add sortorder detection and sorting!
                        // Make lookuplist kendo grid friendly.
                        _.each(lookupList, function (item, index) {
                            _.extend(item, { value: item.RecordID, text: item.Name });
                        });
                        cache.put(path, lookupList);
                        _.each(pendingPromises[path], function (d) {
                            d.resolve(lookupList);
                        });
                        delete pendingPromises[path];
                    });
                }
            } else {
                d.resolve(cachedLookup);
            }

            return d.promise;
        }

    }

})();