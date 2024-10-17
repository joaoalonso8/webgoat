(function () {
    'use strict';

    var app = angular.module('app');

    app.directive('giEmployeeInfoTooltip', ['$compile', 'employeeManager', 'translationService', '$filter', 'dateUtils', function ($compile, employeeManager, translationService, $filter, dateUtils) {
        var directive = {
            restrict: 'AE',
            scope: {
                giModifiedOn: '=',
                giModifiedBy: '=',
                giCreatedOn: '=',
                giCreatedBy: '=',
                giRecordExpiration: '=',
                giPageName: "@"
            },
            replace: false,
            templateUrl: '/static/app/common/directives/employee-information-tooltip/layout/gi-information-tooltip.html',
            link: function (scope, element, attrs) {
                var vm = {};
                scope.vm = vm;
                translationService.getTranslator("Employee").then(function (translator) {
                    vm.translator = translator;

                });
                scope.giModifiedOn = $filter('date')(scope.giModifiedOn, 'mediumDate');
                scope.giCreatedOn = $filter('date')(scope.giCreatedOn, 'mediumDate');
                scope.giRecordExpiration = $filter('date')(scope.giRecordExpiration, 'mediumDate');

                if (angular.element("#grid").length == 0) {
                    angular.element(element).parents("form").append('<a><span id="backNav" class="back-nav" style="display:none">' + scope.giPageName + '</span></a><span class="back-nav" style="display:none"><a> >> History View</span></a><div class="personal-data"><div id="grid"></div></div>');
                }
                angular.element("#backNav").on("click", function () {
                    angular.element("section.panel").show();
                    angular.element("fieldset").show();
                    angular.element("#grid").remove();
                    angular.element(".personal-data").append('<div id="grid"></div>');
                });             
                    angular.element(".info-div").kendoTooltip({
                        autoHide: false,
                        position: "bottom",
                        content: $compile('<div><span>Modified On: </span><span>' + scope.giModifiedOn + '</span><span>,By: </span><span>' + scope.giModifiedBy + '</span><br /><span>Creatd On: </span><span>' + scope.giCreatedOn + '</span><span>,By: </span><span>' + scope.giCreatedBy + '</span></br><span>Record Effective&#92Expiration: </span><span>' + scope.giRecordExpiration + '</span></br><a class="more-info" ng-click="vm.loadData()">More History Information</a></div>')(scope)
                    });
               

              

                vm.loadData = function () {
                    angular.element(".back-nav").show();
                    angular.element("section.panel").hide();
                    angular.element("fieldset").hide();
                    angular.element(".k-i-close").trigger("click");
                    angular.element(function () {
                        angular.element("#grid").kendoGrid({
                            dataSource: {
                                type: "json",
                                schema: {
                                    parse: function (data) {
                                        for (var i = 0; i < data.length; i++) {
                                            var modifiedondate = new Date(data[i].ModifiedOn);
                                            data[i].ModifiedOnDate = dateUtils.wholeDate(modifiedondate.toISOString());
                                        }
                                        return data;
                                    },
                                    model: {
                                        fields: {
                                            EntityName: { type: "string", editable: false },
                                            RecordEffective: { type: "date", editable: false },
                                            ModifiedOn: { type: "date", editable: false },
                                            ModifiedOnDate: { type: "date", editable: false },
                                            ModifiedBy: { type: "string", editable: false },
                                            Comments: { type: "string", editable: false }
                                        }
                                    }
                                },
                                serverPaging: false,
                                serverSorting: false,
                                autosync: false,
                                sort: [
                                    { field: "ModifiedOn", dir: "desc" }
                                ],
                                transport: {
                                    read: function (op) {
                                        var data = [];

                                        //Demographics
                                        vm.employeeDemographics = employeeManager.getEmployeeDemographicHistory();
                                        _.each(vm.employeeDemographics, function (item) {
                                            item.EntityName = "Employee Demographic";
                                        });

                                        if (vm.employeeDemographics != null && vm.employeeDemographics != undefined)
                                            data = data.concat(vm.employeeDemographics);

                                        //Contacts
                                        vm.employeeContacts = employeeManager.getEmployeeContactHistory();
                                        _.each(vm.employeeContacts, function (item) {
                                            item.EntityName = "Employee Contacts";
                                        });

                                        if (vm.employeeContacts != null && vm.employeeContacts != undefined)
                                            data = data.concat(vm.employeeContacts);

                                        //Jobs
                                        vm.employeeJobs = employeeManager.getEmployeeJobHistory();
                                        _.each(vm.employeeJobs, function (item) {
                                            item.EntityName = "Employee Jobs";
                                        });

                                        if (vm.employeeJobs != null && vm.employeeJobs != undefined)
                                            data = data.concat(vm.employeeJobs);

                                        //Compensation
                                        vm.employeeCompensation = employeeManager.getEmployeeCompensationHistory();
                                        _.each(vm.employeeCompensation, function (item) {
                                            item.EntityName = "Employee Compensation";
                                        });

                                        if (vm.employeeCompensation != null && vm.employeeCompensation != undefined)
                                            data = data.concat(vm.employeeCompensation);

                                        //BankAccount
                                        vm.employeeBankAccount = employeeManager.getEmployeeBankAccountHistory();
                                        _.each(vm.employeeBankAccount, function (item) {
                                            item.EntityName = "Employee BankAccount";
                                        });

                                        if (vm.employeeBankAccount != null && vm.employeeBankAccount != undefined)
                                            data = data.concat(vm.employeeBankAccount);

                                        //Payroll
                                        vm.employeePayroll = employeeManager.getEmployeePayrollHistory();
                                        _.each(vm.employeePayroll, function (item) {
                                            item.EntityName = "Employee Payroll";
                                        });

                                        if (vm.employeePayroll != null && vm.employeePayroll != undefined)
                                            data = data.concat(vm.employeePayroll);

                                        op.success(data);
                                    }
                                },
                                pageSize: 20
                            },
                            scrollable: true,
                            sortable: true,
                            reorderable: true,
                            resizable: true,
                            selectable: true,
                            filterable: true,
                            autosync: false,
                            pageable: {
                                pageSize: 20,
                                pageSizes: [20, 40, 60, 80, 100]
                            },
                            columns: [{ field: "EntityName", title: vm.translator.translate("Entity Name", "Entity Name") },
                                           { field: "RecordEffective", title: vm.translator.translate("Entity Effective Date", "Entity Effective Date"), format: "{0:d}" },
                                             {
                                                 field: "ModifiedOnDate", title: vm.translator.translate("Modified On", "Modified On"),
                                                 template: function (dataItem) { return dateUtils.format(dataItem.ModifiedOn, "G") }
                                             },
                                            { field: "ModifiedBy", title: vm.translator.translate("Modified By", "Modified By") },
                                            { field: "Comments", title: vm.translator.translate("Comments", "Comments") }

                            ],
                            editable: false
                        });
                    });

                }

            }
        };

        return directive;

    }]);

})();
