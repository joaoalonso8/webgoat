(function () {
    'use strict';

    //angular.module('app.utils', []);

    angular
        .module('app.utils')
        .service('numberUtils', [numberUtils]);

    /**
     * numberUtils provides helper functions to display numbers and currencies in a consistent manner
     */
    function numberUtils() {

        var service = {
            formatAsCurrency: formatAsCurrency,
            formatAsPercentage: formatAsPercentage,
            formatAsDecimal: formatAsDecimal
        };

        return service;

        function formatAsCurrency(currencySymbol, amount, showZeroAsDash) {
            if (amount === undefined || amount === null) {
                return "";
            }
            if (typeof (amount) !== "number") {
                console.log("amount is not a number");
                return "";
            }

            if (showZeroAsDash && Number(amount) === 0) {
                return "-";
            }
            else {
                return currencySymbol + kendo.format("{0:n2}", amount);
            }
        }

        function formatAsPercentage(amount, showZeroAsDash) {
            if (amount === undefined || amount === null) {
                return "";
            }
            if (typeof (amount) !== "number") {
                console.log("amount is not a number");
                return "";
            }

            if (showZeroAsDash && Number(amount) === 0) {
                return "-";
            }
            else {
                return kendo.format("{0:p2}", amount);
            }
        }
        
        function formatAsDecimal(amount, showZeroAsDash) {
            if (amount === undefined || amount === null) {
                return "";
            }
            if (typeof (amount) !== "number") {
                console.log("amount is not a number");
                return "";
            }

            if (showZeroAsDash && Number(amount) === 0) {
                return "-";
            }
            else {
                return kendo.format("{0:n2}", amount);
            }
        }
    }

})();