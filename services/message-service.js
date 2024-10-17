(function () {
    'use strict';

    angular.module('app').service('messageService', ['$http', '$q', 'RequestContext', controller]);

    function controller($http, $q, RequestContext) {

        var $ctrl = this;

        $ctrl.getUserInbox = function() {
            var deferred = $q.defer();
            $http({
                method: "GET", cache: false,
                url: RequestContext.PathAPI + 'Flex/UserInbox/GetInboxMessages'
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        $ctrl.getFlexUserInbox = function() {
            var deferred = $q.defer();
            $http({
                method: "GET", cache: false,
                url: RequestContext.PathAPI + 'Flex/UserInbox/GetFlexInboxMessages'
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        $ctrl.getMessageVersion = function getMessageVersion(messageRecordID) {
            var deferred = $q.defer();
            $http({
                method: "GET", cache: false,
                url: RequestContext.PathAPI + 'Flex/UserInbox/GetMessageVersion/?id=' + messageRecordID
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        $ctrl.getCount = function() {
            var deferred = $q.defer();
            $http({
                method: "GET", cache: false,
                url: RequestContext.PathAPI + 'Flex/UserInbox/Count'
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        $ctrl.gridDisplayNoResultsFound = function(grid, msg)
        {
            if (msg == null)
                msg = "No results found!";


            // Get the number of Columns in the grid
            var dataSource = grid.dataSource;
            var colCount = grid.element.find('.k-grid-header colgroup > col').length;

            // If there are no results place an indicator row
            if (dataSource._view.length == 0) {
                grid.element.find('.k-grid-content tbody')
                    .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" style="text-align:center"><b>' + msg + '</b></td></tr>');
            }

            // Get visible row count
            var rowCount = grid.element.find('.k-grid-content tbody tr').length;
        }

    }
})();