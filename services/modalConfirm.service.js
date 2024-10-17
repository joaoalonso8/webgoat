(function () {
    'use strict';

    angular.module('app').service('modalConfirmService', ['$uibModal', '$q', 'translationService', modalConfirmService]);

    function modalConfirmService($uibModal, $q, translationService) {
        /* Service */

        var service = {
            confirm: showConfirmationDialog,
            confirmok: showConfirmationOkDialog,
            confirmWithCommentModal: showConfirmWithCommentModal
        };
        return service;

        /* Members */
        function showConfirmationDialog(options) {
            $q.all([
                translationService.getTranslator('ConfirmService')
            ]).then(function (results) {
                var translator = results[0];
                options.text = options.text || translator.translate("AreYouSure", "Are you sure?");
                options.title = options.title || translator.translate("Confirm", "Confirm");
                options.okText = options.okText || translator.translate("OK", "OK");
                options.cancelText = options.cancelText || translator.translate("Cancel", "Cancel");
                options.isConfirm = options.isConfirm || true;

                var modalInstance = $uibModal.open({
                    templateUrl: '/static/app/common/layout/modal-confirm.html',
                    controller: 'ModalConfirm',
                    resolve: {
                        text: function () {
                            return options.text;
                        },
                        title: function () {
                            return options.title;
                        },
                        okText: function () {
                            return options.okText;
                        },
                        cancelText: function () {
                            return options.cancelText;
                        }
                        ,
                        isConfirm: function () {
                            return options.isConfirm;
                        }
                    },
                    backdrop: 'static',
                    size: 'md'
                });

                modalInstance.result.then(
                    function (res) { // User hit OK
                        if (options.onOk) {
                            options.onOk(res);
                        }
                    },
                    function () {
                        if (options.onCancel) {
                            options.onCancel();
                        }
                    }
            );
            }
            )
        };

        function showConfirmWithCommentModal(options) {
            var modalInstance = $uibModal.open({
                component: 'aonEbCommonConfirmCommentModal',
                resolve: {
                    options: function () {
                        return options;
                    }
                },
                backdrop: 'static',
                size: 'md'
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

        function showConfirmationOkDialog(options) {
            $q.all([
                translationService.getTranslator('ConfirmService')
            ]).then(function (results) {
                var translator = results[0];
                options.text = options.text || translator.translate("AreYouSure", "Are you sure?");
                options.title = options.title || translator.translate("Confirm", "Confirm");
                options.okText = options.okText || translator.translate("OK", "OK");
                options.isConfirm = options.isConfirm || true;

                var modalInstance = $uibModal.open({
                    templateUrl: '/static/app/common/layout/modal-confirmok.html',
                    controller: 'ModalConfirmOK',
                    resolve: {
                        text: function () {
                            return options.text;
                        },
                        title: function () {
                            return options.title;
                        },
                        okText: function () {
                            return options.okText;
                        },
                        isConfirm: function () {
                            return options.isConfirm;
                        }
                    },
                    backdrop: 'static',
                    size: 'md'
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
            )
        };
    }
})();