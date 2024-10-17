(function () {
    'use strict';

    angular.module('employeegrid', [])

        .directive('employeeGrid', ['$window', '$timeout', function ($window, $timeout) {

            return {
                restrict: 'A',
                link: function (scope, el, atts) {

                    function onResize() {
                        var header = document.getElementsByTagName('header')[0];
                        var employeeSearchContainer = document.getElementsByClassName('employee-search-container')[0];
                        var pageControlsCollapsePanel = document.getElementsByClassName('page-controls-collapse-panel')[0];
                        var employeeGridToolbar = document.getElementsByClassName('employee-grid-toolbar')[0];
                        var gridElement = angular.element(el);
                        var dataArea = gridElement.find(".k-grid-content");
                        var otherElements = gridElement.children().not(".k-grid-content");
                        var otherElementsHeight = 0;
                        otherElements.each(function () {
                            otherElementsHeight += $(this).outerHeight();
                        });
                        if (typeof header !== "undefined" && typeof employeeSearchContainer !== "undefined") {
                            dataArea.height($window.innerHeight - header.clientHeight - employeeSearchContainer.clientHeight - pageControlsCollapsePanel.clientHeight - employeeGridToolbar.clientHeight - otherElementsHeight - 75);
                        }
                        scope.$apply();
                    }

                    window.angular.element($window).on('resize', onResize);

                    $timeout(function () {
                        onResize();
                    }, 0);

                    function cleanUp() {
                       window.angular.element($window).off('resize', onResize);
                    }

                    scope.$on('$destroy', cleanUp);
                }
            };

        }]);
})();