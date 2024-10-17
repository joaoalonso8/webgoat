(function () {
    'use strict';

    angular
        .module('app')
        .service('navigationService', navigationService);

    navigationService.$inject = ['$rootScope', 'aonEbRouter', '$state', 'aonEbApp', 'pageContextService'];

    function navigationService($rootScope, aonEbRouter, $state, aonEbApp, pageContextService) {

        aonEbRouter.onSuccess({}, function (transition) {
            updatePageContext();
        });

        $rootScope.$watchCollection(function () { return _options.mainNavigation; }, function () {
            updatePageContext();
        });

        var _options = {
            mainNavigation: [],
            mainNavVisible: false,
            mainNavigationTitle: undefined,
        }

        var service = {
            options: _options,
            mainNavigation: _options.mainNavigation,
            mainNavVisible: _options.mainNavVisible,

            setMainNavigation: setMainNavigation,
            toggleNavView: toggleNavView,
            isMenuItemEnabled: isMenuItemEnabled,
            goToStep: goToStep,
            hasPreviousPage: hasPreviousPage,
            previousPage: previousPage,
            hasNextPage: hasNextPage,
            nextPage: nextPage,
            isLastStep: isLastStep
        };

        return service;

        function setMainNavigation(navItems, title) {
            _options.mainNavigation = navItems;
            _options.mainNavigationTitle = title || undefined;
            updatePageContext();
        };

        function toggleNavView() {
            _options.mainNavVisible = !_options.mainNavVisible;
        };

        function updatePageContext() {
            var contexts = [];

            updateNavigation(_options.mainNavigation, contexts);

            pageContextService.setContextList(contexts.reverse());
        }

        function updateNavigation(navigationItems, contexts) {

            // First deactivate current active items
            for (var i = 0; i < navigationItems.length; i++) {
                navigationItems[i].IsGroupOpen = false;
            }

            var levelActive = false,
                innerContexts = [];

            for (var i = 0; i < navigationItems.length; i++) {
                var navItem = navigationItems[i];

                navItem.IsActive = isNavItemActive(navItem);
                navItem.ChildrenActive = false;
                levelActive = levelActive || (navItem.IsActive == true);

                if ((navItem.children || []).length > 0) {
                    navItem.IsParent = true;

                    if (updateNavigation(navItem.children, contexts) || navItem.IsActive) {
                        navItem.IsGroupOpen = true;
                        navItem.ChildrenActive = true;
                        levelActive = true;
                    }
                }

                if (navItem.IsActive || navItem.ChildrenActive) {
                    pushPageContext(innerContexts, navItem.label);
                }
            }

            if (innerContexts.length > 0) {
                _.each(innerContexts.reverse(), function (c) {
                    pushPageContext(contexts, c.title);
                })
            }

            return levelActive;
        }

        function isNavItemActive(navItem) {
            var stateIncludes = $state.includes(navItem.state, navItem.stateParams);
            stateIncludes = (typeof stateIncludes === "undefined") ? false : stateIncludes;

            return navItem.state != null // a state is specified
                && stateIncludes; // the current state includes the named state
        }

        /*========================================================================================
            TODO: add pageContext to mainNavigation object for usage like CP
        ==========================================================================================*/
        function pushPageContext(contexts, pageContext) {
            if (pageContext != null) {
                contexts.push({ 'title': pageContext });
            }
        }

        /**
         * Returns true if the supplied step is currently enabled.
         * @param {} step 
         * @returns {} true if the supplied step is currently enabled
         */
        function isMenuItemEnabled(item) {
            var enabled = false;
            try {
                enabled = !item.hidden && (item.enableOn == null || item.enableOn(item));
            } catch (e) {
                console.log(e);
            }
            return enabled;
        }

        /**
         * Flattens out or menuGroups, and adds in the recordid's of the repeating children
         * to make it easier to work out which step is next/previous.
         * @returns {} 
         */
        function getSteps() {
            var tmpSteps = [];
            _.forEach(_options.mainNavigation, function (group) {
                tmpSteps.push(group);
                _.forEach(group.children, function (child) {
                    tmpSteps.push(child);
                    if ((child.children || []).length > 0) {
                        _.forEach(child.children, function (subchild) {
                            tmpSteps.push(subchild);
                        });
                    }
                });
            });
            return tmpSteps;
        }

        /**
        * Returns true if the current step is the last.
        * This is a bit of a bodge at the moment as things have been hardcoded in the menu structure..
        *
        **/
        function isLastStep() {
            var tmpSteps = getSteps();
            if (tmpSteps.length > 0) {
                var lastStep = tmpSteps[tmpSteps.length - 1];
                var stateIncludes = $state.includes(lastStep.state, lastStep.stateParams);
                return (typeof stateIncludes === "undefined") ? false : stateIncludes;
            }
            return false;
        }

        /**
         * Sets the state to the state of the given step,
         * provided that step has a state. Repeated children are expected to have already populated
         * step.recordID with their recordID so we can pass it along to the page.
         * @param {} step 
         * @returns {} 
         */
        function goToStep(step) {
            if (step.state && isMenuItemEnabled(step)) {
                if (step.stateParams) {
                    if (step.newWindow) {
                        var url = $state.href(step.state, step.stateParams);
                        var win = aonEbApp.openWindow(url);
                    } else {
                        $state.go(step.state, step.stateParams);
                    }
                    _options.mainNavVisible = false;
                } else {
                    if (step.newWindow) {
                        var url = $state.href(step.state);
                        var win = aonEbApp.openWindow(url);
                    } else {
                        $state.go(step.state);
                    }
                    _options.mainNavVisible = false;
                }
            }
        }

        /**
         * Returns true if a previous step exists.
         * Steps with no state will be skipped.
         * @returns {} 
         */
        function hasPreviousPage() {
            var previousStep = findPreviousStep();
            return (previousStep) ? true : false;
        }

        /**
         * Find the previous step in our step structure and navigate to it.
         * Steps with no state will be skipped.
         * @returns {} 
         */
        function previousPage() {
            var previousStep = findPreviousStep();
            if (previousStep) {
                goToStep(previousStep);
            }
        }

        /**
         * Returns true if a next step exists.
         * Steps with no state will be skipped.
         * @returns {} 
         */
        function hasNextPage() {
            var nextStep = findNextStep();
            return (nextStep) ? true : false;
        }

        /**
         * Find the next step in our step structure and navigate to it.
         * @returns {} 
         */
        function nextPage() {
            var nextStep = findNextStep();
            if (nextStep) {
                goToStep(nextStep);
            }
        }

        function findPreviousStep() {
            var tmpSteps = getSteps();
            var currentStep = null;
            var previousStep = null;
            for (var i = tmpSteps.length - 1; i >= 0; i--) {
                if (currentStep) {

                    if (tmpSteps[i].state && isMenuItemEnabled(tmpSteps[i])) {
                        previousStep = tmpSteps[i];
                        break;
                    }
                } else {
                    var stateIncludes = $state.includes(tmpSteps[i].state, tmpSteps[i].stateParams);
                    stateIncludes = (typeof stateIncludes === "undefined") ? false : stateIncludes;
                    if (tmpSteps[i].state != null && stateIncludes) {
                        currentStep = tmpSteps[i];
                    }
                }
            }
            return previousStep;
        }

        function findNextStep() {
            var tmpSteps = getSteps();
            var currentStep = null;
            var nextStep = null;
            for (var i = 0; i < tmpSteps.length; i++) {
                if (currentStep) {

                    if (tmpSteps[i].state && isMenuItemEnabled(tmpSteps[i])) {
                        nextStep = tmpSteps[i];
                        break;
                    }
                } else {
                    var stateIncludes = $state.includes(tmpSteps[i].state, tmpSteps[i].stateParams);
                    stateIncludes = (typeof stateIncludes === "undefined") ? false : stateIncludes;
                    if (tmpSteps[i].state != null && stateIncludes) {
                        currentStep = tmpSteps[i];
                    }
                }
            }
            return nextStep;
        }
    }

})();