(function () {
    'use strict';

    angular
        .module('app')
        .factory('qdbService', constructor);

    constructor.$inject = ['$http', '$q', 'RequestContext', 'aonEbApp'];

    function constructor($http, $q, RequestContext, aonEbApp) {

        var LogMessageStub = 'qdbService: ';

        return {
            getQDBEmployeeCounts: getQDBEmployeeCounts,
            getQDBEmployeeErrorsCounts: getQDBEmployeeErrorsCounts,
            getQDBEmployeeJoiners: getQDBEmployeeJoiners,
            getQDBInstanceSummary: getQDBInstanceSummary,
            getQDBInstanceSummaryWithRetry: getQDBInstanceSummaryWithRetry,
            postImportPromote: postImportPromote,
            exportNewJoiners: exportNewJoiners,
            exportLeavers: exportLeavers,
            exportErrors: exportErrors,
            exportChanges: exportChanges,
            getQDBImportElections: getQDBImportElections,
            getEOIBreakdown: getEOIBreakdown,
            exportRejectFile: exportRejectFile,
            exportPromotionFile: exportPromotionFile,
            exportLogFile: exportLogFile,
            exportAllFile: exportAllFile,
            exportUploadFile: exportUploadFile,
            exportPrePromoteEventFile: exportPrePromoteEventFile,
            exportFile: exportFile,
            getExportDefinitionFiles: getExportDefinitionFiles,
            getInterchangeErrors: getInterchangeErrors,
            getExportTemplateRecordTypes: getExportTemplateRecordTypes
        };

        function getQDBEmployeeCounts(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Flex/EmployeeCounts/' + InterchangeInstance_RecordID,
                {
                    headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }
        function getInterchangeErrors(interchangeId, InstanceId) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Flex/Import/' + interchangeId + '/InterchangeErrors/' + InstanceId,
                {
                    headers: { 'GI-QDB-INSTANCE': InstanceId }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }

        // 
        function getQDBEmployeeErrorsCounts(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Flex/EmployeeErrorsCount/' + InterchangeInstance_RecordID,
                {
                    headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }

        // 
        function getQDBEmployeeJoiners(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Flex/EmployeeJoiners/' + InterchangeInstance_RecordID,
                { headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID } })
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }

        // 
        function getExportTemplateRecordTypes(recordId, mapfilename) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Flex/ExportTemplates/RecordTypes/' + recordId + '/?mapfilename=' + mapfilename)
            .then(function (response) {
                deferred.resolve(response.data);
            })
            .catch(function (response) {
                deferred.reject(response.data);
            });
            return deferred.promise;
        }

        function getQDBInstanceSummaryWithRetry(InterchangeInstance_RecordID, attempt, retry) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Flex/EtlInstance/' + InterchangeInstance_RecordID + '/' + attempt + '/' + retry,
                { headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID } })
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }

        function getQDBInstanceSummary(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + 'Flex/EtlInstance/' + InterchangeInstance_RecordID,
                {
                    headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }

        function getQDBImportElections(path, InterchangeInstance_RecordID, recordID) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + path + recordID,
                {
                    headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }


        function postImportPromote(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            $http.post(RequestContext.PathAPI + 'Flex/EtlInstance/Promote/' + InterchangeInstance_RecordID,
                {
                    headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID }
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

        function exportNewJoiners(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/ExportNewJoiners/' + InterchangeInstance_RecordID, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function exportLeavers(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/ExportLeavers/' + InterchangeInstance_RecordID, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function exportRejectFile(InterchangeInstance_RecordID, fileType) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/ExportRejectFile/' + InterchangeInstance_RecordID + '/?fileType=' + fileType, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }
        function exportAllFile(InterchangeInstance_RecordID, fileType) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/AllInstanceInfo/' + InterchangeInstance_RecordID + '/?fileType=' + fileType, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }
        function exportUploadFile(InterchangeInstance_RecordID, fileType) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/UploadedFile/' + InterchangeInstance_RecordID + '/?fileType=' + fileType, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }
        function exportLogFile(InterchangeInstance_RecordID, fileType) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/ExportLogFile/' + InterchangeInstance_RecordID + '/?fileType=' + fileType, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }
        function exportFile(instanceId, fileType) {
            var deferred = $q.defer();
            var headers = {
                data: "GI-QDB-INSTANCE=" + instanceId,
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/ExportFile/' + instanceId + '/?fileType=' + fileType, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }
        function getExportDefinitionFiles(instanceId, fileType) {
            var deferred = $q.defer();          
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/ExportDefinitionFiles/' + instanceId + '/?fileType=' + fileType)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });
            return deferred.promise;
        }

        function exportPrePromoteEventFile(InterchangeInstance_RecordID, fileType) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/PrePromoteEvents/' + InterchangeInstance_RecordID + '/?fileType=' + fileType, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function exportPromotionFile(InterchangeInstance_RecordID, fileType) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/ExportPromotionFile/' + InterchangeInstance_RecordID + '/?fileType=' + fileType, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function exportErrors(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/ExportErrors/' + InterchangeInstance_RecordID, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function exportChanges(InterchangeInstance_RecordID) {
            var deferred = $q.defer();
            var headers = {
                'GI-QDB-INSTANCE': InterchangeInstance_RecordID
            };
            aonEbApp.fileDownload(RequestContext.PathAPI + 'Flex/Document/Etl/ExportChanges/' + InterchangeInstance_RecordID, headers)
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function getEOIBreakdown(path, InterchangeInstance_RecordID, recordID) {
            var deferred = $q.defer();
            $http.get(RequestContext.PathAPI + path + recordID,
                {
                    headers: { 'GI-QDB-INSTANCE': InterchangeInstance_RecordID }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
                    deferred.reject(response.data);
                });

            return deferred.promise;
        }
    }
})();
