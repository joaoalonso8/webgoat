(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbEditEntityStructureModal', {
            templateUrl: '/static/app/common/modals/edit-entity-structure-modal.component.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: controller
        });

    controller.$inject = ['translationService', '$q', 'aonEbApp', 'structureManager']

    function controller(translationService, $q, aonEbApp, structureManager) {
        var $ctrl = this;
        $ctrl.translationEntity = "EntityStructure";
        $ctrl.isSaving = false;
        $ctrl.loaded = false;
        $ctrl.selectedBUs = [];
        $ctrl.selectedGUs = [];
        $ctrl.selectedTags = [];

        $ctrl.expand = expand;
        $ctrl.ok = ok;
        $ctrl.cancel = cancel;
        $ctrl.itemHtml = itemHtml;
        $ctrl.buCheck = buCheck;
        $ctrl.guCheck = guCheck;
        $ctrl.tagCheck = tagCheck;
        $ctrl.UncheckAllNodes = UncheckAllNodes;
        $ctrl.filter = filter;

        $ctrl.$onInit = function () {
            $ctrl.options = $ctrl.resolve.options;
            $ctrl.entityType = $ctrl.options.entityType;
            $ctrl.entityId = $ctrl.options.entityId;
            $ctrl.isDependentEntity = $ctrl.options.isDependentEntity;

            $q.all([
                translationService.getTranslator($ctrl.translationEntity),
                structureManager.getGeographicUnitsHierarchy(),
                structureManager.getBusinessUnitsHierarchy(),
                structureManager.getTags(),
                structureManager.getStructureEntityIntersects($ctrl.entityType, $ctrl.entityId)
            ]).then(function (data) {
                var i = 0;
                $ctrl.translator = data[i++];
                $ctrl.GeographicUnits = data[i++];
                $ctrl.BusinessUnits = data[i++];
                var allTags = data[i++];
                if ($ctrl.isDependentEntity) {
                    allTags.forEach(function (item) { if (item.IsDependent) { item.Name += ' *';}});
                    $ctrl.Tags = allTags.sort(function (a, b) { return ((a.IsDependent > b.IsDependent) ? 1 : -1) });
                }
                else {
                    $ctrl.Tags = allTags.filter(function (item) { return (!item.IsDependent) });
                };
                $ctrl.structureEntity = data[i++];
                $ctrl.okText = $ctrl.translator.translate("OK", "OK");
                $ctrl.cancelText = $ctrl.translator.translate("Cancel", "Cancel");
                initializeTreeView();
                $ctrl.loaded = true;
            });
        }

        function expand(item) {
            if (item == "BU") {
                if (!$ctrl.showBUTree)
                    $ctrl.showBUTree = true;
                else
                    $ctrl.showBUTree = false;

            }
            else if (item == "GU") {
                if (!$ctrl.showGUTree) {
                    $ctrl.showGUTree = true;
                }
                else {
                    $ctrl.showGUTree = false;
                }
            }
            else {
                if (item == "Tag" && !$ctrl.showTagTree) {
                    $ctrl.showTagTree = true;
                }
                else {
                    $ctrl.showTagTree = false;
                }
            }
        }

        // filter visible nodes to only those containing the search string
        // plus the parent nodes of any matched nodes
        function filter(search, dataSource) {
            // true if any nodes at this level are visible
            var hasVisibleData = false;

            if (dataSource instanceof kendo.data.HierarchicalDataSource) {
                _.each(dataSource.data(), function (dataItem) {
                    // dataItem is visible if any of its children are visible or it matches the search string
                    var isVisible = filter(search, dataItem.children)
                        || search === ''
                        || dataItem[$ctrl.textField].toLowerCase().indexOf(search) >= 0;

                    // Update hide dataItem flag
                    dataItem.$hidden = !isVisible;
                    hasVisibleData = hasVisibleData || isVisible;
                })
                // Apply filter using special $hidden field
                dataSource.filter({ field: '$hidden', operator: 'neq', value: true });
            }

            return hasVisibleData;
        }

        function checkTreeData(nodes, selectedNodes) {
            _.each(selectedNodes, function (node) {
                traverse(nodes, function (dataItem, parents) {
                    if (dataItem[$ctrl.keyField] === node) {
                        dataItem.set("checked", true);
                    }
                });
            });
        }

        function initializeTreeView() {
            // Set default data columns for key, label and child collection
            $ctrl.keyField = 'RecordID';
            $ctrl.textField = 'Name';

            $ctrl.selectedBUs = $ctrl.structureEntity != null ? $ctrl.structureEntity.BusinessUnits : [];
            $ctrl.selectedGUs = $ctrl.structureEntity != null ? $ctrl.structureEntity.GeographicUnits : [];
            $ctrl.selectedTags = $ctrl.structureEntity != null ? $ctrl.structureEntity.Tags : [];
            // Convert model to a Kendo HierarchicalDataSource
            var buDataSource = new kendo.data.HierarchicalDataSource({
                data: $ctrl.BusinessUnits,
                schema: {
                    model: {
                        id: $ctrl.keyField,
                        children: 'BusinessUnits'
                    }
                }
            });

            $ctrl.buTreeOptions = {
                autoScroll: true,
                dataTextField: $ctrl.textField,
                loadOnDemand: false,
                dataSource: buDataSource,
                checkboxes: {
                    template: '<input type="checkbox" # if(item.checked) { # checked="checked" # } # } />'
                },
                template: '<span class="k-in" ng-bind-html="$ctrl.itemHtml(dataItem)"></span>',
                select: function (e) {
                    e.preventDefault();
                },
                dataBound: function (event) {
                    checkTreeData(this.dataSource.data(), $ctrl.selectedBUs);
                    var root = event.node ? angular.element(event.node) : this.element;
                    this.expand(root.find(".k-item input[type=checkbox]:checked").parents());
                }
            };

            //GU treeview
            var guDataSource = new kendo.data.HierarchicalDataSource({
                data: $ctrl.GeographicUnits,
                schema: {
                    model: {
                        id: $ctrl.keyField,
                        children: 'GeographicUnits'
                    }
                }
            });

            $ctrl.guTreeOptions = {
                autoScroll: true,
                dataTextField: $ctrl.textField,
                loadOnDemand: false,
                dataSource: guDataSource,
                checkboxes: {
                    template: '<input type="checkbox" # if(item.checked) { # checked="checked" # } # } />'
                },
                template: '<span class="k-in" ng-bind-html="$ctrl.itemHtml(dataItem)"></span>',
                select: function (e) {
                    e.preventDefault();
                },
                dataBound: function (event) {
                    checkTreeData(this.dataSource.data(), $ctrl.selectedGUs);
                    var root = event.node ? angular.element(event.node) : this.element;
                    this.expand(root.find(".k-item input[type=checkbox]:checked").parents());
                }
            };
            //Tag treeview
            var tagDataSource = new kendo.data.HierarchicalDataSource({
                data: $ctrl.Tags,
                schema: {
                    model: {
                        id: $ctrl.keyField,
                        children: 'Tags'
                    }
                }
            });

            $ctrl.tagTreeOptions = {
                autoScroll: true,
                dataTextField: $ctrl.textField,
                loadOnDemand: false,
                dataSource: tagDataSource,
                checkboxes: {
                    template: '<input type="checkbox" # if(item.checked) { # checked="checked" # } # } />'
                },
                template: '<span class="k-in" ng-bind-html="$ctrl.itemHtml(dataItem)"></span>',
                select: function (e) {
                    e.preventDefault();
                },
                dataBound: function (event) {
                    checkTreeData(this.dataSource.data(), $ctrl.selectedTags);
                    var root = event.node ? angular.element(event.node) : this.element;
                    this.expand(root.find(".k-item input[type=checkbox]:checked").parents());
                }
            };
        }

        // Custom template handling - workaround kendo vs angular template limitations
        function itemHtml(dataItem) {
            if (dataItem.Tenant_RecordID !== aonEbApp.context.Tenant.RecordID) {
                return dataItem[$ctrl.textField] + ' <i class="fa fa-lock"></i>';
            }
            else {
                return dataItem[$ctrl.textField];
            }
        }

        function buCheck(e) {
            var selection = e.sender.dataItem(e.node);
            if (selection.checked === true) {
                $ctrl.selectedBUs.push(selection[$ctrl.keyField]);
            }
            else {
                var trimmed = _.without($ctrl.selectedBUs, selection[$ctrl.keyField]);
                $ctrl.selectedBUs = trimmed;
            }
        }

        // Utility function for walking the tree and performing a custom operation on each node
        function traverse(nodes, callback, parents) {
            parents = parents || [];
            _.each(nodes, function (dataItem) {
                callback(dataItem, parents);
                var children = dataItem.hasChildren && dataItem.children.data();
                if (children) {
                    parents.push(dataItem);
                    traverse(children, callback, parents);
                    parents.pop();
                }
            });
        };

        function guCheck(e) {
            var selection = e.sender.dataItem(e.node);
            if (selection.checked == true) {
                $ctrl.selectedGUs.push(selection[$ctrl.keyField])
            }
            else {
                var trimmed = _.without($ctrl.selectedGUs, selection[$ctrl.keyField]);
                $ctrl.selectedGUs = trimmed;
            }
        }

        function tagCheck(e) {
            var selection = e.sender.dataItem(e.node);
            if (selection.checked == true) {
                $ctrl.selectedTags.push(selection[$ctrl.keyField])
            }
            else {
                var trimmed = _.without($ctrl.selectedTags, selection[$ctrl.keyField]);
                $ctrl.selectedTags = trimmed;
            }
        }

        function ok() {
            var intersects = { RecordID: $ctrl.entityId, BusinessUnits: $ctrl.selectedBUs, GeographicUnits: $ctrl.selectedGUs, Tags: $ctrl.selectedTags };
            structureManager.saveStructureEntityIntersects($ctrl.entityId, intersects).then(function (data) {
                toastr.success($ctrl.translator.translate("SaveSuccess", "Save Success"));
                $ctrl.modalInstance.close();
            }, function (error) {
                toastr.error($ctrl.translator.translate("SaveFailed", "Save Failed"));
            });
        }

        function UncheckAllNodes(nodes, tree) {
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].set("checked", false);
                if (nodes[i].hasChildren) {
                    UncheckAllNodes(nodes[i].children.view());
                }
            }
            if (tree == "BU") {
                $ctrl.selectedBUs = [];
            }
            if (tree == "GU") {
                $ctrl.selectedGUs = [];
            }
            if (tree == "Tag") {
                $ctrl.selectedTags = [];
            }
        }

        function cancel() {
            $ctrl.modalInstance.close(false);
        }
    }
})();