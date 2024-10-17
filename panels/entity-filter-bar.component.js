(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbEntityFilterBar', {
            templateUrl: '/static/app/common/panels/entity-filter-bar.component.html',
            bindings: {
                options: '<',
                disabled: '<',
                onChange: '<'
            },
            controller: controller
        });

    controller.$inject = ['$q', 'aonEbApp', 'translationService', 'dateUtils', 'structureManager'];
    
    function controller($q, aonEbApp, translationService, dateUtils, structureManager) {

        var $ctrl = this;
        $ctrl.loaded = false;
        $ctrl.GeographicUnits = [];
        $ctrl.BusinessUnits = [];
        $ctrl.filters = { asOfDate: null, buUnit: null, guUnit: null };

        var lastGoodDate = "";
        var sessionDateListenerHandle;
        var structureListenerHandle;

        $ctrl.$onInit = function () {
            $q.all([
                translationService.getTranslator("aonEbEntityFilterBar"),
                structureManager.getGeographicUnitsHierarchy(),
                structureManager.getBusinessUnitsHierarchy()
            ]).then(function (data) {
                var i = 0;
                var translator = data[i++];
                $ctrl.GeographicUnits = data[i++];
                $ctrl.BusinessUnits = data[i++];
                $ctrl.loaded = true;
                $ctrl.labels = {};
                $ctrl.labels.ViewDate = translator.translate("As of Date", "As of Date");
                $ctrl.labels.BusinessUnit = translator.translate("Business Unit", "Business Unit");
                $ctrl.labels.GeographicUnit = translator.translate("Geographic Unit", "Geographic Unit");
            });

            sessionDateListenerHandle = aonEbApp.registerSessionDateListener(setAsOfDate);
            structureListenerHandle = aonEbApp.registerStructureListener(setStructure);
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
            aonEbApp.deregisterStructureListener(structureListenerHandle);
        }

        $ctrl.onAsOfDateChange = function () {
            if ($ctrl.effectiveAsOfDate !== undefined) {
                aonEbApp.setSessionDate($ctrl.effectiveAsOfDate);
                $ctrl.filters.asOfDate = $ctrl.effectiveAsOfDate;
            }
        }

        // Need to handle ngModel being alterted outside this control
        $ctrl.$doCheck = function () {
            if ($ctrl.filters.buUnit !== $ctrl.BU) {
                $ctrl.filters.buUnit = $ctrl.BU;
                aonEbApp.setBUValue($ctrl.BU);
            }
            if ($ctrl.filters.guUnit !== $ctrl.GU) {
                $ctrl.filters.guUnit = $ctrl.GU;
                aonEbApp.setGUValue($ctrl.GU);
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

        function setStructure() {
            $ctrl.BU = aonEbApp.getBUValue();
            $ctrl.GU = aonEbApp.getGUValue();
        }
    }
})();