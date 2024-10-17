(function () {
    'use strict';
    angular.module('app').controller('ModalConfirmOK', ['$scope', '$uibModalInstance', 'text', 'title', 'okText', 'isConfirm', ModalConfirmOk]);

    function ModalConfirmOk($scope, $uibModalInstance, text, title, okText, isConfirm) {
        var vm = this;

        $scope.text = text;
        $scope.title = title;
        $scope.okText = okText;
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