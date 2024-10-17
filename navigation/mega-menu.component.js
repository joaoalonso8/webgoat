(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbMegaMenu', {
            templateUrl: '/static/app/common/navigation/mega-menu.component.html',
            bindings: {
                menu: '<'
            },
            controller: ['aonEbRouter', '$window', '$location', '$element', '$state', '$timeout', 'aonEbApp', 'aonEbNavigationService', controller]
        });

    function controller(aonEbRouter, $window, $location, $element, $state, $timeout, aonEbApp, aonEbNavigationService) {
        var $ctrl = this;
        $ctrl.go = go;
        $ctrl.toggle = toggle;
        $ctrl.isMenuItemEnabled = isMenuItemEnabled;

        var onSuccessHandle;

        $ctrl.$onInit = function () {
            $ctrl.active = null;
            onSuccessHandle = aonEbRouter.onSuccess({}, function (transition) {
                var newSelected = findSelected(transition.to().name, $ctrl.menu.items);
                if (newSelected != -1) {
                    $ctrl.selected = newSelected;
                }
            });
        };

        $ctrl.$onDestroy = function () {
            onSuccessHandle();
        }

        $ctrl.$onChanges = function (changes) {
            if (changes.menu) {
                if ($ctrl.active) {
                    closeMenu();
                }
                if (changes.menu.currentValue) {
                    aonEbNavigationService.setMenu($ctrl.menu.items);
                    $ctrl.selected = findSelected($state.current.name, changes.menu.currentValue.items);
                }
            }
        }

        function clickHandler(e) {
            if ($element !== e.target && !$element[0].contains(e.target)) {
                //$scope.$apply(function () {
                    closeMenu();
                //});
            }
        }

        function toggle($event, tabIndex) {
            // Item has navigation
            if ($ctrl.menu.items[tabIndex].state) {
                go($ctrl.menu.items[tabIndex]);
            }
            // Opening menu
            else if ($ctrl.active === null) {
                angular.element($window).on('click', clickHandler);
            }
            // Closing menu
            else if ($ctrl.active === tabIndex) {
                closeMenu();
            }
            // Switching menu, allow default handling
        }

        function go(item) {
            if (isMenuItemEnabled(item)) {
                if (item.state) {
                    if (item.newWindow) {
                        var url = $state.href(item.state, item.stateParams);
                        var win = aonEbApp.openWindow(url);
                    } else {
                        $state.go(item.state, item.stateParams);
                    }
                }
                else if (item.href) {
                    //compared to the non-AngularJS version location.host which returns hostname:port, $location.host() returns the hostname portion only.
                    var targetUrl = $location.protocol() + "://" + location.host + item.href
                    aonEbApp.openWindow(targetUrl, '_blank', 'status=0,toolbar=0,resizable=1,width=1200,height=800');
                }
                $timeout(function () {
                    closeMenu();
                });
            }
        }

        function findSelected(state, items) {
            return _.findIndex(items, function (x) {
                if (x.items) {
                    return findSelected(state, x.items) !== -1;
                }
                return x.state === state;
            });
        }

        function isMenuItemEnabled(item) {
            try {
                return !item.hidden && (item.enableOn == null || item.enableOn(item));
            } catch (e) {
                console.log(e);
                return false;
            }
        }

        function closeMenu() {
            $ctrl.active = null;
            angular.element($window).off('click', clickHandler);
        }
    }
})();