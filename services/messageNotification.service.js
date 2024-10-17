(function () {
    'use strict';

    angular.module('app').service('messageNotificationService', ['$interval', 'messageService', messageNotificationService]);

    function messageNotificationService($interval, messageService) {
        /* Config */
        var timeout = 600000, /* 10 mins*/
            notifyInterval,
            messageData = {
                count: 0
            };

        /* Service */

        var service = {
            start: start,
            stop: stop,
            forceUpdate: forceUpdate,
            messageData: messageData
        };

        return service;

        /* Members */

        function start() {
            if (angular.isDefined(notifyInterval)) return; // already running

            notifyInterval = $interval(refresh, timeout);
            forceUpdate();
        }

        function stop() {
            if (angular.isDefined(notifyInterval)) {
                $interval.cancel(notifyInterval);
                notifyInterval = undefined;
            }
        }

        function forceUpdate() {
            refresh();
        }

        function refresh() {
            messageService.getCount().then(function (count) {
                messageData.count = count;
            }).catch (function (err) {
                console.log (err);
            });
        }
    }
})();