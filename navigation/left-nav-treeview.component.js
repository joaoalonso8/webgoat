(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbLeftNavTreeview', {
            templateUrl: '/static/app/common/navigation/left-nav-treeview.component.html',
            bindings: {
                //stateDetails: '<',
                options: '<',
                keyField: '<',
                textField: '<',
                childField: '<',
                onSelect: '<'
            },
            controller: controller
        });

    controller.$inject = ['$scope', '$state', 'aonEbRouter']

    function controller($scope, $state, aonEbRouter) {
        var $ctrl = this;
        $ctrl.onDataBound = onDataBound;

        var onSuccessHandle;
        var onErrorHandle;

        $ctrl.$onInit = function () {
            onSuccessHandle = aonEbRouter.onSuccess({}, function (transition) {
                checkTreeSelectionSync();
            });
            onErrorHandle = aonEbRouter.onError({}, function (transition) {
                checkTreeSelectionSync();
            });
        }

        $ctrl.$onDestroy = function () {
            onSuccessHandle();
            onErrorHandle();
        }

        function checkTreeSelectionSync() {
            var selectionParams = $ctrl.selection.stateParams;
            var stateParams = $state.params; //TODO: get Rob to look at this. This was initially just for line wizard. it's getting messy just by adding event wizard. need a generic way.
            if ((stateParams.lineId && (selectionParams.lineId !== stateParams.lineId ||
                (stateParams.benefitPlanId && selectionParams.benefitPlanId !== stateParams.benefitPlanId) ||
                (stateParams.coverageId && selectionParams.coverageId !== stateParams.coverageId))) ||
                (stateParams.eventId && (selectionParams.eventId !== stateParams.eventId || selectionParams.eventLineId !== stateParams.eventLineId)))
            {
                var tree = $ctrl.tree;
                var dataItem = findDataItemForCurrentState(tree.dataSource, $state.params);
                selectNodeFor(tree, dataItem);    
            }
        }

        $ctrl.$onChanges = function (changes) {
            if (changes.options) {
                if (changes.options.currentValue) {                   
                    if ($ctrl.tree) {                      
                        $ctrl.tree.setDataSource(hierarchicalDataSource());
                    }
                    else {
                        buildTreeOptions();
                    }                    
                }
            }
        }

        function buildTreeOptions() {
            // Set default data columns for key, label and child collection
            $ctrl.keyField = $ctrl.keyField || 'RecordID';
            $ctrl.textField = $ctrl.textField || 'Name';
            $ctrl.childField = $ctrl.childField || 'Children';           

            $ctrl.treeOptions = {
                autoScroll: true,
                dataTextField: $ctrl.textField,
                template: '<span class="k-in" ng-bind-html="dataItem[$ctrl.textField]"></span>',
                loadOnDemand: false,
                dataSource: hierarchicalDataSource(),
                select: function (e) {
                    $ctrl.selection = e.sender.dataItem(e.node);
                    if ($ctrl.onSelect) {
                        $ctrl.onSelect({
                            selection: function () {
                                return $ctrl.selection;
                            }
                        });
                    }
                }
            };
        }


        function hierarchicalDataSource() {
            // Convert options to a Kendo HierarchicalDataSource
            return new kendo.data.HierarchicalDataSource({
                data: $ctrl.options,
                schema: {
                    model: {
                        id: $ctrl.keyField,
                        children: $ctrl.childField
                    }
                }
            });
        }

        function onDataBound(e) {
            var tree = e.sender;
            var dataItem = findDataItemForCurrentState(tree.dataSource, $ctrl.selection ? $ctrl.selection.stateParams : $state.params);
            selectNodeFor(tree, dataItem);
            setTimeout(function () {
                tree.expand(".k-item");
            });
        }

        function selectNodeFor(tree, dataItem) {
            if (dataItem) {
                var activeNode = _.filter(tree.items(), function (node) {
                    return tree.dataItem(node).id === dataItem.id;
                })
                tree.select(activeNode);
                $ctrl.selection = dataItem;
            }
        }

        function findDataItemForCurrentState(dataSource, stateParams) {
            if (stateParams.lineId) {
                var lineMatch = _.filter(dataSource.data(), function (item) {
                    return item.RecordID === stateParams.lineId;
                })
                if (lineMatch.length === 1 && stateParams.benefitPlanId) {
                    var bpMatch = _.filter(lineMatch[0].children.data(), function (item) {
                        return item.RecordID === stateParams.benefitPlanId;
                    });
                    if (bpMatch.length === 1 && stateParams.coverageId) {
                        var covMatch = _.filter(bpMatch[0].children.data(), function (item) {
                            return item.RecordID === stateParams.coverageId;
                        })
                        return covMatch.length === 1 ? covMatch[0] : bpMatch[0];
                    }
                    else {
                        return bpMatch.length === 1 ? bpMatch[0] : lineMatch[0];
                    }
                }
                else {
                    return lineMatch.length === 1 ? lineMatch[0] : null;
                }
            } else if (stateParams.eventId)
            {
                var eventMatch = _.filter(dataSource.data(), function (item) {
                    return item.RecordID === stateParams.eventId;
                })
                if (eventMatch.length === 1 && stateParams.eventLineId) {
                    var eventLineMatch = _.filter(eventMatch[0].children.data(), function (item) {
                        return item.RecordID === stateParams.eventLineId;
                    });
                    return eventLineMatch.length === 1 ? eventLineMatch[0] : eventMatch[0];
                }
                else {
                    return eventMatch.length === 1 ? eventMatch[0] : null;
                }
            }
            else {
                return null;
            }
        }
    }

})();