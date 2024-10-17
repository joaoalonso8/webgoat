(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .service('aonEbCommonModals', ['$uibModal', 'flexContext', constructor]);

    function constructor($uibModal, flexContext) {

        /* Service */
        var service = {
            confirm: showConfirmModal,
            confirmEntityAction: confirmEntityAction,
            confirmEntityCopy: confirmEntityCopy,
            confirmEffectiveDate: showConfirmEffectiveDateModal,
            displayInfoModal: showDisplayInfoModal,
            saveGridFilter: saveGridFilter
        };

        return service;

        /* Members */

        function showConfirmModal(options) {
         
            var modalInstance = $uibModal.open({
                component: 'aonEbCommonConfirmModal',
                resolve: {
                    options: function () {
                        return options;
                    }
                },
                backdrop: 'static',
                size: options.size || 'md'
            });

            modalInstance.result.then(
                function () { // User hit OK
                    if (options.onOk) {
                        options.onOk();
                    }
                },
                function () {
                    if (options.onCancel) {
                        options.onCancel();
                    }
                }
            );
        }

        function confirmEntityAction(options, entity) {

            var modalInstance = $uibModal.open({
                component: 'aonEbConfirmEntityActionModal',
                resolve: {
                    options: function () {
                        return options;
                    },
                    entity: function () {
                        return entity;
                    }
                },
                backdrop: 'static',
                size: options.size || 'md'
            });

            modalInstance.result.then(
                function () { // User hit OK
                    if (options.onOk) {
                        options.onOk();
                    }
                },
                function () {
                    if (options.onCancel) {
                        options.onCancel();
                    }
                }
            );
        }

        function confirmEntityCopy(options, entity) {
            var modalInstance = $uibModal.open({
                component: 'aonEbConfirmEntityCopyModal',
                resolve: {
                    options: function () {
                        return options;
                    },
                    entity: function () {
                        return entity;
                    }
                },
                backdrop: 'static',
                size: options.size || 'md'
            });

            modalInstance.result.then(
                function (data) { // User hit OK
                    if (options.onOk) {
                        options.onOk(data);
                    }
                },
                function () {
                    if (options.onCancel) {
                        options.onCancel();
                    }
                }
            );
        }

        function showConfirmEffectiveDateModal(options) {


            var key = 'effectiveDateCookieKey_' + flexContext.User.FullName;
            var dontShowDialog = localStorage.getItem(key);

            if (dontShowDialog) {
                options.onOk();
            }
            else {
                var modalInstance = $uibModal.open({
                    component: 'aonEbConfirmEffectiveDateModal',
                    resolve: {
                        effectiveDate: function () {
                            return options.effectiveDate;
                        }
                    },
                    backdrop: 'static',
                    size: 'md'
                });

                modalInstance.result.then(
                    function (dontShowAgain) {
                        if (dontShowAgain) {
                            localStorage.setItem(key, 'true');
                        }
                        if (options.onOk) {
                            options.onOk();
                        }
                    },
                    function () {
                        if (options.onCancel) {
                            options.onCancel();
                        }
                    }
                );
            }
        }

        function showDisplayInfoModal(options) {

            var modalInstance = $uibModal.open({
                component: 'aonEbDisplayInfoModal',
                resolve: {
                    options: function () {
                        return options;
                    }
                },              
                size: options.size || 'md'
            });

            modalInstance.result.then(
                function () { // User hit OK
                    if (options.onOk) {
                        options.onOk();
                    }
                },
                function () {
                    if (options.onCancel) {
                        options.onCancel();
                    }
                }
            );
        }

        function saveGridFilter(options) {

            var modalInstance = $uibModal.open({
                component: 'aonEbSaveGridFiltersModal',
                resolve: {
                    options: function () {
                        return options;
                    }
                },
                size: options.size || 'sm'
            });

            modalInstance.result.then(
                function (data) { // User hit OK
                    if (options.onOk) {
                        options.onOk(data);
                    }
                },
                function () {
                    if (options.onCancel) {
                        options.onCancel();
                    }
                }
            );
        }

    }
})();