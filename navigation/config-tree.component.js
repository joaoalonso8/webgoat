(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .component('aonEbConfigTree', {
            templateUrl: '/static/app/common/navigation/config-tree.component.html',
            bindings: {
                options: '<',
                keyField: '<',
                textField: '<',
                childField: '<',
                onSelect: '<',
                showAll: '<',
                customizedCss: '<',
                collapsed: '<'
            },
            controller: controller
        });

    controller.$inject = ['$q', '$state', 'aonEbRouter', 'translationService', '$timeout']

    function controller($q, $state, aonEbRouter, translationService, $timeout) {
        var $ctrl = this;
        $ctrl.onDataBound = onDataBound;
        $ctrl.filter = filter;
        $ctrl.collapse = collapse;
        $ctrl.expand = expand;
        $ctrl.itemHtml = itemHtml;
        $ctrl.clearSearch = clearSearch;
        $ctrl.loading = false;
        var onSuccessHandle;
        var onErrorHandle;

        $ctrl.$onInit = function () {
            $q.all([
                translationService.getTranslator('Global')])
                .then(function (data) {
                    var i = 0;
                    $ctrl.translator = data[i++];
                    $ctrl.collapseTooltip = $ctrl.translator.translate("Collapse All", "Collapse All");
                    $ctrl.expandTooltip = $ctrl.translator.translate("Expand All", "Expand All");
                    $ctrl.showTooltip = $ctrl.translator.translate("Show All", "Show All");
                });
            onSuccessHandle = aonEbRouter.onSuccess({}, function (transition) {
                if (!$ctrl.selection || !stateMatch($ctrl.selection, transition.to().name, transition.params())) {
                    checkTreeSelectionSync(transition.to().name, transition.params());
                }
            });
            onErrorHandle = aonEbRouter.onError({}, function (transition) {
                if (!$ctrl.selection || !stateMatch($ctrl.selection, transition.from().name, transition.params('from'))) {
                    checkTreeSelectionSync(transition.from().name, transition.params('from'));
                }
            });
        }

        $ctrl.$onDestroy = function () {
            onSuccessHandle();
            onErrorHandle();
        }

        function checkTreeSelectionSync(toState, toParams) {
            var tree = $ctrl.tree;
            var dataItem = findDataItemForCurrentState(tree.dataSource.data()[0], toState, toParams);
            selectNodeFor(tree, dataItem);
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
                    if ($ctrl.filterText && $ctrl.filterText.length > 0) {
                        filter($ctrl.filterText.toLowerCase(), $ctrl.tree.dataSource);
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
                autoScroll: false,
                dataTextField: $ctrl.textField,
                template: '<span class="k-in" ng-bind-html="$ctrl.itemHtml(dataItem)" ng-click="$ctrl.click(dataItem)"></span>',
                loadOnDemand: false,
                dataSource: hierarchicalDataSource(),
            };
        }

        $ctrl.click = function (dataItem) {
            $ctrl.selection = dataItem;
            if ($ctrl.onSelect) {
                $ctrl.onSelect({
                    selection: function () {
                        return dataItem;
                    }
                });
            }
        }

        function itemHtml(dataItem) {
            var html = '';
            if (dataItem.isExpired) {
                html = '<i class="aon-eb-icon-unexpire"></i> ';
            }
            else if (dataItem.isFuture) {
                html += '<i class="aon-eb-icon-expire"></i> ';
            }
            if (dataItem.isBU) {
                html += '<i class="aon-eb-icon-briefcase"></i> ';
            }
            if (dataItem.isGU) {
                html += '<i class="aon-eb-icon-globe"></i> ';
            }

            if (dataItem.icon) {
                html = '<i class="' + dataItem.icon + '"></i> ';
            }
            else {
                html = '<i class="aon-eb-icon-table"></i> ';
                if ((dataItem.state && (findDetailsIndex(dataItem.state, '-details') || findDetailsIndex(dataItem.state, '.details'))) || dataItem.isEntity) {
                    html = '<i class="aon-eb-icon-wpforms"></i> ';
                }
            }
            return html + dataItem[$ctrl.textField];
        }

        function findDetailsIndex(state, word) {
            return state && state.lastIndexOf(word) === (state.length - 8);
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
            var data = tree.dataSource.data();
            if (data.length > 0) {
                var dataItem = findDataItemForCurrentState(data[0], $ctrl.selection ? $ctrl.selection.state : $state.current.name, $state.params);
                selectNodeFor(tree, dataItem);
                setTimeout(function () {
                    if ($ctrl.collapsed) {
                        tree.collapse(".k-item");
                    }
                    else {
                        tree.expand(".k-item");
                    }
                    if (!$ctrl.selection) {
                        tree.select(".k-item");
                    }
                    var treeItems = tree.items();
                    for (var i = 0; i < treeItems.length; i++) {
                        treeItems[i].title = treeItems[i].textContent;
                    }
                });
            }
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

        function findDataItemForCurrentState(dataSource, state, stateParams) {

            if (stateMatch(dataSource, state, stateParams)) {
                return dataSource;
            }
            if (dataSource.hasChildren) {

                for (var i = 0; i < dataSource.children.data().length; i++) {
                    var match = findDataItemForCurrentState(dataSource.children.data()[i], state, stateParams);
                    if (match) {
                        return match;
                    }
                }
            }
        }

        function stateMatch(node, state, stateParams) {
            if (state === node.state) {
                var total = 0;
                var index = 0;
                for (var property in node.stateParams) {
                    if (stateParams.hasOwnProperty(property) && property !== 'uid') {
                        total = total + 1;
                        if (node.stateParams[property] === stateParams[property]) {
                            index = index + 1;
                        }
                    }
                }
                return total !== 0 && index !== 0 && total === index;
            }
            return false;
        }

        
        function filter(search, dataSource) {
            $ctrl.textFiltered = false;

            if ($ctrl.filterText.length > 0) {
                $ctrl.textFiltered = true;
                $ctrl.collapsed = false;
            }

            $ctrl.loading = true;
            $timeout(function () {
                //RegExp is more effecient than string.indexOf
                var regSearch = RegExp(search, "gi"); //Global and Case insensitive

                // true if any nodes at this level are visible
                var isEmptySearch = (search === '');
                filterWithRegExp(regSearch, dataSource, isEmptySearch);

                // Apply filter using special $hidden field
                dataSource.filter({ field: '$hidden', operator: 'neq', value: true });

                $ctrl.loading = false;
            });
        }

        function filterWithRegExp(regExp, dataSource, isEmptySearch) {
            var hasVisibleData = false;

            if (dataSource instanceof kendo.data.HierarchicalDataSource) {
                _.each(dataSource.data(), function (dataItem) {
                    // dataItem is visible if any of its children are visible or it matches the search string
                    var isVisible = filterWithRegExp(regExp, dataItem.children, isEmptySearch)
                        || isEmptySearch
                        || regExp.test(dataItem[$ctrl.textField]);

                    // Update hide dataItem flag
                    dataItem.$hidden = !isVisible;
                    hasVisibleData = hasVisibleData || isVisible;
                })
            }

            return hasVisibleData;
        }

        function collapse() {
            $ctrl.tree.collapse(".k-item");
            $ctrl.collapsed = true;
        }

        function expand() {
            $ctrl.tree.expand(".k-item");
            $ctrl.collapsed = false;
        }

        function clearSearch() {
            $ctrl.filterText = '';
            $ctrl.textFiltered = false;
            filter($ctrl.filterText.toLowerCase(), $ctrl.tree.dataSource);
        }
    }

})();