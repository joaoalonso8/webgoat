//Validates that the value in the annotated control is unique within the list passed in.
//<input type="text" class="form-control" id="inputName" name="name" ng-model="vm.policy.benefitYear.Name" unique="vm.benefitYearNames">
//In this example, vm.benefitYearNames is a string array of existing benefit year names, and we want to ensure the user doesn't choose a name that already exists.
(function () {
    'use strict';

    angular
        .module('app')
        .directive('unique', unique);

    unique.$inject = ['$interpolate'];
    
    function unique($interpolate) {
        return {

            require: 'ngModel',
            link: function ($scope, $element, $attrs, ctrl) {
                var validate = function (viewValue) {
                    var el = $element;
                    var scope = $scope;
                    var attrs = $attrs;
                    var list = eval('$scope.' + $attrs.unique);
                    ctrl.$setValidity('unique', true);
                    list.forEach(function (item) {
                        if (item==viewValue)
                        {
                            ctrl.$setValidity('unique', false);
                        }
                    });
                    
                    return viewValue;
                };

                ctrl.$parsers.unshift(validate);
                ctrl.$formatters.push(validate);

                $attrs.$observe('unique', function () {
                    return validate(ctrl.$viewValue);
                });
               
            }
        };
    };
    
})();