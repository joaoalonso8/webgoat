(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbCommonAddNewChildModal', {
            templateUrl: '/static/app/common/modals/add-new-entity-modal.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: ['translationService', controller]
        });

    function controller(translationService) {
        var $ctrl = this;

        $ctrl.dataRecord = {
            Name: null,
            RecordID: null
        };
        $ctrl.loaded = false;
        $ctrl.ok = ok;
        $ctrl.cancel = cancel;

        $ctrl.$onInit = function () {
            $ctrl.options = $ctrl.resolve.options;
            $ctrl.translationEntity = $ctrl.options.translationEntity;

            translationService.getTranslator($ctrl.translationEntity).then(function (translator) {
                $ctrl.title = $ctrl.options.title;
                $ctrl.label = { Name: "Name", CopyFrom: "Copy From" };
                $ctrl.okText = $ctrl.options.okText || translator.translate("OK", "OK");
                $ctrl.cancelText = $ctrl.options.cancelText || translator.translate("Cancel", "Cancel");
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