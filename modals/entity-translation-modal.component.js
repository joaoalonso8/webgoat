(function () {
    'use strict';
    angular
        .module('aon.eb.common')
        .component('aonEbEntityTranslationModal', {
            templateUrl: '/static/app/common/modals/entity-translation-modal.component.html',
            bindings: {
                modalInstance: '<',
                resolve: '<'
            },
            controller: controller
        });
    controller.$inject = ['$q', 'translationService', 'flexApi', '$uibModal', 'giConstant', 'aonEbApp'];

    function controller($q, translationService, flexApi, $uibModal, giConstant, aonEbApp) {

        var $ctrl = this;
        $ctrl.loading = true;

        $ctrl.ok = ok;
        $ctrl.cancel = cancel;
        $ctrl.languageChange = languageChange;
        $ctrl.openLanguageModal = openLanguageModal;
        $ctrl.enableSave = false;

        $ctrl.$onInit = function () {
            $ctrl.entityType = $ctrl.resolve.entityType;
            $ctrl.enableSave = ($ctrl.resolve.dataRecord.Tenant_RecordID === aonEbApp.context.Tenant.RecordID);
            $ctrl.apiParams = { id: $ctrl.resolve.dataRecord.RecordID };
            if ($ctrl.resolve.dataRecord.Parent_RecordID) {
                $ctrl.apiParams.parentId = $ctrl.resolve.dataRecord.Parent_RecordID;
            }
            $q.all([translationService.getTranslator($ctrl.entityType),
            flexApi[$ctrl.entityType].getEntityTranslation($ctrl.apiParams)])
                .then(function (results) {
                    var i = 0;
                    $ctrl.translator = results[i++];
                    $ctrl.localizationEntity = results[i++] || [];

                    $ctrl.labels = {
                        heading: $ctrl.translator.translate('Entity Translation', 'Entity Translation'),
                        addLanguage: $ctrl.translator.translate('Add Language', 'Add Language'),
                        selectLanguage: $ctrl.translator.translate('Select Language', 'Select Language'),
                        ok: $ctrl.translator.translate('Save', 'Save'),
                        cancel: $ctrl.translator.translate('Close', 'Close'),
                        default: $ctrl.translator.translate('Default', 'Default'),
                    };
                    fillFields($ctrl.resolve.sections);
                    $ctrl.loading = false;
                });
        }

        function languageChange() {
            if ($ctrl.selectedLanguage) {
                if ($ctrl.selectedLanguage === giConstant.NEW_RECORD) {
                    openLanguageModal();
                }
                else {
                    $ctrl.languageDataRecord = $ctrl.localizationEntity.find(function (item) { return item.LookupLanguage_RecordID === $ctrl.selectedLanguage });
                    if ($ctrl.languageDataRecord) {
                        $ctrl.dataRecord = $ctrl.languageDataRecord.Fields || {};
                    }
                }
            }
            else {
                $ctrl.dataRecord = {};
            }
        }

        function fillFields(sections) {
            $ctrl.fields = [];
           sections.forEach(function (section, index) {
                section.panels.forEach(function (panel, index) {
                    panel.fields.forEach(function (field, index) {
                        if ((field.type === 'string' || field.type === 'html') && field.localization) {
                            field.required = false;
                            field.disabled = false;
                            field.placeholder = $ctrl.resolve.dataRecord[field.field];
                            $ctrl.fields.push(field);
                        }
                    })
                })
            });
        }

        function cancel() {
            $ctrl.modalInstance.dismiss('cancel');
        }

        function ok() {
            $ctrl.isSaving = true;
            if ($ctrl.selectedLanguage && flexApi[$ctrl.entityType] && flexApi[$ctrl.entityType].setEntityTranslation) {
                $ctrl.languageDataRecord.Fields = $ctrl.dataRecord;

                flexApi[$ctrl.entityType].setEntityTranslation($ctrl.apiParams, $ctrl.languageDataRecord).then(function (data) {
                    if (!data) {
                        $ctrl.localizationEntity = _.reject($ctrl.localizationEntity, function (item) {
                            return item.LookupLanguage_RecordID === $ctrl.selectedLanguage;
                        });
                    }
                    toastr.success($ctrl.translator.translate("Record updated successfully", "Record updated successfully"));
                    $ctrl.isSaving = false;
                    $ctrl.formEntityEdit.$setPristine();
                });
            }
        }

        function openLanguageModal() {
            var modalInstance = $uibModal.open(
                {
                    component: 'aonEbAddNewLanguageModal',
                    backdrop: 'static',
                    size: 'sm'
                });

            modalInstance.result.then(function (data) {
                $ctrl.selectedLanguage = data.LookupLanguage_RecordID;
                $ctrl.languageDataRecord = $ctrl.localizationEntity.find(function (item) { return item.LookupLanguage_RecordID === data.LookupLanguage_RecordID });
                if ($ctrl.languageDataRecord) {
                    $ctrl.dataRecord = $ctrl.languageDataRecord.Fields || {};
                }
                else {
                    $ctrl.localizationEntity.push(data);                   
                    $ctrl.languageDataRecord = data;
                    $ctrl.dataRecord = {};
                }
                $ctrl.formEntityEdit.$setPristine();
            }, function () {
                // modal dismissed
                $ctrl.selectedLanguage = null;
            });
        }
    };
})();