(function () {
    'use strict';

    angular.module('app')
        .factory('resource', ['RequestContext', '$resource', 'giConstant', Resource]);

    function Resource(RequestContext, $resource, giConstant) {

        return function (url, params, methods) {

            if (url && url.toLowerCase().substring(0, "http") !== "http") {
                url = RequestContext.PathAPI + url;
            }

            // Add separte methods for update and create rather than use save POST for both.
            var defaults = {
                update: { method: 'put' },
                create: { method: 'post' }
            };

            _.each(methods, function (method) {
                if (method.url && method.url.toLowerCase().substring(0, "http") !== "http") {
                    method.url = RequestContext.PathAPI + method.url;
                }
            });
            methods = angular.extend(defaults, methods);

            var resource = $resource(url, params, methods);

            var idParam = params.id.substring(1); // Require an id parameter for the uid, strip off '@' prefix.

            // convert save requests to create POST for new records or update PUT for existing records.
            resource.save = function (parameters, postData, success, error) {
                if (!postData[idParam] || postData[idParam] === giConstant.NEW_RECORD) {
                    delete postData[idParam];
                    return this.create(parameters, postData, success, error);
                }
                else {
                    return this.update(parameters, postData, success, error);
                }
            };

            // convert $save requests to $create POST for new records or $update PUT for existing records.
            resource.prototype.$save = function (parameters, success, error) {
                if (!this[idParam] || this[idParam] === giConstant.NEW_RECORD) {
                    delete this[idParam];
                    return this.$create(parameters, success, error);
                }
                else {
                    return this.$update(parameters, success, error);
                }
            };

            return resource;
        };

    }

})();