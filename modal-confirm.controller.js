(function () {
    'use strict';
    angular.module('app').controller('ModalConfirm', ['$scope', '$uibModalInstance', 'text', 'title', 'okText', 'cancelText', 'isConfirm', ModalConfirm]);

    function ModalConfirm($scope, $uibModalInstance, text, title, okText, cancelText, isConfirm) {
        var vm = this;

        $scope.text = text;
        $scope.title = title;
        $scope.okText = okText;
        $scope.cancelText = cancelText;
        $scope.isConfirm = isConfirm;

        $scope.ok = ok;
        $scope.cancel = cancel;

        function ok() {
            $uibModalInstance.close();
        }

        function cancel() {
            $uibModalInstance.dismiss();
        }
    }
})();