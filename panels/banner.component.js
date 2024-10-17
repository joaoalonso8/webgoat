(function () {
    'use strict';

    angular
        .module('aon.eb.employee')
        .component('aonEbBanner', {
            templateUrl: '/static/app/common/panels/banner.component.html',
            bindings:{
                options: '<'
            },
            controller: ['$state', '$window', '$uibModal', 'translationService', 'aonEbNavigationService', 'aonEbApp', 'aonEbSelectorModal', 'messageNotificationService', controller]
        });

    function controller($state, $window, $uibModal, translationService, aonEbNavigationService, aonEbApp, aonEbSelectorModal, messageNotificationService) {

        var $ctrl = this;

        $ctrl.pageContext = aonEbNavigationService.context;
        $ctrl.context = aonEbApp.context;
        $ctrl.openInboxModal = openInboxModal;
        $ctrl.openTenantSwitcher = openTenantSwitcher;
        $ctrl.translator = {};

        $ctrl.$onInit = function () {
            $ctrl.messageData = messageNotificationService.messageData;
            $ctrl.options = $ctrl.options || {};
            if (!$ctrl.options.title) {
                translationService.getTranslator("ConfigWizardNavigation").then(function (translator) {
                    $ctrl.translator = translator;
                    $ctrl.options.title = $ctrl.translator.translate("Flex Administration Portal", "Administration Portal");
                });
            }
        }

        function openInboxModal() {
            $uibModal.open(
                {
                    templateUrl: "/static/app/modules/dashboard/layout/modalUserInbox.html",
                    controller: "ModalUserInbox",
                    controllerAs: "$ctrl",
                    backdrop: "static",
                    windowClass: "app-modal-window",
                    size: "lg"
                });
        }

        function openTenantSwitcher() {
            aonEbSelectorModal.openSelector('Tenant', 'Name', 'RecordID')
                .then(function (selection) {
                    $state.go($state.current, { tenantId: selection }, { reload: true });
                })
                .catch(function (reason) {
                    if (reason !== "cancel") {
                        console.log("aonEbInputSelector.openSelector() : " + reason);
                    }
                });
        }
    }
})();