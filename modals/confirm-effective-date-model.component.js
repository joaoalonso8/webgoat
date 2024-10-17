
(function () {
    "use strict";

    angular
        .module('aon.eb.common')
        .component('aonEbConfirmEffectiveDateModal', {
            templateUrl: '/static/app/common/modals/confirm-effective-date-model.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: ['translationService', 'dateUtils', controller]
        });

    function controller(translationService, dateUtils) {

        var $ctrl = this;
        $ctrl.translationEntity = "EmployeeEffectiveDate";
        $ctrl.doNotShowMessage = false;
        $ctrl.Ok = Ok;
        $ctrl.cancel = cancel;

        $ctrl.$onInit = function () {
            $ctrl.effectiveAsOfDate = dateUtils.format($ctrl.resolve.effectiveDate, "d");
            translationService.getTranslator($ctrl.translationEntity).then(function (translator) {
                $ctrl.translator = translator;
            });
        };

        function cancel() {
            $ctrl.modalInstance.dismiss(false);
        }

        function Ok() {
            $ctrl.modalInstance.close($ctrl.doNotShowMessage);
        }
    };
})();