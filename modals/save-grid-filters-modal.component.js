(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbSaveGridFiltersModal', {
            templateUrl: '/static/app/common/modals/save-grid-filters-modal.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: controller
        });
    controller.$inject = ['$window'];
    function controller($window) {
        var $ctrl = this;

        $ctrl.dataRecord = {
            Name: null,
            isDefaultFilter: null
        }; 
        $ctrl.change = change;
        $ctrl.ok = ok;
        $ctrl.cancel = cancel;
        var existingOptions = {};

        $ctrl.$onInit = function () {
            $ctrl.options = $ctrl.resolve.options;
            $ctrl.translationEntity = $ctrl.options.translationEntity;
            if ($window.localStorage[$ctrl.options.saveKey]) {
                existingOptions = JSON.parse($window.localStorage[$ctrl.options.saveKey]);               
            }
        };

        function ok() {
            $ctrl.modalInstance.close($ctrl.dataRecord);
        }

        function cancel() {
            $ctrl.modalInstance.dismiss();
        }

        function change(selectedValue) {          
            if (existingOptions.savedFilters && existingOptions.savedFilters.length > 0 && selectedValue.currentValue) {
               var match = existingOptions.savedFilters.find(function (filter) {
                    return filter.Name === selectedValue.currentValue;
                });
                $ctrl.exists = match ? true : false;
            }
        }
    }
})();