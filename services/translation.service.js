(function () {
    'use strict';

    angular.module('app').service('translationService', ['RequestContext', '$http', '$q', '$cacheFactory', translationService]);

    function translationService(RequestContext, $http, $q, $cacheFactory) {
        /* Config */

        var cache = $cacheFactory('gi.core.translationService.translators'),
            pendingPromises = {};

        /* Service */

        var service = {
            getTranslation: getTranslation,
            getTranslator: getTranslator
        };

        return service;

        /* Members */

        function getTranslation(term, entity, defaultText) {
            return getCachedTranslator(entity).then(function (translator) {
                var result = translator.translate(term, defaultText);
                if (angular.isUndefined(result)) {
                    console.log('Missing translation for [' + entity + ' - ' + term + ']');
                }
                return result;
            });
        }

        function getTranslator(entityName) {
            return getCachedTranslator(entityName).then(function (translator) {
                return translator;
            });
        }

        function getCachedTranslator(entityKey) {
            var deferred = $q.defer(),
                cachedTranslator = cache.get(entityKey);

            if (angular.isUndefined(cachedTranslator)) {
                if (pendingPromises[entityKey] !== undefined) {
                    // queue this up, the call is in progress already and we don't want a bunch of dupes.
                    pendingPromises[entityKey].push(deferred);
                } else {
                    pendingPromises[entityKey] = [deferred];
                    $http.get(RequestContext.PathAPI + 'Translation/Translation?entityType=' + entityKey, {
                        cache: true,
                    }).then(function (response) {
                        var translator = new DictionaryTranslator(response.data);
                        cache.put(entityKey, translator);

                        _.each(pendingPromises[entityKey], function (d) {
                            d.resolve(translator);
                        });

                        delete pendingPromises[entityKey];
                    });
                }
            } else {
                deferred.resolve(cachedTranslator);
            }

            return deferred.promise;
        }

        function DictionaryTranslator(entity) {
            this.dictionary = entity;

            this.translate = function (member, defaultText) {
                if (angular.isUndefined(this.dictionary) || angular.isUndefined(this.dictionary.Labels) || angular.isUndefined(member)) {
                    return defaultText || '';
                }
                else {
                    var translationKey = member.replace(/ /g, '').toLowerCase();
                    var translationText = _.find(this.dictionary.Labels, function (val, key) {
                        return key.toLowerCase() === translationKey
                    });
                    return translationText || defaultText;
                }
            };
        }
    }
})();