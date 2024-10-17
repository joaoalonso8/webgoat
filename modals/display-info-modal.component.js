(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbDisplayInfoModal', {
            templateUrl: '/static/app/common/modals/display-info-modal.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: ['translationService', controller]
        });

    function controller(translationService) {
        var $ctrl = this;

        $ctrl.ok = ok;
        $ctrl.cancel = cancel;
        var successMsg;

        $ctrl.$onInit = function () {
            $ctrl.options = $ctrl.resolve.options;
            translationService.getTranslator('ConfirmService').then(function (translator) {
                $ctrl.text = $ctrl.options.text || translator.translate("RecordID", "RecordID");
                $ctrl.title = $ctrl.options.title || translator.translate("Information", "Information");
                $ctrl.okText = $ctrl.options.okText || translator.translate("Copy To Clipboard", "Copy To Clipboard");
                $ctrl.cancelText = $ctrl.options.cancelText || translator.translate("Cancel", "Cancel");
                successMsg = translator.translate("Copied successfully", "Copied successfully");
            });
        };

        function ok() {
            copyToClipboard();
            toastr.success(successMsg);
            $ctrl.modalInstance.close();
        }

        function copyToClipboard() {

            // Create an auxiliary hidden input
            var aux = document.createElement("input");

            // Get the text from the element passed into the input
            aux.setAttribute("value", $ctrl.options.RecordID);

            // Append the aux input to the body
            document.body.appendChild(aux);

            // Highlight the content
            aux.select();

            // Execute the copy command
            document.execCommand("copy");

            // Remove the input from the body
            document.body.removeChild(aux);

        }

        function cancel() {
            $ctrl.modalInstance.dismiss();
        }
    }
})();