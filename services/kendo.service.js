(function () {
    'use strict';

    angular
        .module('aon.eb.common')
        .service('aonEbKendo', ['translationService', 'dateUtils', constructor]);

    function constructor(translationService, dateUtils) {

        var service = {
            init: init,
            setLocale: setLocale,
            filterColumn: filterColumn
        };

        return service;

        function init(culture) {
            console.log("Initializing Kendo");
            return translationService.getTranslator('KendoUI').then(function (translator) {
                // localize kendo messages
                localizeMessages(window.kendo.jQuery, translator);
                // custom binding for Kendo date picker
                setupCustomBindings();
                // dynamically update Kendo culture
                setLocale(culture);
                console.log("Kendo successfully initialized");
                return;
            })
            .catch(function (error) {
                console.log("Error Initializing Kendo");
                throw error;
            });
        }

        function setLocale(culture) {
            kendo.cultures[culture.Name] = {
                name: culture.Name,
                numberFormat: {
                    pattern: [culture.NumberFormat.NumberNegativePattern],
                    decimals: culture.NumberFormat.NumberDecimalDigits,
                    ",": culture.NumberFormat.NumberGroupSeparator,
                    ".": culture.NumberFormat.NumberDecimalSeparator,
                    groupSize: culture.NumberFormat.NumberGroupSizes,
                    percent: {
                        pattern: [culture.NumberFormat.PercentNegativePattern, culture.NumberFormat.PercentPositivePattern],
                        decimals: culture.NumberFormat.PercentDecimalDigits,
                        ",": culture.NumberFormat.PercentGroupSeparator,
                        ".": culture.NumberFormat.PercentDecimalSeparator,
                        groupSize: culture.NumberFormat.PercentGroupSizes,
                        symbol: culture.NumberFormat.PercentSymbol
                    },
                    currency: {
                        name: culture.NumberFormat.CurrencyName,
                        abbr: culture.NumberFormat.ISOCurrencySymbol,
                        pattern: [culture.NumberFormat.CurrencyNegativePattern, culture.NumberFormat.CurrencyPositivePattern],
                        decimals: culture.NumberFormat.CurrencyDecimalDigits,
                        ",": culture.NumberFormat.CurrencyGroupSeparator,
                        ".": culture.NumberFormat.CurrencyDecimalSeparator,
                        groupSize: culture.NumberFormat.CurrencyGroupSizes,
                        symbol: culture.NumberFormat.CurrencySymbol
                    }
                },
                calendars: {
                    standard: {
                        days: {
                            names: culture.DateTimeFormat.DayNames,
                            namesAbbr: culture.DateTimeFormat.AbbreviatedDayNames,
                            namesShort: culture.DateTimeFormat.ShortestDayNames
                        },
                        months: {
                            names: culture.DateTimeFormat.MonthNames,
                            namesAbbr: culture.DateTimeFormat.AbbreviatedMonthNames
                        },
                        AM: [culture.DateTimeFormat.AMDesignator, culture.DateTimeFormat.AMDesignator.toLowerCase(), culture.DateTimeFormat.AMDesignator],
                        PM: [culture.DateTimeFormat.PMDesignator, culture.DateTimeFormat.PMDesignator.toLowerCase(), culture.DateTimeFormat.PMDesignator],
                        patterns: {
                            d: culture.DateTimeFormat.ShortDatePattern,
                            D: culture.DateTimeFormat.LongDatePattern,
                            F: culture.DateTimeFormat.FullDateTimePattern,
                            g: culture.DateTimeFormat.ShortDatePattern + " " + culture.DateTimeFormat.ShortTimePattern,
                            G: culture.DateTimeFormat.ShortDatePattern + " " + culture.DateTimeFormat.LongTimePattern,
                            m: culture.DateTimeFormat.MonthDayPattern,
                            M: culture.DateTimeFormat.MonthDayPattern,
                            s: culture.DateTimeFormat.SortableDateTimePattern,
                            t: culture.DateTimeFormat.ShortTimePattern,
                            T: culture.DateTimeFormat.LongTimePattern,
                            u: culture.DateTimeFormat.UniversalSortableDateTimePattern,
                            y: culture.DateTimeFormat.YearMonthPattern,
                            Y: culture.DateTimeFormat.YearMonthPattern,
                        },
                        "/": culture.DateTimeFormat.DateSeparator,
                        ":": culture.DateTimeFormat.TimeSeparator,
                        firstDay: culture.DateTimeFormat.FirstDayOfWeek
                    }
                }
            };

            kendo.culture(culture.Name); /* change kendo culture */
        }

        /* Custom filter handling to manage translation to ISO UTC date/time format */
        function filterColumn(e) {
            if (e.filter && e.filter.filters !== null && e.filter.filters.length > 0) {
                var column = e.sender.columns.find(function (col) {
                    return col.field === e.field;
                });
                //
                // e.sender.columns[6].field === e.field
                // e.sender.columns[6].filterable.ui === 'datepicker'
                // e.sender.dataSource.options.schema.model.fields[e.field].type === 'string'
                // 
                if (column.attributes && column.attributes.jsonType === 'date' && column.filterable && column.filterable.ui === 'datepicker') {
                    // For date types we just need to ensure the filter value is in yyyy-MM-dd format
                    _.each(e.filter.filters, function (filter) {
                        var value = filter.value;
                        if (dateUtils.isDate(value)) {
                            filter.value = dateUtils.toIsoDate(value);
                        }
                        else if (!dateUtils.isIsoDate(value)) {
                            filter.value = dateUtils.toIsoDate(new Date(value));
                        }
                    });
                }
                else if (column.attributes && column.attributes.jsonType === 'datetime' && column.filterable && column.filterable.ui === 'datepicker') {
                    // For datetime types we need use editable filter value in yyyy-MM-dd format,
                    // but this will fail to match the actual column values which have time to
                    // milliseconds for UTC not local time. To solve this we add child filters
                    // with the UTC adjusted time offsets for the local date.
                    _.each(e.filter.filters, function (filter) {
                        var baseDate = filter.value;
                        if (!dateUtils.isDate(baseDate)) {
                            if (dateUtils.isIsoDate(baseDate)) {
                                baseDate = dateUtils.parseIsoDate(baseDate);
                            }
                            else {
                                baseDate = new Date(baseDate);
                            }
                        }
                        filter.value = dateUtils.toIsoDate(baseDate);
                        baseDate.setHours(23, 59, 59, 999);
                        var endOfDay = dateUtils.toIsoDatetime(new Date(baseDate.getTime()));
                        baseDate.setHours(0, 0, 0, 0);
                        var startOfDay = dateUtils.toIsoDatetime(new Date(baseDate.getTime()));
                        switch (filter.operator) {
                            case 'eq':
                                filter.filters = [
                                    { field: filter.field, operator: 'gte', value: startOfDay },
                                    { field: filter.field, operator: 'lte', value: endOfDay }
                                ];
                                filter.logic = 'and';
                                break;
                            case 'neq':
                                filter.filters = [
                                    { field: filter.field, operator: 'lt', value: startOfDay },
                                    { field: filter.field, operator: 'gt', value: endOfDay }
                                ];
                                filter.logic = 'or';
                                break;
                            case 'gte':
                            case 'lt':
                                filter.filters = [
                                    { field: filter.field, operator: filter.operator, value: startOfDay }
                                ];
                                filter.logic = 'or';
                                break;
                            case 'gt':
                            case 'lte':
                                filter.filters = [
                                    { field: filter.field, operator: filter.operator, value: endOfDay }
                                ];
                                filter.logic = 'or';
                                break;
                            case 'isnull':
                            case 'isnotnull':
                                filter.value = null;
                                break;
                        }
                    });
                }
            }
        }

        function localizeMessages(e, translator) {
            kendo.ui.FlatColorPicker && (kendo.ui.FlatColorPicker.prototype.options.messages = e.extend(!0, kendo.ui.FlatColorPicker.prototype.options.messages,
            {
                apply: "Apply",
                cancel: "Cancel"
            })),
            kendo.ui.ColorPicker && (kendo.ui.ColorPicker.prototype.options.messages = e.extend(!0, kendo.ui.ColorPicker.prototype.options.messages,
            {
                apply: "Apply",
                cancel: "Cancel"
            })),
            kendo.ui.ColumnMenu && (kendo.ui.ColumnMenu.prototype.options.messages = e.extend(!0, kendo.ui.ColumnMenu.prototype.options.messages,
            {
                sortAscending: translator.translate("k-column-sortAscending", "Sort Ascending"),
                sortDescending: translator.translate("k-column-sortDescending", "Sort Descending"),
                filter: translator.translate("k-column-filter", "Filter"),
                columns: translator.translate("k-column-columns", "Columns"),
                done: translator.translate("k-column-done", "Done"),
                settings: translator.translate("k-column-settings", "Column Settings"),
                lock: translator.translate("k-column-lock", "Lock"),
                unlock: translator.translate("k-column-unlock", "Unlock")
            })),
            kendo.ui.Editor && (kendo.ui.Editor.prototype.options.messages = e.extend(!0, kendo.ui.Editor.prototype.options.messages,
            {
                bold: "Bold",
                italic: "Italic",
                underline: "Underline",
                strikethrough: "Strikethrough",
                superscript: "Superscript",
                subscript: "Subscript",
                justifyCenter: "Center text",
                justifyLeft: "Align text left",
                justifyRight: "Align text right",
                justifyFull: "Justify",
                insertUnorderedList: "Insert unordered list",
                insertOrderedList: "Insert ordered list",
                indent: "Indent",
                outdent: "Outdent",
                createLink: "Insert hyperlink",
                unlink: "Remove hyperlink",
                insertImage: "Insert image",
                insertFile: "Insert file",
                insertHtml: "Insert HTML",
                viewHtml: "View HTML",
                fontName: "Select font family",
                fontNameInherit: "(inherited font)",
                fontSize: "Select font size",
                fontSizeInherit: "(inherited size)",
                formatBlock: "Format",
                formatting: "Format",
                foreColor: "Color",
                backColor: "Background color",
                style: "Styles",
                emptyFolder: "Empty Folder",
                uploadFile: "Upload",
                orderBy: "Arrange by:",
                orderBySize: "Size",
                orderByName: "Name",
                invalidFileType: 'The selected file "{0}" is not valid. Supported file types are {1}.',
                deleteFile: 'Are you sure you want to delete "{0}"?',
                overwriteFile: 'A file with name "{0}" already exists in the current directory. Do you want to overwrite it?',
                directoryNotFound: "A directory with this name was not found.",
                imageWebAddress: "Web address",
                imageAltText: "Alternate text",
                imageWidth: "Width (px)",
                imageHeight: "Height (px)",
                fileWebAddress: "Web address",
                fileTitle: "Title",
                linkWebAddress: "Web address",
                linkText: "Text",
                linkToolTip: "ToolTip",
                linkOpenInNewWindow: "Open link in new window",
                dialogUpdate: "Update",
                dialogInsert: "Insert",
                dialogButtonSeparator: "or",
                dialogCancel: "Cancel",
                createTable: "Create table",
                addColumnLeft: "Add column on the left",
                addColumnRight: "Add column on the right",
                addRowAbove: "Add row above",
                addRowBelow: "Add row below",
                deleteRow: "Delete row",
                deleteColumn: "Delete column",
                dialogOk: "Ok",
                tableWizard: "Table Wizard",
                tableTab: "Table",
                cellTab: "Cell",
                accessibilityTab: "Accessibility",
                caption: "Caption",
                summary: "Summary",
                width: "Width",
                height: "Height",
                cellSpacing: "Cell Spacing",
                cellPadding: "Cell Padding",
                cellMargin: "Cell Margin",
                alignment: "Alignment",
                background: "Background",
                cssClass: "CSS Class",
                id: "ID",
                border: "Border",
                borderStyle: "Border Style",
                collapseBorders: "Collapse borders",
                wrapText: "Wrap text",
                associateCellsWithHeaders: "Associate cells with headers",
                alignLeft: "Align Left",
                alignCenter: "Align Center",
                alignRight: "Align Right",
                alignLeftTop: "Align Left Top",
                alignCenterTop: "Align Center Top",
                alignRightTop: "Align Right Top",
                alignLeftMiddle: "Align Left Middle",
                alignCenterMiddle: "Align Center Middle",
                alignRightMiddle: "Align Right Middle",
                alignLeftBottom: "Align Left Bottom",
                alignCenterBottom: "Align Center Bottom",
                alignRightBottom: "Align Right Bottom",
                alignRemove: "Remove Alignment",
                columns: "Columns",
                rows: "Rows",
                selectAllCells: "Select All Cells"
            })),
            kendo.ui.FileBrowser && (kendo.ui.FileBrowser.prototype.options.messages = e.extend(!0, kendo.ui.FileBrowser.prototype.options.messages,
            {
                uploadFile: "Upload",
                orderBy: "Arrange by",
                orderByName: "Name",
                orderBySize: "Size",
                directoryNotFound: "A directory with this name was not found.",
                emptyFolder: "Empty Folder",
                deleteFile: 'Are you sure you want to delete "{0}"?',
                invalidFileType: 'The selected file "{0}" is not valid. Supported file types are {1}.',
                overwriteFile: 'A file with name "{0}" already exists in the current directory. Do you want to overwrite it?',
                dropFilesHere: "drop file here to upload",
                search: "Search"
            })),
            kendo.ui.FilterCell && (kendo.ui.FilterCell.prototype.options.messages = e.extend(!0, kendo.ui.FilterCell.prototype.options.messages,
            {
                isTrue: translator.translate("k-filter-isTrue", "is true"),
                isFalse: translator.translate("k-filter-isFalse", "is false"),
                filter: translator.translate("k-filter-filter", "Filter"),
                clear: translator.translate("k-filter-clear", "Clear"),
                operator: translator.translate("k-filter-Operator", "Operator")
            })),
            kendo.ui.FilterCell && (kendo.ui.FilterCell.prototype.options.operators = e.extend(!0, kendo.ui.FilterCell.prototype.options.operators,
            {
                string: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    startswith: translator.translate("k-operator-startswith", "Starts with"),
                    contains: translator.translate("k-operator-contains", "Contains"),
                    doesnotcontain: translator.translate("k-operator-doesnotcontain", "Does not contain"),
                    endswith: translator.translate("k-operator-endswith", "Ends with"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null"),
                    isempty: translator.translate("k-operator-isempty", "Is empty"),
                    isnotempty: translator.translate("k-operator-isnotempty", "Is not empty")
                },
                number: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    gte: translator.translate("k-operator-num-gte", "Is greater than or equal to"),
                    gt: translator.translate("k-operator-num-gt", "Is greater than"),
                    lte: translator.translate("k-operator-num-lte", "Is less than or equal to"),
                    lt: translator.translate("k-operator-num-lt", "Is less than"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null")
                },
                date: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    gte: translator.translate("k-operator-date-gte", "Is after or equal to"),
                    gt: translator.translate("k-operator-date-gt", "Is after"),
                    lte: translator.translate("k-operator-date-lte", "Is before or equal to"),
                    lt: translator.translate("k-operator-date-lt", "Is before"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null")
                },
                enums: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null")
                }
            })),
            kendo.ui.FilterMenu && (kendo.ui.FilterMenu.prototype.options.messages = e.extend(!0, kendo.ui.FilterMenu.prototype.options.messages,
            {
                info: translator.translate("k-filter-info", "Show items with value that:"),
                isTrue: translator.translate("k-filter-isTrue", "is true"),
                isFalse: translator.translate("k-filter-isFalse", "is false"),
                filter: translator.translate("k-filter-filter", "Filter"),
                clear: translator.translate("k-filter-clear", "Clear"),
                and: translator.translate("k-filter-and", "And"),
                or: translator.translate("k-filter-or", "Or"),
                selectValue: translator.translate("k-filter-selectValue", "-Select value-"),
                operator: translator.translate("k-filter-operator", "Operator"),
                value: translator.translate("k-filter-value", "Value"),
                cancel: translator.translate("k-filter-cancel", "Cancel")
            })),
            kendo.ui.FilterMenu && (kendo.ui.FilterMenu.prototype.options.operators = e.extend(!0, kendo.ui.FilterMenu.prototype.options.operators,
            {
                string: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    startswith: translator.translate("k-operator-startswith", "Starts with"),
                    contains: translator.translate("k-operator-contains", "Contains"),
                    doesnotcontain: translator.translate("k-operator-doesnotcontain", "Does not contain"),
                    endswith: translator.translate("k-operator-endswith", "Ends with"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null"),
                    isempty: translator.translate("k-operator-isempty", "Is empty"),
                    isnotempty: translator.translate("k-operator-isnotempty", "Is not empty")
                },
                number: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    gte: translator.translate("k-operator-num-gte", "Is greater than or equal to"),
                    gt: translator.translate("k-operator-num-gt", "Is greater than"),
                    lte: translator.translate("k-operator-num-lte", "Is less than or equal to"),
                    lt: translator.translate("k-operator-num-lt", "Is less than"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null")
                },
                date: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    gte: translator.translate("k-operator-date-gte", "Is after or equal to"),
                    gt: translator.translate("k-operator-date-gt", "Is after"),
                    lte: translator.translate("k-operator-date-lte", "Is before or equal to"),
                    lt: translator.translate("k-operator-date-lt", "Is before"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null")
                },
                enums: {
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to"),
                    isnull: translator.translate("k-operator-isnull", "Is null"),
                    isnotnull: translator.translate("k-operator-isnotnull", "Is not null")
                }
            })),
            kendo.ui.FilterMultiCheck && (kendo.ui.FilterMultiCheck.prototype.options.messages = e.extend(!0, kendo.ui.FilterMultiCheck.prototype.options.messages,
            {
                checkAll: translator.translate("k-filter-checkAll", "Select All"),
                clear: translator.translate("k-filter-clear", "Clear"),
                filter: translator.translate("k-filter-filter", "Filter"),
                search: translator.translate("k-filter-search", "Search")
            })),
            kendo.ui.Gantt && (kendo.ui.Gantt.prototype.options.messages = e.extend(!0, kendo.ui.Gantt.prototype.options.messages,
            {
                actions: {
                    addChild: "Add Child",
                    append: "Add Task",
                    insertAfter: "Add Below",
                    insertBefore: "Add Above",
                    pdf: "Export to PDF"
                },
                cancel: "Cancel",
                deleteDependencyWindowTitle: "Delete dependency",
                deleteTaskWindowTitle: "Delete task",
                destroy: "Delete",
                editor: {
                    assingButton: "Assign",
                    editorTitle: "Task",
                    end: "End",
                    percentComplete: "Complete",
                    resources: "Resources",
                    resourcesEditorTitle: "Resources",
                    resourcesHeader: "Resources",
                    start: "Start",
                    title: "Title",
                    unitsHeader: "Units"
                },
                save: "Save",
                views: {
                    day: "Day",
                    end: "End",
                    month: "Month",
                    start: "Start",
                    week: "Week",
                    year: "Year"
                }
            })),
            kendo.ui.Grid && (kendo.ui.Grid.prototype.options.messages = e.extend(!0, kendo.ui.Grid.prototype.options.messages,
            {
                commands: {
                    cancel: translator.translate("k-grid-cancel", "Cancel changes"),
                    canceledit: translator.translate("k-grid-canceledit", "Cancel"),
                    create: translator.translate("k-grid-create", "Add new record"),
                    destroy: translator.translate("k-grid-destroy", "Delete"),
                    edit: translator.translate("k-grid-edit", "Edit"),
                    excel: translator.translate("k-grid-excel", "Export to Excel"),
                    pdf: translator.translate("k-grid-pdf", "Export to PDF"),
                    save: translator.translate("k-grid-save", "Save changes"),
                    select: translator.translate("k-grid-select", "Select"),
                    update: translator.translate("k-grid-update", "Update")
                },
                editable: {
                    cancelDelete: translator.translate("k-grid-cancelDelete", "Cancel"),
                    confirmation: translator.translate("k-grid-confirmation", "Are you sure you want to delete this record?"),
                    confirmDelete: translator.translate("k-grid-confirmDelete", "Delete")
                },
                noRecords: translator.translate("k-grid-noRecords", "No records available.")
            })),
            kendo.ui.TreeList && (kendo.ui.TreeList.prototype.options.messages = e.extend(!0, kendo.ui.TreeList.prototype.options.messages,
            {
                noRows: "No records to display",
                loading: "Loading...",
                requestFailed: "Request failed.",
                retry: "Retry",
                commands: {
                    edit: "Edit",
                    update: "Update",
                    canceledit: "Cancel",
                    create: "Add new record",
                    createchild: "Add child record",
                    destroy: "Delete",
                    excel: "Export to Excel",
                    pdf: "Export to PDF"
                }
            })),
            kendo.ui.Groupable && (kendo.ui.Groupable.prototype.options.messages = e.extend(!0, kendo.ui.Groupable.prototype.options.messages,
            {
                empty: translator.translate("k-groupable-empty", "Drag a column header and drop it here to group by that column")
            })),
            kendo.ui.NumericTextBox && (kendo.ui.NumericTextBox.prototype.options = e.extend(!0, kendo.ui.NumericTextBox.prototype.options,
            {
                upArrowText: translator.translate("k-numericTextBox-upArrowText", "Increase value"),
                downArrowText: translator.translate("k-numericTextBox-downArrowText", "Decrease value")
            })),
            kendo.ui.MediaPlayer && (kendo.ui.MediaPlayer.prototype.options.messages = e.extend(!0, kendo.ui.MediaPlayer.prototype.options.messages,
            {
                pause: "Pause",
                play: "Play",
                mute: "Mute",
                unmute: "Unmute",
                quality: "Quality",
                fullscreen: "Full Screen"
            })),
            kendo.ui.Pager && (kendo.ui.Pager.prototype.options.messages = e.extend(!0, kendo.ui.Pager.prototype.options.messages,
            {
                allPages: translator.translate("k-pager-allPages", "All"),
                display: translator.translate("k-pager-display", "{0} - {1} of {2} items"),
                empty: translator.translate("k-pager-empty", "No items to display"),
                page: translator.translate("k-pager-page", "Page"),
                of: translator.translate("k-pager-of", "of {0}"),
                itemsPerPage: translator.translate("k-pager-itemsPerPage", "items per page"),
                first: translator.translate("k-pager-first", "Go to the first page"),
                previous: translator.translate("k-pager-previous", "Go to the previous page"),
                next: translator.translate("k-pager-next", "Go to the next page"),
                last: translator.translate("k-pager-last", "Go to the last page"),
                refresh: translator.translate("k-pager-refresh", "Refresh"),
                morePages: translator.translate("k-pager-morePages", "More pages")
            })),
            kendo.ui.PivotGrid && (kendo.ui.PivotGrid.prototype.options.messages = e.extend(!0, kendo.ui.PivotGrid.prototype.options.messages,
            {
                measureFields: "Drop Data Fields Here",
                columnFields: "Drop Column Fields Here",
                rowFields: "Drop Rows Fields Here"
            })),
            kendo.ui.PivotFieldMenu && (kendo.ui.PivotFieldMenu.prototype.options.messages = e.extend(!0, kendo.ui.PivotFieldMenu.prototype.options.messages,
            {
                info: translator.translate("k-pivot-info", "Show items with value that:"),
                filterFields: translator.translate("k-pivot-filterFields", "Fields Filter"),
                filter: translator.translate("k-pivot-filter", "Filter"),
                include: translator.translate("k-pivot-include", "Include Fields..."),
                title: translator.translate("k-pivot-title", "Fields to include"),
                clear: translator.translate("k-pivot-clear", "Clear"),
                ok: translator.translate("k-pivot-ok", "Ok"),
                cancel: translator.translate("k-pivot-cancel", "Cancel"),
                operators: {
                    contains: translator.translate("k-operator-contains", "Contains"),
                    doesnotcontain: translator.translate("k-operator-doesnotcontain", "Does not contain"),
                    startswith: translator.translate("k-operator-startswith", "Starts with"),
                    endswith: translator.translate("k-operator-endswith", "Ends with"),
                    eq: translator.translate("k-operator-eq", "Is equal to"),
                    neq: translator.translate("k-operator-neq", "Is not equal to")
                }
            })),
            kendo.ui.RecurrenceEditor && (kendo.ui.RecurrenceEditor.prototype.options.messages = e.extend(!0, kendo.ui.RecurrenceEditor.prototype.options.messages,
            {
                frequencies: {
                    never: translator.translate("k-recurrence-never", "Never"),
                    hourly: translator.translate("k-recurrence-hourly", "Hourly"),
                    daily: translator.translate("k-recurrence-daily", "Daily"),
                    weekly: translator.translate("k-recurrence-weekly", "Weekly"),
                    monthly: translator.translate("k-recurrence-monthly", "Monthly"),
                    yearly: translator.translate("k-recurrence-yearly", "Yearly")
                },
                hourly: {
                    repeatEvery: translator.translate("k-recurrence-repeatEvery", "Repeat every: "),
                    interval: translator.translate("k-recurrence-hourly-interval", " hour(s)")
                },
                daily: {
                    repeatEvery: translator.translate("k-recurrence-repeatEvery", "Repeat every: "),
                    interval: translator.translate("k-recurrence-daily-interval", " day(s)")
                },
                weekly: {
                    interval: translator.translate("k-recurrence-weekly-interval", " week(s)"),
                    repeatEvery: translator.translate("k-recurrence-repeatEvery", "Repeat every: "),
                    repeatOn: translator.translate("k-recurrence-repeatOn", "Repeat on: ")
                },
                monthly: {
                    repeatEvery: translator.translate("k-recurrence-repeatEvery", "Repeat every: "),
                    repeatOn: translator.translate("k-recurrence-repeatOn", "Repeat on: "),
                    interval: translator.translate("k-recurrence-monthly-interval", " month(s)"),
                    day: translator.translate("k-recurrence-monthly-day", "Day ")
                },
                yearly: {
                    repeatEvery: translator.translate("k-recurrence-repeatEvery", "Repeat every: "),
                    repeatOn: translator.translate("k-recurrence-repeatOn", "Repeat on: "),
                    interval: translator.translate("k-recurrence-yearly-interval", " year(s)"),
                    of: translator.translate("k-recurrence-yearly-of", " of ")
                },
                end: {
                    label: translator.translate("k-recurrence-end", "End:"),
                    mobileLabel: translator.translate("k-recurrence-ends", "Ends"),
                    never: translator.translate("k-recurrence-never", "Never"),
                    after: translator.translate("k-recurrence-after", "After "),
                    occurrence: translator.translate("k-recurrence-occurrence", " occurrence(s)"),
                    on: translator.translate("k-recurrence-on", "On ")
                },
                offsetPositions: {
                    first: translator.translate("k-recurrence-first", "first"),
                    second: translator.translate("k-recurrence-second", "second"),
                    third: translator.translate("k-recurrence-third", "third"),
                    fourth: translator.translate("k-recurrence-fourth", "fourth"),
                    last: translator.translate("k-recurrence-last", "last")
                },
                weekdays: {
                    day: translator.translate("k-recurrence-day", "day"),
                    weekday: translator.translate("k-recurrence-weekday", "weekday"),
                    weekend: translator.translate("k-recurrence-weekend", "weekend day")
                }
            })),
            kendo.ui.Scheduler && (kendo.ui.Scheduler.prototype.options.messages = e.extend(!0, kendo.ui.Scheduler.prototype.options.messages,
            {
                allDay: "all day",
                date: "Date",
                event: "Event",
                time: "Time",
                showFullDay: "Show full day",
                showWorkDay: "Show business hours",
                today: "Today",
                save: "Save",
                cancel: "Cancel",
                destroy: "Delete",
                deleteWindowTitle: "Delete event",
                ariaSlotLabel: "Selected from {0:t} to {1:t}",
                ariaEventLabel: "{0} on {1:D} at {2:t}",
                editable: {
                    confirmation: "Are you sure you want to delete this event?"
                },
                views: {
                    day: "Day",
                    week: "Week",
                    workWeek: "Work Week",
                    agenda: "Agenda",
                    month: "Month"
                },
                recurrenceMessages: {
                    deleteWindowTitle: "Delete Recurring Item",
                    deleteWindowOccurrence: "Delete current occurrence",
                    deleteWindowSeries: "Delete the series",
                    editWindowTitle: "Edit Recurring Item",
                    editWindowOccurrence: "Edit current occurrence",
                    editWindowSeries: "Edit the series",
                    deleteRecurring: "Do you want to delete only this event occurrence or the whole series?",
                    editRecurring: "Do you want to edit only this event occurrence or the whole series?"
                },
                editor: {
                    title: "Title",
                    start: "Start",
                    end: "End",
                    allDayEvent: "All day event",
                    description: "Description",
                    repeat: "Repeat",
                    timezone: " ",
                    startTimezone: "Start timezone",
                    endTimezone: "End timezone",
                    separateTimezones: "Use separate start and end time zones",
                    timezoneEditorTitle: "Timezones",
                    timezoneEditorButton: "Time zone",
                    timezoneTitle: "Time zones",
                    noTimezone: "No timezone",
                    editorTitle: "Event"
                }
            })),
            kendo.spreadsheet && (kendo.spreadsheet.messages.borderPalette = e.extend(!0, kendo.spreadsheet.messages.borderPalette,
            {
                allBorders: "All borders",
                insideBorders: "Inside borders",
                insideHorizontalBorders: "Inside horizontal borders",
                insideVerticalBorders: "Inside vertical borders",
                outsideBorders: "Outside borders",
                leftBorder: "Left border",
                topBorder: "Top border",
                rightBorder: "Right border",
                bottomBorder: "Bottom border",
                noBorders: "No border",
                reset: "Reset color",
                customColor: "Custom color...",
                apply: "Apply",
                cancel: "Cancel"
            })),
            kendo.spreadsheet && (kendo.spreadsheet.messages.dialogs = e.extend(!0, kendo.spreadsheet.messages.dialogs,
            {
                apply: "Apply",
                save: "Save",
                cancel: "Cancel",
                remove: "Remove",
                retry: "Retry",
                revert: "Revert",
                okText: "OK",
                formatCellsDialog: {
                    title: "Format",
                    categories: {
                        number: "Number",
                        currency: "Currency",
                        date: "Date"
                    }
                },
                fontFamilyDialog: {
                    title: "Font"
                },
                fontSizeDialog: {
                    title: "Font size"
                },
                bordersDialog: {
                    title: "Borders"
                },
                alignmentDialog: {
                    title: "Alignment",
                    buttons: {
                        justtifyLeft: "Align left",
                        justifyCenter: "Center",
                        justifyRight: "Align right",
                        justifyFull: "Justify",
                        alignTop: "Align top",
                        alignMiddle: "Align middle",
                        alignBottom: "Align bottom"
                    }
                },
                mergeDialog: {
                    title: "Merge cells",
                    buttons: {
                        mergeCells: "Merge all",
                        mergeHorizontally: "Merge horizontally",
                        mergeVertically: "Merge vertically",
                        unmerge: "Unmerge"
                    }
                },
                freezeDialog: {
                    title: "Freeze panes",
                    buttons: {
                        freezePanes: "Freeze panes",
                        freezeRows: "Freeze rows",
                        freezeColumns: "Freeze columns",
                        unfreeze: "Unfreeze panes"
                    }
                },
                validationDialog: {
                    title: "Data Validation",
                    hintMessage: "Please enter a valid {0} value {1}.",
                    hintTitle: "Validation {0}",
                    criteria: {
                        any: "Any value",
                        number: "Number",
                        text: "Text",
                        date: "Date",
                        custom: "Custom Formula",
                        list: "List"
                    },
                    comparers: {
                        greaterThan: "greater than",
                        lessThan: "less than",
                        between: "between",
                        notBetween: "not between",
                        equalTo: "equal to",
                        notEqualTo: "not equal to",
                        greaterThanOrEqualTo: "greater than or equal to",
                        lessThanOrEqualTo: "less than or equal to"
                    },
                    comparerMessages: {
                        greaterThan: "greater than {0}",
                        lessThan: "less than {0}",
                        between: "between {0} and {1}",
                        notBetween: "not between {0} and {1}",
                        equalTo: "equal to {0}",
                        notEqualTo: "not equal to {0}",
                        greaterThanOrEqualTo: "greater than or equal to {0}",
                        lessThanOrEqualTo: "less than or equal to {0}",
                        custom: "that satisfies the formula: {0}"
                    },
                    labels: {
                        criteria: "Criteria",
                        comparer: "Comparer",
                        min: "Min",
                        max: "Max",
                        value: "Value",
                        start: "Start",
                        end: "End",
                        onInvalidData: "On invalid data",
                        rejectInput: "Reject input",
                        showWarning: "Show warning",
                        showHint: "Show hint",
                        hintTitle: "Hint title",
                        hintMessage: "Hint message",
                        ignoreBlank: "Ignore blank"
                    },
                    placeholders: {
                        typeTitle: "Type title",
                        typeMessage: "Type message"
                    }
                },
                saveAsDialog: {
                    title: "Save As...",
                    labels: {
                        fileName: "File name",
                        saveAsType: "Save as type"
                    }
                },
                exportAsDialog: {
                    title: "Export...",
                    labels: {
                        fileName: "File name",
                        saveAsType: "Save as type",
                        exportArea: "Export",
                        paperSize: "Paper size",
                        margins: "Margins",
                        orientation: "Orientation",
                        print: "Print",
                        guidelines: "Guidelines",
                        center: "Center",
                        horizontally: "Horizontally",
                        vertically: "Vertically"
                    }
                },
                modifyMergedDialog: {
                    errorMessage: "Cannot change part of a merged cell."
                },
                useKeyboardDialog: {
                    title: "Copying and pasting",
                    errorMessage: "These actions cannot be invoked through the menu. Please use the keyboard shortcuts instead:",
                    labels: {
                        forCopy: "for copy",
                        forCut: "for cut",
                        forPaste: "for paste"
                    }
                },
                unsupportedSelectionDialog: {
                    errorMessage: "That action cannot be performed on multiple selection."
                }
            })),
            kendo.spreadsheet && (kendo.spreadsheet.messages.filterMenu = e.extend(!0, kendo.spreadsheet.messages.filterMenu,
            {
                sortAscending: "Sort range A to Z",
                sortDescending: "Sort range Z to A",
                filterByValue: "Filter by value",
                filterByCondition: "Filter by condition",
                apply: "Apply",
                search: "Search",
                addToCurrent: "Add to current selection",
                clear: "Clear",
                blanks: "(Blanks)",
                operatorNone: "None",
                and: "AND",
                or: "OR",
                operators: {
                    string: {
                        contains: "Text contains",
                        doesnotcontain: "Text does not contain",
                        startswith: "Text starts with",
                        endswith: "Text ends with"
                    },
                    date: {
                        eq: "Date is",
                        neq: "Date is not",
                        lt: "Date is before",
                        gt: "Date is after"
                    },
                    number: {
                        eq: "Is equal to",
                        neq: "Is not equal to",
                        gte: "Is greater than or equal to",
                        gt: "Is greater than",
                        lte: "Is less than or equal to",
                        lt: "Is less than"
                    }
                }
            })),
            kendo.spreadsheet && (kendo.spreadsheet.messages.toolbar = e.extend(!0, kendo.spreadsheet.messages.toolbar,
            {
                addColumnLeft: "Add column left",
                addColumnRight: "Add column right",
                addRowAbove: "Add row above",
                addRowBelow: "Add row below",
                alignment: "Alignment",
                alignmentButtons: {
                    justtifyLeft: "Align left",
                    justifyCenter: "Center",
                    justifyRight: "Align right",
                    justifyFull: "Justify",
                    alignTop: "Align top",
                    alignMiddle: "Align middle",
                    alignBottom: "Align bottom"
                },
                backgroundColor: "Background",
                bold: "Bold",
                borders: "Borders",
                colorPicker: {
                    reset: "Reset color",
                    customColor: "Custom color..."
                },
                copy: "Copy",
                cut: "Cut",
                deleteColumn: "Delete column",
                deleteRow: "Delete row",
                excelImport: "Import from Excel...",
                filter: "Filter",
                fontFamily: "Font",
                fontSize: "Font size",
                format: "Custom format...",
                formatTypes: {
                    automatic: "Automatic",
                    number: "Number",
                    percent: "Percent",
                    financial: "Financial",
                    currency: "Currency",
                    date: "Date",
                    time: "Time",
                    dateTime: "Date time",
                    duration: "Duration",
                    moreFormats: "More formats..."
                },
                formatDecreaseDecimal: "Decrease decimal",
                formatIncreaseDecimal: "Increase decimal",
                freeze: "Freeze panes",
                freezeButtons: {
                    freezePanes: "Freeze panes",
                    freezeRows: "Freeze rows",
                    freezeColumns: "Freeze columns",
                    unfreeze: "Unfreeze panes"
                },
                italic: "Italic",
                merge: "Merge cells",
                mergeButtons: {
                    mergeCells: "Merge all",
                    mergeHorizontally: "Merge horizontally",
                    mergeVertically: "Merge vertically",
                    unmerge: "Unmerge"
                },
                open: "Open...",
                paste: "Paste",
                quickAccess: {
                    redo: "Redo",
                    undo: "Undo"
                },
                saveAs: "Save As...",
                sortAsc: "Sort ascending",
                sortDesc: "Sort descending",
                sortButtons: {
                    sortSheetAsc: "Sort sheet A to Z",
                    sortSheetDesc: "Sort sheet Z to A",
                    sortRangeAsc: "Sort range A to Z",
                    sortRangeDesc: "Sort range Z to A"
                },
                textColor: "Text Color",
                textWrap: "Wrap text",
                underline: "Underline",
                validation: "Data validation..."
            })),
            kendo.spreadsheet && (kendo.spreadsheet.messages.view = e.extend(!0, kendo.spreadsheet.messages.view,
            {
                errors: {
                    shiftingNonblankCells: "Cannot insert cells due to data loss possibility. Select another insert location or delete the data from the end of your worksheet.",
                    filterRangeContainingMerges: "Cannot create a filter within a range containing merges",
                    validationError: "The value that you entered violates the validation rules set on the cell."
                },
                tabs: {
                    home: "Home",
                    insert: "Insert",
                    data: "Data"
                }
            })),
            kendo.ui.Slider && (kendo.ui.Slider.prototype.options = e.extend(!0, kendo.ui.Slider.prototype.options,
            {
                increaseButtonTitle: "Increase",
                decreaseButtonTitle: "Decrease"
            })),
            kendo.ui.TreeList && (kendo.ui.TreeList.prototype.options.messages = e.extend(!0, kendo.ui.TreeList.prototype.options.messages,
            {
                noRows: "No records to display",
                loading: "Loading...",
                requestFailed: "Request failed.",
                retry: "Retry",
                commands: {
                    edit: "Edit",
                    update: "Update",
                    canceledit: "Cancel",
                    create: "Add new record",
                    createchild: "Add child record",
                    destroy: "Delete",
                    excel: "Export to Excel",
                    pdf: "Export to PDF"
                }
            })),
            kendo.ui.TreeList && (kendo.ui.TreeList.prototype.options.columnMenu = e.extend(!0, kendo.ui.TreeList.prototype.options.columnMenu,
            {
                messages: {
                    columns: "Choose columns",
                    filter: "Apply filter",
                    sortAscending: "Sort (asc)",
                    sortDescending: "Sort (desc)"
                }
            })),
            kendo.ui.TreeView && (kendo.ui.TreeView.prototype.options.messages = e.extend(!0, kendo.ui.TreeView.prototype.options.messages,
            {
                loading: "Loading...",
                requestFailed: "Request failed.",
                retry: "Retry"
            })),
            kendo.ui.Upload && (kendo.ui.Upload.prototype.options.localization = e.extend(!0, kendo.ui.Upload.prototype.options.localization,
            {
                select: "Select files...",
                cancel: "Cancel",
                retry: "Retry",
                remove: "Remove",
                uploadSelectedFiles: "Upload files",
                dropFilesHere: "drop files here to upload",
                statusUploading: "uploading",
                statusUploaded: "uploaded",
                statusWarning: "warning",
                statusFailed: "failed",
                headerStatusUploading: "Uploading...",
                headerStatusUploaded: "Done"
            })),
            kendo.ui.Validator && (kendo.ui.Validator.prototype.options.messages = e.extend(!0, kendo.ui.Validator.prototype.options.messages,
            {
                required: "{0} is required",
                pattern: "{0} is not valid",
                min: "{0} should be greater than or equal to {1}",
                max: "{0} should be smaller than or equal to {1}",
                step: "{0} is not valid",
                email: "{0} is not valid email",
                url: "{0} is not valid URL",
                date: "{0} is not valid date",
                dateCompare: "End date should be greater than or equal to the start date"
            })),
            kendo.ui.progress && (kendo.ui.progress.messages = e.extend(!0, kendo.ui.progress.messages,
            {
                loading: "Loading..."
            })),
            kendo.ui.Dialog && (kendo.ui.Dialog.prototype.options.messages = e.extend(!0, kendo.ui.Dialog.prototype.options.localization,
            {
                close: "Close"
            })),
            kendo.ui.Alert && (kendo.ui.Alert.prototype.options.messages = e.extend(!0, kendo.ui.Alert.prototype.options.localization,
            {
                okText: "OK"
            })),
            kendo.ui.Confirm && (kendo.ui.Confirm.prototype.options.messages = e.extend(!0, kendo.ui.Confirm.prototype.options.localization,
            {
                okText: "OK",
                cancel: "Cancel"
            })),
            kendo.ui.Prompt && (kendo.ui.Prompt.prototype.options.messages = e.extend(!0, kendo.ui.Prompt.prototype.options.localization,
            {
                okText: "OK",
                cancel: "Cancel"
            }));
        }

        function setupCustomBindings() {
            //custom binding to enable support for editing ISO date strings inline in grids!
            kendo.data.binders.widget.datePickerUtc = kendo.data.Binder.extend({
                init: function (widget, bindings, options) {
                    //call the base constructor
                    kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                    this._change = $.proxy(this.change, this);
                    this.widget.bind("change", this._change);
                },
                change: function () {
                    var dateFormat = this.widget.options.format;
                    var date = this.widget.value();
                    if ((date === undefined) || (date === null) || (date === '')) {
                        this.bindings["value"].set(null);
                    }
                    else {
                        var value = dateUtils.toIsoDate(date);
                        this.bindings["value"].set(value);
                    }
                },
                refresh: function () {
                    var value = this.bindings["value"].get();
                    var date = dateUtils.parseIsoDate(value);
                    if (date) {
                        this.widget.value(date);
                    }
                },
                destroy: function () {
                    this.widget.unbind("change", this._change);
                }
            });
        }

    }

})();