(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbWizardNavigation', {
            templateUrl: '/static/app/common/navigation/wizard-navigation.component.html',
            controller: ['translationService', 'aonEbNavigationService', controller]
        });

    function controller(translationService, aonEbNavigationService) {

        var $ctrl = this;

        $ctrl.$onInit = function () {
            $ctrl.aonEbNavigationService = aonEbNavigationService;
            translationService.getTranslator("ConfigWizardNavigation").then(function (data) {
                var translator = data;
                $ctrl.nextButtonCaption = translator.translate("Next", "Next");
                $ctrl.backButtonCaption = translator.translate("Back", "Back");
            });
        };
    }
})();