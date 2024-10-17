
(function () {
    'use strict'
    angular.module('app').factory('SharedProperties', SharedProperties);

    function SharedProperties() {
        var selectedCostType = "PerPay";
        return {
            getSelectedCostType: function () {
                return selectedCostType;
            },
            setSelectedCostType: function (value) {
                selectedCostType = value;
            },
        }
    }

})();

