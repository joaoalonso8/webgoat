(function () {
    'use strict';

    angular.module('app').service('pageContextService', [pageContextService]);

    function pageContextService() {
        var context = {
            icon: '',
            breadcrumbs: [],
            titleComponents: []
        };

        return {
            context: context,
            clear: clearContext,
            setContextList: setContextList
        };

        function clearContext() {
            context.breadcrumbs.length = 0;
            context.titleComponents.length = 0;
        }

        function setContextList(contextList) {
            clearContext();
            _.each(contextList, function (pc) {
                if (pc.breadcrumbs && pc.breadcrumbs.length > 0) {
                    context.breadcrumbs = context.breadcrumbs.concat(pc.breadcrumbs);
                }

                if (pc.title) {
                    context.titleComponents = context.titleComponents.concat(pc.title);
                }

                if (pc.icon) {
                    context.icon = pc.icon;
                }
            });
        }
    }
})();