(function () {
    'use strict';

    angular
        .module('app')
        .service('aonEbRouter', constructor);

    constructor.$inject = ['$state', '$transitions', '$injector', '$timeout', 'aonEbApp'];

    function constructor($state, $transitions, $injector, $timeout, aonEbApp) {

        var self = this;
        self.detail = {};
        self.loading = false;

        var service = {
            getCurrentState: getCurrentState,
            getCurrentParams: getCurrentParams,
            buildEntityOpenDetails: buildEntityOpenDetails,
            openWindow: openWindow,
            openView: openView,
            openEntity: openEntity,
            updateUrl: updateUrl,
            routeTo: routeTo,
            onBefore: $transitions.onBefore,
            onSuccess: $transitions.onSuccess,
            onStart: $transitions.onStart,
            onExit: $transitions.onExit,
            onRetain: $transitions.onRetain,
            onEnter: $transitions.onEnter,
            onFinish: $transitions.onFinish,
            onError: $transitions.onError
        }

        return service;

        function getCurrentState() {
            return $state.current.url;
        }

        function getCurrentParams() {
            return $state.params;
        }

        function openWindow(location, params, target, options) {
            var statParams = angular.merge(getCurrentParams(), params ? params : {});
            var win = aonEbApp.openWindow($state.href(location, statParams), target ? target : '_blank', options ? options : 'status=0,toolbar=0,resizable=1,scrollbars=1');
            if (win) {
                win.focus();
                checkPopUpClosed(win);
            }
        }

        function openView(location, params, options) {
            var statParams = angular.merge(getCurrentParams(), params ? params : {});
            $state.go(location, statParams, options ? options : null);
        }

        function openEntity(entityType, params, options, detail, openIcon) {
            if (angular.equals({}, self.detail)) {
                buildEntityOpenDetails(entityType, detail, openIcon);
            }
            var stateParams = buildRouteParams();
            var routeParams = {};
            if (!routeParams[stateParams]) {
                routeParams[stateParams] = params.id
            }
            if (self.detail && self.detail.openAs === 'window') {
                if (!routeParams.sessionDate) {
                    routeParams.sessionDate = aonEbApp.getSessionDate();
                }
                openWindow(self.detail.target, routeParams);
            }
            else if (self.detail && self.detail.openAs === 'view') {
                openView(self.detail.target, routeParams);
            }
            else if ($ctrl.detail && $ctrl.detail.openAs === 'modal') {
                var modalInstance = $uibModal.open(
                    {
                        component: $ctrl.detail.target,
                        backdrop: 'static',
                        size: self.detail.size || 'lg',
                        resolve: {
                            //  RecordID: function () { return dataItem.RecordID; },
                            Params: angular.merge(getCurrentParams(), params ? params : {})
                        }
                    });
                return modalInstance;
            }
        }

        function buildEntityOpenDetails(entityType, detail, openIcon) {
            self.detail = detail;

            openIcon = openIcon ? openIcon : 'aon-eb-icon-open';
            if (!self.detail || !self.detail.openAs) {
                // Check if a wizard state exists for the given entity type
                var state = $state.get('tenant.' + aonEbApp.camelToKebabCase(entityType) + '-wizard');
                if (state !== null) {
                    // Matching state found so assume this will open as secondary window.
                    self.detail = {
                        openAs: 'window',
                        target: state.name
                    };
                    openIcon = 'aon-eb-icon-open-window';
                    return self.detail;
                }

                //Check if a view state exists for the given entity type
                var stateName = $state.current.name;
                var posLastSeparator = stateName.lastIndexOf('.');
                if (posLastSeparator > 0) {
                    var statePrefix = stateName.substring(0, posLastSeparator + 1);

                    var state = $state.get(statePrefix + aonEbApp.camelToKebabCase(entityType) + '-details');
                    if (state !== null) {
                        // Matching state found so assume this will open as a new view in the current window.
                        self.detail = {
                            openAs: 'view',
                            target: state.name
                        };
                        openIcon = 'aon-eb-icon-open-view';
                        return self.detail;
                    }
                }

                // No state match so check if a suitable named modal component exists
                if ($injector.has('aonEb' + entityType + 'ModalDirective')) {
                    self.detail = {
                        openAs: 'modal',
                        target: 'aonEb' + entityType + 'Modal',
                        size: detail ? detail.size : 'lg'
                    };
                    openIcon = 'aon-eb-icon-open-modal';
                }
            }
            return self.detail;
        }

        function buildRouteParams() {
            var state = $state.get(self.detail.target);
            // Separate URL path and query string attributes
            var urlParts = state.url.split('?');
            var urlParams = urlParts[0].split('/');
            if (urlParts.length > 1) {
                urlParams = urlParams.concat(urlParts[1].split('&'));
            }
            var urlParams = urlParams.find(function (param) {
                return param.length > 2 && param[0] === ':' && param.substring(param.length - 2).toLowerCase() === 'id';
            })
            return urlParams ? urlParams.substring(1) : 'id';
        }

        function updateUrl(entityName, routeParams, reload) {           
            $timeout(function () {
                routeTo('.', routeParams, { notify: true, reload: reload ? reload : false, location: 'replace', inherit: true });
            }, 0, false);
        }

        function routeTo(location, statParams, options) {
            $state.go(location, statParams, options ? options : null);
        }

        function checkPopUpClosed(win) {
            // TODO: Where is the clean up for this, it should be cleared if controller destroyed!!!
            var timer = setInterval(function () {
                if (win.closed) {
                    clearInterval(timer);
                    timers.delete(timer);
                    refresh();
                }
            }, 1000);
            timers.add(timer);
        };
    }

})();
