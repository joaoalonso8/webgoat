(function () {
    'use strict';

    var module = angular.module('core.filters');

    module.filter('recordEffectiveFilter', function () {
        return function (input, effectiveDate) {

            if (!effectiveDate) {
                return input;
            }

            var output = [];
            _.each(input, function (item) {
                if ('RecordEffective' in item) {
                    if (!item['RecordEffective'] || item['RecordEffective'] <= effectiveDate) {
                        if ('RecordExpiration' in item) {
                            if (!item['RecordExpiration'] || item['RecordExpiration'] > effectiveDate) {
                                output.push(item);
                            }
                        }
                        else {
                            output.push(item);
                        }
                    }
                }
                else {
                    output.push(item);
                }
            });

            return output;
        };
    });
})();