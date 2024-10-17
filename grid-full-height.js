(function () {
    'use strict';

    angular.module('gridfullheight', [])

        .directive('gridFullHeight', ['$window', '$timeout', function ($window, $timeout) {

            return {
                restrict: 'A',
                link: function (scope, el, attrs) {

                    if (attrs.gridFullHeight === "" || scope.$eval(attrs.gridFullHeight)) {
                        scope.onResize = function () {
                            var header = document.getElementsByTagName('header')[0];
                            var toolbar = document.getElementsByTagName('nav')[1];
                            var gridElement = angular.element(el);
                            var dataArea = gridElement.find(".k-grid-content");
                            var otherElements = gridElement.children().not(".k-grid-content");
                            var otherElementsHeight = 0;
                            otherElements.each(function () {
                                otherElementsHeight += $(this).outerHeight();
                            });
                            if (typeof header !== "undefined" && typeof toolbar !== "undefined") {
                                dataArea.height($window.innerHeight - header.clientHeight - toolbar.clientHeight - otherElementsHeight - 24);
                            }
                        }

                        angular.element($window).on('resize', function () {
                            scope.onResize();
                            scope.$apply();
                        })

                        $timeout(function () {
                            scope.onResize();
                            scope.$apply();
                        }, 0);
                    }

                }
            };

        }]);
})();