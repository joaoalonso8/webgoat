(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbConfirmEntityCopyModal', {
            templateUrl: '/static/app/common/modals/confirm-entity-copy-modal.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: controller
        });

    controller.$inject = ['translationService']

    function controller(translationService) {
        var $ctrl = this;

        $ctrl.loaded = false;
        $ctrl.ok = ok;
        $ctrl.cancel = cancel;

        $ctrl.$onInit = function () {
            $ctrl.options = $ctrl.resolve.options;
            $ctrl.entity = $ctrl.resolve.entity;

            $ctrl.dataRecord = {
                Name: '',
                RecordEffective: $ctrl.entity.RecordEffective,
                RecordID: $ctrl.entity.RecordID
            };

            $ctrl.translationEntity = $ctrl.options.entityType;

            translationService.getTranslator($ctrl.translationEntity).then(function (translator) {
                $ctrl.title = $ctrl.options.title;
                $ctrl.labels = {
                    copiedFrom: translator.translate("Copy From", "Copy From"),
                    name: translator.translate("Name", "Name"),
                    effective: translator.translate("Effective Date", "Effective Date"),
                    ok: translator.translate("OK", "OK"),
                    cancel: translator.translate("Cancel", "Cancel")
                };
                $ctrl.loaded = true;
            });
        };

        function ok() {
            $ctrl.modalInstance.close($ctrl.dataRecord);
        }

        function cancel() {
            $ctrl.modalInstance.dismiss();
        }
    }
})();