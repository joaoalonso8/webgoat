(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbEntityEditPanel', {
            templateUrl: '/static/app/common/panels/entity-edit-panel.component.html',
            transclude: {
                header: '?aonEbEntityEditPanelHeader',
                body: '?aonEbEntityEditPanelBody',
                footer: '?aonEbEntityEditPanelFooter'
            },
            bindings: {
                options: '<'
            },
            controller: ['$scope', '$attrs', '$parse', '$q', 'aonEbApp', '$uibModal', 'aonEbCommonModals', 'translationService', 'giConstant', 'dateUtils', controller]
        });

    function controller($scope, $attrs, $parse, $q, aonEbApp, $uibModal, aonEbCommonModals, translationService, giConstant, dateUtils) {

        var $ctrl = this;
        $ctrl.versionData = [];
        $ctrl.loading = true; // true whilst the componentis initialized or data record being refreshed
        $ctrl.canEdit = false; // is edit enabled, false if read-only mode or no save function defined
        $ctrl.canDelete = false;
        $ctrl.canClose = false;
        $ctrl.canViewAudit = false;

        $ctrl.isEditable = false; // true whilst panel is in edit mode
        $ctrl.isDeleting = false;
        $ctrl.isSaving = false; // true during save processing       
        $ctrl.isLatest = false;

        $ctrl.edit = edit; // enable editing
        $ctrl.cancel = cancel; // cancel local edits
        $ctrl.save = save; // save input changes
        $ctrl.delete = deleteFn;
        $ctrl.close = close; // close, useful in read-only mode (view mode)
        $ctrl.refresh = refresh; // reread data and lose local edits    
        $ctrl.switchVersion = switchVersion;
        $ctrl.effectiveChange = effectiveChange;
        $ctrl.expirationChange = expirationChange;
        $ctrl.info = info;
        $ctrl.showAuditHistory = showAuditHistory;

        $ctrl.expanded = true; // true if panel contents expanded

        if ($attrs.name) {
            var setter = $parse($attrs.name).assign || noop;
            setter($scope.$parent, $ctrl);
        }

        $ctrl.$onInit = function () {

            $ctrl.effectiveDate = aonEbApp.getSessionDate();

            $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.LOADING);

            $ctrl.hideEntirePanel = ($ctrl.options.hiddenFields.length > 0 && _.every($ctrl.options.hiddenFields, function (val) {
                return val.search(/\*$/) != -1;
            }));

            // Below code is used to specify an event to refresh data of respective TAB and called from parent.
            $scope.$on('effectiveDateUpdateEvent', function (event, params) {
                $ctrl.effectiveDate = params.effectiveDate;
                if (params.refresh) {
                    $ctrl.versionData = [];
                    refresh();
                }
            });

            $ctrl.canEdit = angular.isFunction($ctrl.options.save);

            if (angular.isFunction($ctrl.options.delete)) {
                $ctrl.canDelete = true;
            }
            if (angular.isFunction($ctrl.options.close)) {
                $ctrl.canClose = true;
            }

            applyCollapsibleOptions();

            translationService.getTranslator("aonEbEntityEditPanel").then(function (data) {
                $ctrl.translator = data;
                $ctrl.labels = {};
                $ctrl.labels.modifiedOn = $ctrl.translator.translate("Modified On", "Modified On");
                $ctrl.labels.modifiedBy = $ctrl.translator.translate("Modified By", "Modified By");
                $ctrl.labels.effective = $ctrl.translator.translate("Effective", "Effective");
                $ctrl.labels.expiration = $ctrl.translator.translate("Expiration", "Expiration");
                $ctrl.labels.version = $ctrl.translator.translate("Version", "Version");
                $ctrl.labels.effectiveDateMsg = $ctrl.translator.translate("EffectiveDateMessage", "Changes made will be saved Effective");
                $ctrl.labels.audit = $ctrl.translator.translate("View Auditlog", "View Auditlog");
                refresh();
            });

            $scope.$watch('$ctrl.formEntityEdit.$dirty', function () {
                if ($ctrl.formEntityEdit) {
                    if ($ctrl.formEntityEdit.$dirty) {
                        $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.DIRTY);
                    }
                }
            });

            $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.LOADED);
        }

        var EditMode = giConstant.EditMode;

        function refresh(recordId) {
            $ctrl.loading = true;
            return $q.when($ctrl.options.read(recordId))
                .then(function (data) {
                    $ctrl.dataRecord = angular.copy(data);
                    // Check if dataRecord belongs to the current tenant, the user can only view common records.
                    $ctrl.isTenantRecord = !$ctrl.dataRecord.Tenant_RecordID || $ctrl.dataRecord.Tenant_RecordID === aonEbApp.context.Tenant.RecordID;
                    $ctrl.canViewAudit = $ctrl.options.type === 'config' && $ctrl.dataRecord.RecordID && $ctrl.dataRecord.RecordID !== giConstant.NEW_RECORD;
                    if (angular.isDefined($ctrl.formEntityEdit)) {
                        $ctrl.formEntityEdit.$setPristine();
                        $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.PRISTINE);
                    }
                    if ((angular.isDefined($ctrl.options.mode) && ($ctrl.options.mode === giConstant.EditPanelMode.OPEN_IN_EDIT || $ctrl.options.mode === giConstant.EditPanelMode.STICKY_EDIT)) !== $ctrl.isEditable) {
                        if ($ctrl.isEditable === true) {
                            $ctrl.isEditable = false;
                            $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.READ);
                        }
                        else {
                            editRecord();
                        }
                    }
                    return data;
                })
                .catch(function (reason) {
                    toastr.error($ctrl.translator.translate("LoadFailed", "Load Failed"));
                }).finally(function () {
                    $ctrl.loading = false;
                })
                .then(function (data) {
                    loadVersionData();
                });
        }

        function edit() {
            if ($ctrl.options.type === 'config') {
                editRecord();
            }
            else {
                aonEbCommonModals.confirmEffectiveDate({
                    effectiveDate: $ctrl.effectiveDate,
                    onOk: function () {
                        editRecord();
                    }
                });
            }
        }

        function editRecord() {
            if ($ctrl.options.type === 'config') {
                effectiveChange();
                expirationChange();
            }
            $ctrl.isEditable = true;
            $ctrl.expanded = true;
            $ctrl.tempRecord = angular.copy($ctrl.dataRecord);
            $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.EDIT);
        }

        function cancel() {
            aonEbCommonModals.confirm({
                text: $ctrl.translator.translate("Cancel Confirm", "Are you sure you want to cancel? All changes will be discarded."),
                title: $ctrl.translator.translate("Confirmation Message", "Confirmation Message"),
                onOk: function () {
                    $ctrl.saveErrors = null;
                    $ctrl.dataRecord = angular.copy($ctrl.tempRecord);
                    $ctrl.formEntityEdit.$setPristine();
                    $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.PRISTINE);
                    $scope.$emit('ConfirmCancelEvent', $ctrl.options.id, EditMode.PRISTINE);
                    if (angular.isDefined($ctrl.options.mode) && $ctrl.options.mode !== giConstant.EditPanelMode.STICKY_EDIT) {
                        $ctrl.isEditable = false;
                        $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.READ);
                    }
                },
                onCancel: function () {
                    // Do nothing.
                }
            });
        }

        function close() {
            if ($ctrl.isEditable) {
                throw new Error("Invalid Application State - You are attempting to close whilst editing - Cancel should be used instead");
            }
            if (!angular.isFunction($ctrl.options.close)) {
                throw new Error("Invalid Application State - the close function must be defined in the config object");
            }
            $ctrl.options.close();
        }

        function info() {
            aonEbCommonModals.displayInfoModal({
                RecordID: $ctrl.dataRecord.RecordID
            });
        }

        function save() {
            $ctrl.isSaving = true;
            $ctrl.options.save($ctrl.dataRecord).then(function (data) {
                $ctrl.saveErrors = null;
                toastr.success($ctrl.translator.translate("Record updated successfully", "Record updated successfully"));
                $ctrl.dataRecord = data;
                $ctrl.formEntityEdit.$setPristine();
                $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.PRISTINE);
                if (angular.isDefined($ctrl.options.mode) && $ctrl.options.mode !== giConstant.EditPanelMode.STICKY_EDIT) {
                    $ctrl.isEditable = false;
                    $scope.$emit('EntityEditEvent', $ctrl.options.id, EditMode.READ);
                }
                else {
                    $ctrl.tempRecord = angular.copy($ctrl.dataRecord);
                }
                return data;
            })
                .catch(function (err) {
                    $ctrl.saveErrors = err;
                    toastr.error($ctrl.translator.translate("SaveFailed", "Save Failed"));
                })
                .finally(function () {
                    $ctrl.isSaving = false;
                })
                .then(function (data) {
                    loadVersionData();
                });
        }

        function deleteFn() {
            aonEbCommonModals.confirm({
                text: $ctrl.translator.translate("Delete Confirm", "Are you sure you want to delete?"),
                title: $ctrl.translator.translate("Confirmation Message", "Confirmation Message"),
                onOk: function () {
                    deleteRecord();
                }
            });
        }

        function deleteRecord() {
            $ctrl.isDeleting = true;
            $ctrl.options.delete($ctrl.dataRecord).then(function (data) {
                $ctrl.saveErrors = null;
                toastr.success($ctrl.translator.translate("Delete Success!", "Delete Success!"));
                $ctrl.dataRecord = data;
            })
                .catch(function (err) {
                    $ctrl.saveErrors = err;
                    toastr.error($ctrl.translator.translate("DeleteFailed", "Delete Failed"));
                })
                .finally(function () {
                    $ctrl.isDeleting = false;
                });
        }

        function switchVersion() {
            refresh($ctrl.versionId);
        }

        function loadVersionData() {
            $ctrl.isLatest = false;
            if (angular.isFunction($ctrl.options.readSequence) && _.find($ctrl.versionData, { recordId: $ctrl.dataRecord.RecordID }) === undefined) {
                $q.when($ctrl.options.readSequence($ctrl.dataRecord)).then(function (data) {
                    $ctrl.versionData = data || [];
                    if ($ctrl.versionData.length > 0) {
                        $ctrl.labels.versionMsg = $ctrl.versionData.length === 1 ? $ctrl.translator.translate("Only one version exists", "Only one version exists") : '';
                    }
                    $ctrl.versionId = $ctrl.dataRecord.RecordID;
                    $ctrl.isLatest = $ctrl.versionData.length === 0 || $ctrl.versionData[0].recordId === $ctrl.versionId;
                    $ctrl.labels.Edit = $ctrl.isLatest ? $ctrl.translator.translate("Edit", "Edit") : $ctrl.translator.translate("EnableEditMessage", "Please select the latest version to enable edit");
                })
            }
            else {
                $ctrl.versionId = $ctrl.dataRecord.RecordID;
                $ctrl.isLatest = $ctrl.versionData.length === 0 || $ctrl.versionData[0].recordId === $ctrl.versionId;
                $ctrl.labels.Edit = $ctrl.isLatest ? $ctrl.translator.translate("Edit", "Edit") : $ctrl.translator.translate("EnableEditMessage", "Please select the latest version to enable edit");
            }
        }

        function effectiveChange() {
            var kOptions = {};
            if ($ctrl.dataRecord.RecordEffective) {
                var minDate = dateUtils.parseIsoDate($ctrl.dataRecord.RecordEffective);
                minDate.setDate(minDate.getDate() + 1);
                kOptions["min"] = minDate;
            }
            $ctrl.kExpirationDateOptions = kOptions;
        }

        function expirationChange() {
            var kOptions = {};
            if ($ctrl.dataRecord.RecordExpiration) {
                var maxDate = dateUtils.parseIsoDate($ctrl.dataRecord.RecordExpiration);
                maxDate.setDate(maxDate.getDate() - 1);
                kOptions["max"] = maxDate;
            }
            $ctrl.kEffectiveDateOptions = kOptions;
        }

        function applyCollapsibleOptions() {
            $ctrl.options.collapsible = angular.isUndefined($ctrl.options.collapsible) || $ctrl.options.collapsible;
            _.each($ctrl.options.sections, function (section, key) {
                if (angular.isDefined(section.title)) {
                    section.expanded = angular.isUndefined(section.expanded) || section.expanded
                    section.collapsible = angular.isUndefined(section.collapsible) || section.collapsible;
                }
            });
        };


        function showAuditHistory() {
            var modalInstance = $uibModal.open({
                component: 'aonEbAuditHistoryModal',
                resolve: {
                    options: function () {
                        return {
                            entityId: $ctrl.dataRecord.RecordID
                        }
                    },
                },
                backdrop: 'static',
                size: 'md'
            });
        }
    };

})();