(function () {
    'use strict';

    /**
     * Apply this directive to Kendo DatePicker to handle translation between
     * ISO date string format "yyyy-MM-dd" of the ngModel and the JavaScript
     * Date object used by kNgModel. When using this directive there should be
     * no need to use the kNgModel.
     * @example
     * <input kendo-date-picker name="myDate" ng-model="vm.MyISODate" gi-utc-date />
     */
    angular
        .module('aon.eb.common')
        .directive('giUtcDatetime', ['dateUtils', '$parse', function (dateUtils, $parse) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attr, ctrl) {

                    // add ISO date validator
                    ctrl.$validators.giUtcDatetime = function (modelValue, viewValue) {
                        var valid = false;
                        if (viewValue === undefined || viewValue === null || viewValue === '') {
                            valid = true;
                        }
                        else if (modelValue !== undefined && modelValue !== null && modelValue !== '') {
                            valid = (dateUtils.parseIsoDate(modelValue) !== undefined);
                        }
                        return valid;
                    };

                    // convert the datepicker displayed date value to its ISO string format.
                    ctrl.$parsers.push(function (viewValue) {
                        if (viewValue === '') {
                            return null;
                        }
                        var dateFormat = kendo.culture().calendar.patterns["g"];
                        var kFormat = $parse(attr.kFormat)();
                        if (kFormat) {
                            dateFormat = kFormat;
                        }
                        else {
                            var kOptions = $parse(attr.kOptions)();
                            if (kOptions && kOptions.format) {
                                dateFormat = kOptions.format;
                            }
                        }
                        var date = kendo.parseDate(viewValue, dateFormat);
                        if ((date === undefined) || (date === null) || (date === '')) {
                            return null;
                        }
                        return dateUtils.toIsoDatetime(date);
                    });

                    // convert the ISO date string to the datepicker display format.
                    ctrl.$formatters.push(function (modelValue) {
                        if (!modelValue) {
                            return modelValue;
                        }
                        var dateFormat;
                        var kFormat = $parse(attr.kFormat)();
                        if (kFormat) {
                            dateFormat = kFormat;
                        }
                        else {
                            var kOptions = $parse(attr.kOptions)();
                            if (kOptions && kOptions.format) {
                                dateFormat = kOptions.format;
                            }
                        }
                        return dateUtils.formatIsoDate(modelValue, dateFormat);
                    });

                }
            };
        }]);

})();

