(function () {
    'use strict';

    var app = angular.module('app');

    app.directive('giTranslate', ['$parse', 'translationService', function ($parse, translationService) {
        // Directive
        var directive = {
            restrict: 'A',
            link: link,
            scope: {
                term: '@giTranslate',
                boundTerm: '&bKey',
                dictionary: '@entity',
                boundDictionary: '&bEntity',
                giAttr: '@giAttr',
                prepend: '@',
                postpend: '@'
            }
        };

        return directive;

        function link(scope, element, attr) {
            var prepend = scope.prepend || '',
                postpend = scope.postpend || '',
                term = scope.term || $parse(scope.boundTerm)(scope),
                dictionary = scope.dictionary || $parse(scope.boundDictionary)(scope),
                giAttr = scope.giAttr;

            translationService.getTranslation(term, dictionary).then(function (translation) {
                if (angular.isDefined(translation)) {
                    if (giAttr)
                        element.attr(giAttr, prepend + translation + postpend);
                    else
                        element.text(prepend + translation + postpend);
                }
            });
        }
    }]);
})();