
(function () {
    'use strict';
    angular
        .module('aon.eb.common')
        .component('aonEbAddNewLanguageModal', {
            templateUrl: '/static/app/common/modals/add-new-language-modal.component.html',
            bindings: {
                modalInstance: '<',
                resolve: '<'
            },
            controller: controller
        });
    controller.$inject = ['translationService','aonEbSelectorModal'];

    function controller(translationService, aonEbSelectorModal) {

        var $ctrl = this;
        $ctrl.translationEntity = 'Language';
        $ctrl.selector = 'LookupLanguages';

        $ctrl.ok = ok;
        $ctrl.cancel = cancel;

        $ctrl.$onInit = function () {
            translationService.getTranslator($ctrl.translationEntity).then(function (results) {
                $ctrl.labels = {
                    heading: results.translate('Add Language', 'Add Language'),
                    ok: results.translate('OK', 'OK'),
                    cancel: results.translate('Cancel', 'Cancel')
                };
            });
        }

        function cancel() {
            $ctrl.modalInstance.dismiss('cancel');
        }

        function ok() {
            $ctrl.isSaving = true;
           
            if ($ctrl.Entity_RecordID) {
                aonEbSelectorModal.getDisplayName($ctrl.selector, $ctrl.Entity_RecordID).then(function (data) {                  
                    $ctrl.isSaving = false;
                    $ctrl.modalInstance.close({ LookupLanguage_RecordID: $ctrl.Entity_RecordID, LanguageName: data});
                });
            }
          
        }
    };
})();