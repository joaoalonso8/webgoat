'use strict';

/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('aon.eb.common')
  .directive('aonEbCodemirror', aonEbCodemirrorDirective);

aonEbCodemirrorDirective.$inject = ["$timeout", "$http", "RequestContext"];

function aonEbCodemirrorDirective($timeout, $http, RequestContext) {
    var CMAttachedProperty;
    return {
        restrict: 'EA',
        require: '?ngModel',
        compile: function compile() {

            // Require CodeMirror
            if (angular.isUndefined(window.CodeMirror)) {
                throw new Error('ui-codemirror needs CodeMirror to work... (o rly?)');
            }

            return postLink;
        }
    };

    function postLink(scope, iElement, iAttrs, ngModel) {
        var codemirrorOptions = angular.extend(
          { value: iElement.text() },
          {},
          scope.$eval(iAttrs.aonEbCodemirror),
          scope.$eval(iAttrs.aonEbCodemirrorOpts)
        );
        if (typeof (iElement.prop('disabled')) !== "undefined") {
            var isDisabled = false;
            if (iElement.prop('disabled')) {
                isDisabled = iElement.prop('disabled');
            }
            else {
                isDisabled = codemirrorOptions.isDisabled === 'true' || codemirrorOptions.isDisabled === true;
            }

            codemirrorOptions.readOnly = isDisabled;
        }

        var codemirror = newCodemirrorEditor(iElement, codemirrorOptions);
        if (codemirror.display != undefined && codemirror.display != null && codemirror.display.wrapper != undefined && codemirror.display.wrapper != null) {
            var height = codemirrorOptions.height || '300px';
            codemirror.display.wrapper.style.height = height;
        }
            
        if (typeof (codemirrorOptions.mode) !== "undefined") {
            if (codemirrorOptions.mode.toString().toLowerCase() === "jackal") {
                $http.get(RequestContext.PathAPI + 'Flex/Jackal', { cache: true }).then(function (response) {
                    var fn = new Object();
                    //fn.func = response.data;
                    //eval(fn.func);
                    //window.JackalJson = getData();
                    window.JackalJson = response.data;
                });
            }
        }
        configOptionsWatcher(
          codemirror,
          iAttrs.aonebCodemirror || iAttrs.aonebCodemirrorOpts,
          scope
        );

        configNgModelLink(codemirror, ngModel, scope);

        configUiRefreshAttribute(codemirror, iAttrs.uiRefresh, scope);

        // Allow access to the CodeMirror instance through a broadcasted event
        // eg: $broadcast('CodeMirror', function(cm){...});
        scope.$on('CodeMirror', function (event, callback) {
            if (angular.isFunction(callback)) {
                callback(codemirror);
            } else {
                throw new Error('the CodeMirror event requires a callback function');
            }
        });

        // onLoad callback
        if (angular.isFunction(codemirrorOptions.onLoad)) {
            codemirrorOptions.onLoad(codemirror);
        }
    }

    function newCodemirrorEditor(iElement, codemirrorOptions) {
        var codemirror;
        //codemirror = window.CodeMirror.fromTextArea(iElement[0], codemirrorOptions);
        if (iElement[0].tagName === 'TEXTAREA') {
            // Might bug but still ...
            codemirror = window.CodeMirror.fromTextArea(iElement[0], codemirrorOptions);
        } else {
            iElement.html('');
            codemirror = new window.CodeMirror(function (cm_el) {
                iElement.append(cm_el);
            }, codemirrorOptions);
        }
        if (typeof (iElement.attr("ng-model") !== "undefined")) {
            CMAttachedProperty = iElement.attr("ng-model");
        }
        return codemirror;
    }

    function configOptionsWatcher(codemirror, uiCodemirrorAttr, scope) {
        if (!uiCodemirrorAttr) { return; }

        var codemirrorDefaultsKeys = Object.keys(window.CodeMirror.defaults);
        scope.$watch(uiCodemirrorAttr, updateOptions, true);
        function updateOptions(newValues, oldValue) {
            if (!angular.isObject(newValues)) { return; }
            codemirrorDefaultsKeys.forEach(function (key) {
                if (newValues.hasOwnProperty(key)) {

                    if (oldValue && newValues[key] === oldValue[key]) {
                        return;
                    }

                    codemirror.setOption(key, newValues[key]);
                }
            });
        }
    }

    function configNgModelLink(codemirror, ngModel, scope) {
        if (!ngModel) { return; }
        // CodeMirror expects a string, so make sure it gets one.
        // This does not change the model.
        ngModel.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
                return '';
            } else if (angular.isObject(value) || angular.isArray(value)) {
                throw new Error('ui-codemirror cannot use an object or an array as a model');
            }
            return value;
        });

        // Override the ngModelController $render method, which is what gets called when the model is updated.
        // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
        ngModel.$render = function () {
            //Code mirror expects a string so make sure it gets one
            //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
            var safeViewValue = ngModel.$viewValue || '';
            codemirror.setValue(safeViewValue);
        };


        // Keep the ngModel in sync with changes from CodeMirror
        codemirror.on('change', function (instance) {
            var newValue = normalizeLineEndings(instance.getValue());
            var oldValue = normalizeLineEndings(ngModel.$viewValue);
            if (newValue !== oldValue) {
                scope.$evalAsync(function () {
                    ngModel.$setViewValue(newValue);
                });
            }
        });
    }

    function normalizeLineEndings(value) {
        if (Object.prototype.toString.call(value) !== "[object String]") {
            return value;
        }
        return value
            .replace(/([^\r])\n/g, '$1\r\n')
            .replace(/\r([^\n])/g, '\r\n$1');
    }

    function configUiRefreshAttribute(codeMirror, uiRefreshAttr, scope) {
        if (!uiRefreshAttr) { return; }

        scope.$watch(uiRefreshAttr, function (newVal, oldVal) {
            // Skip the initial watch firing
            if (newVal !== oldVal) {
                $timeout(function () {
                    codeMirror.refresh();
                    if (typeof (CMAttachedProperty) !== "undefined") {
                        var currentVal = scope.$eval(CMAttachedProperty);
                        codeMirror.setValue(currentVal);
                    }
                });
            }
        });
    }

}