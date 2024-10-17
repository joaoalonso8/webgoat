(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbConfirmEntityActionModal', {
            templateUrl: '/static/app/common/modals/confirm-entity-action-modal.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: controller
        });

    controller.$inject = ['translationService'];

    function controller(translationService) {
        var $ctrl = this;

        $ctrl.ok = ok;
        $ctrl.cancel = cancel;

        $ctrl.$onInit = function () {
            $ctrl.options = $ctrl.resolve.options;
            $ctrl.entity = $ctrl.resolve.entity;
            activate();
        };

        function activate() {
            translationService.getTranslator('ConfirmService').then(function (translator) {
                $ctrl.text = $ctrl.options.text || translator.translate("AreYouSure", "Are you sure?");
                $ctrl.title = $ctrl.options.title || translator.translate("Confirm", "Confirm");
                $ctrl.nameLabel = translator.translate("Name", "Name");
                $ctrl.effectiveLabel = translator.translate("Effective", "Effective");
                $ctrl.okText = $ctrl.options.okText || translator.translate("OK", "OK");
                $ctrl.cancelText = $ctrl.options.cancelText || translator.translate("Cancel", "Cancel");
                $ctrl.showCancel = angular.isUndefined($ctrl.options.showCancel) || $ctrl.options.showCancel;
            });
        }

        function ok() {
            $ctrl.modalInstance.close();
        }

        function cancel() {
            $ctrl.modalInstance.dismiss();
        }
    }
})();