(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbAuditHistoryModal', {
            templateUrl: '/static/app/common/modals/audit-history-modal.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: controller
        });

    controller.$inject = ['translationService', '$q', 'auditService']

    function controller(translationService, $q, auditService) {
        var $ctrl = this;
        $ctrl.translationEntity = "AuditEvent";
        $ctrl.entityName = "AuditEvent";
        $ctrl.loaded = false;
        $ctrl.ok = ok;
        $ctrl.eventsGridOptions = null;
        $ctrl.propertiesGridOptions = null;
        $ctrl.AuditProperties = [];

        $ctrl.$onInit = function () {
            $ctrl.options = $ctrl.resolve.options;
            $ctrl.entityType = $ctrl.options.entityType;
            $ctrl.entityId = $ctrl.options.entityId;
            $q.all([
                translationService.getTranslator($ctrl.translationEntity),
            ]).then(function (data) {
                var i = 0;
                $ctrl.translator = data[i++];
                $ctrl.okText = $ctrl.translator.translate("OK", "OK");
                initializeEventsView();
                initializePropertiesView();
                $ctrl.loaded = true;
            });
        }

        function ok() {
            $ctrl.modalInstance.close(false);
        }

        function initializeEventsView() {
            $ctrl.eventsGridOptions = {
                id: 'auditEventsGrid',
                saveKey: 'auditEventsGrid',
                dataSource: {
                    read: function () {
                        return auditService.getEvents($ctrl.entityId);
                    }
                },
                translationEntity: $ctrl.translationEntity,
                events: { onChange: getEventProperties },
                paging: { sizes: [20, 50, 100, 'All'] },
                columns:
                    [                        
                        { field: 'AuditDate', type: 'datetime' },
                        { field: 'Name' },
                        { field: 'Action', labelKey: 'Audit Action' }
                    ]
            };
        }

        function initializePropertiesView() {
            $ctrl.propertiesGridOptions = {
                id: 'auditPropertiesGrid',
                saveKey: 'auditPropertiesGrid',
                dataSource: {
                    read: function () {
                        return $ctrl.AuditProperties;
                    }
                },
                translationEntity: $ctrl.translationEntity,
                paging: { sizes: [20, 50, 100, 'All'] },
                columns:
                    [
                        { field: 'Field' },
                        { field: 'BeforeValue' },
                        { field: 'AfterValue' }
                    ]
            };
        }

        function getEventProperties(dataItem) {
            if (dataItem) {
                $ctrl.selectedAuditEvent = dataItem;
                $q.all([
                    auditService.getProperties(dataItem.RecordID),
                ]).then(function (data) {
                    $ctrl.AuditProperties = data[0];
                    $ctrl.auditPropertiesGrid.refresh();
                });
            }
        }
    }
})();