(function () {
    'use strict';

    angular.module('app').service('dataExportService', [dataExportService]);

    function dataExportService() {
        /* Service */

        var service = {
            exportToCsv: exportToCsv
        };
        return service;

        /*
        * Rows : The 1st row must contain the header
        *
        * Example :
        *
        * let rows = [{
        *     lastname: "Lastname",
        *     firstname: "Firstname",
        *     birthDate: "Date of birth"
        *   },
        *   {
        *     lastname: "Doe",
        *     firstname: "John",
        *     birthDate: new Date(1980, 12, 14)
        *   },
        *   {
        *     lastname: "Land",
        *     firstname: "Mary",
        *     birthDate: new Date(1997, 02, 25)
        *   }
        * ];
        */
        function exportToCsv(filename, rows) {
            if (!rows || !rows.length) {
                return;
            }

            const separator = ';';
            let csvContent = '\ufeff'; // UTF-8 BOM
            csvContent +=
                rows.map(row => {
                    return Object.values(row).map(cell => {
                        if (cell == null) {
                            return '';
                        }
                        let value = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
                        if (value.search(/("|,|\n)/g) >= 0) {
                            value = `"${value}"`;
                        }
                        return value;
                    }).join(separator);
                }).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    // Browsers that support HTML5 download attribute
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        }
    }
})();