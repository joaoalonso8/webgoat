(function () {
    'use strict';

    angular.module('app').service('kendoGridDefaultsService', [kendoGridDefaultsService]);

    function kendoGridDefaultsService() {

        var service = {
            data: {},
            mergeDefaults: mergeDefaults
        };

        return service;

        function loadDefaults(myTranslator) {

            service.data.pageable = {
                //messages: {
                //    display: "{0} - {1} " + myTranslator.translate("of", "of") + " {2} " + myTranslator.translate("items", "items") + "",
                //    empty: myTranslator.translate("No records to display.", "No records to display."),
                //    page: myTranslator.translate("Page", "Page"),
                //    of: myTranslator.translate("of", "of") + " {0}", //{0} is total amount of pages
                //    itemsPerPage: myTranslator.translate("itemsPerPage", "items per page"),
                //    first: myTranslator.translate("FirstPage", "First Page"),
                //    previous: myTranslator.translate("PreviousPage", "Previous Page"),
                //    next: myTranslator.translate("NextPage", "Next Page"),
                //    last: myTranslator.translate("LastPage", "Last Page")
                //},
                pageSize: 20,
                pageSizes: [20, 40, 60, 80, 100]
            };

            service.data.filterable = true;
            //service.data.filterable = {
            //    name: "FilterMenu",
            //    extra: true, // turns on/off the second filter option
            //    messages: {
            //        info: "Show items with value that:", // sets the text on top of the filter menu
            //        filter: "Filter", // sets the text for the "Filter" button
            //        clear: "Clear", // sets the text for the "Clear" button

            //        // when filtering boolean numbers
            //        isTrue: "is true", // sets the text for "isTrue" radio button
            //        isFalse: "is false", // sets the text for "isFalse" radio button

            //        //changes the text of the "And" and "Or" of the filter menu
            //        and: "And",
            //        or: "Or"
            //    },
            //    operators: {
            //        //filter menu for "string" type columns
            //        string: {
            //            eq: "Equal to",
            //            neq: "Not equal to",
            //            startswith: "Starts with",
            //            contains: "Contains",
            //            endswith: "Ends with"
            //        },
            //        //filter menu for "number" type columns
            //        number: {
            //            eq: "Equal to",
            //            neq: "Not equal to",
            //            gte: "Is greater than or equal to",
            //            gt: "Is greater than",
            //            lte: "Is less than or equal to",
            //            lt: "Is less than"
            //        },
            //        //filter menu for "date" type columns
            //        date: {
            //            eq: "Equal to",
            //            neq: "Not equal to",
            //            gte: "Is after or equal to",
            //            gt: "Is after",
            //            lte: "Is before or equal to",
            //            lt: "Is before"
            //        }
            //    }
            //}
        };

        function mergeDefaults(kgridOverrides, myTranslator) {
            loadDefaults(myTranslator);
            return $.extend(true, {}, service.data, kgridOverrides);
        };

    }

})();