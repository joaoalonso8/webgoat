(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbAsOfDate', {
            templateUrl: '/static/app/common/panels/as-of-date.component.html',
            bindings: {
                options: '<',
                disabled: '<',
                onChange: '&'
            },
            controller: ['aonEbApp', 'translationService', 'dateUtils', 'aonEbCommonModals', 'aonEbMessageFormat', controller]
        });

    function controller(aonEbApp, translationService, dateUtils, aonEbCommonModals, aonEbMessageFormat) {

        var $ctrl = this;

        var translator;
        var lastGoodDate = "";
        var sessionDateListenerHandle;

        $ctrl.$onInit = function () {
            translationService.getTranslator("Employee").then(function (data) {
                translator = data;
            });
            sessionDateListenerHandle = aonEbApp.registerSessionDateListener(setAsOfDate);
            setAsOfDate();
        }

        $ctrl.$onChanges = function (changes) {
            if (changes.options) {
                var kOptions = {
                };

                if (changes.options.currentValue) {
                    if ($ctrl.options.minDate) {
                        $ctrl.minAsOfDate = $ctrl.options.minDate;
                        kOptions["min"] = dateUtils.parseIsoDate($ctrl.options.minDate);
                    }
                }

                $ctrl.kOptions = kOptions;
            }
        }

        $ctrl.$onDestroy = function () {
             aonEbApp.deregisterSessionDateListener(sessionDateListenerHandle);
        }

        $ctrl.onAsOfDateChange = function () {
            if ($ctrl.effectiveAsOfDate) {
                if ($ctrl.effectiveAsOfDate < $ctrl.minAsOfDate) {
                    var msg = translator.translate('AsOfDateWarningMessage', 'Earliest data record held is {0} unable to select an earlier As Of Date')
                    aonEbCommonModals.confirm({
                        text: aonEbMessageFormat.formatMessage(msg, dateUtils.format($ctrl.minAsOfDate, "d")),
                        onOk: function () {
                            $ctrl.effectiveAsOfDate = $ctrl.minAsOfDate;
                            if ($ctrl.effectiveAsOfDate !== lastGoodDate) {
                                lastGoodDate = $ctrl.effectiveAsOfDate;
                                aonEbApp.setSessionDate($ctrl.effectiveAsOfDate);
                                $ctrl.onChange({ effectiveDate: $ctrl.effectiveAsOfDate });
                            }
                        },
                        showCancel: false
                    });
                }
                else {
                    lastGoodDate = $ctrl.effectiveAsOfDate;
                    aonEbApp.setSessionDate($ctrl.effectiveAsOfDate);
                    $ctrl.onChange({ effectiveDate: $ctrl.effectiveAsOfDate });
                }
            }
        }

        $ctrl.blurAsOfDate = function () {
            if (!$ctrl.effectiveAsOfDate) {
                $ctrl.effectiveAsOfDate = lastGoodDate;
            }
        }

        function setAsOfDate() {
            $ctrl.effectiveAsOfDate = aonEbApp.getSessionDate();
            lastGoodDate = $ctrl.effectiveAsOfDate;
        }
    }
})();