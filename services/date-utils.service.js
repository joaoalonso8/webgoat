(function () {
    'use strict';

    angular.module('app.utils', []);

    angular
        .module('app.utils')
        .service('dateUtils', [dateUtils]);

    /**
     * DateUtils provides helper functions to map ISO daes and timestamps
     * between their string representation and JavaScript Date objects.
     * Date values which should remain constant in all time zones should
     * be represented by the string format "yyyy-MM-dd". Timestamps must be
     * expressed in the ISO format "yyyy-MM-ddTHH:mm:ss.fffZ". The seconds,
     * milliseconds and trailing "Z" are optional. Timestamps will be
     * converted to the local time zone.
     */
    function dateUtils() {

        var service = {
            isDate: isDate,
            isIsoDate: isIsoDate,
            wholeDate: wholeDate,
            parseIsoDate: parseIsoDate,
            format: format,
            formatIsoDate: formatIsoDate,
            toIsoDate: toIsoDate,
            toIsoDatetime: toIsoDatetime,
            calculateAge: calculateAge,
            daysDifference: daysDifference,
            monthsDifference: monthsDifference,
            yearsDifference: yearsDifference,
            weeksDifference: weeksDifference
        };

        var reIsoDateTime = /^(\d{4})-(1[0-2]|0[1-9])-(3[0-1]|[1-2]\d|0[1-9])(|T(2[0-3]|[0-1]\d):([0-5]\d)(|:([0-5]\d)(|\.\d{1,7}))(|[zZ]))$/;

        return service;

        /**
         * Returns true if the value is a JavaScript Date instance
         */
        function isDate(value) {
            return Object.prototype.toString.call(value) === "[object Date]";
        }

        /**
         * Returns true if the value is a JavaScript string conforming to ISO date format
         */
        function isIsoDate(value) {
            return Object.prototype.toString.call(value) === "[object String]"
                && reIsoDateTime.test(value);
        }

        /**
         * Converts an ISO string or existing Date oject to a new Date instance
         * that has zero time.
         */
        function wholeDate(value) {
            var newValue;
            if (isDate(value)) {
                newValue = new Date(value);
            }
            else if (isIsoDate(value)) {
                newValue = parseIsoDate(value);
            }
            else {
                throw new Error("DateUtils.wholeDate(value) requires a Date object or ISO 8601 formatted string");
            }
            newValue.setHours(0, 0, 0, 0);
            return newValue;
        }

        /**
         * Parses a string representation of a date/timestamp and returns a
         * breakdown of its component parts, year, month, day, hour...
         * The hasTime property can be used to verify if the input only
         * contained date information or was a timestamp.
         */
        function splitIsoDate(value) {
            var d = reIsoDateTime.exec(value);
            if (!d) {
                return undefined;
            }
            return {
                year: parseInt(d[1]),
                month: parseInt(d[2]) - 1,
                day: parseInt(d[3]),
                hasTime: d[4] ? true : false,
                hour: d[5] ? parseInt(d[5]) : 0,
                minutes: d[6] ? parseInt(d[6]) : 0,
                seconds: d[8] ? parseInt(d[8]) : 0,
                milliseconds: d[9] ? parseFloat(d[9]) * 1000 : 0,
                isUtc: d[10] ? true : false
            };
        }

        /**
         * Converts an ISO date/timestamp string to a local JavaScript Date.
         */
        function parseIsoDate(value) {
            var dtv = splitIsoDate(value);
            if (dtv) {
                return createDate(dtv);
            }
            return undefined;
        }

        function createDate(dtv) {
            if (dtv.isUtc) {
                return new Date(Date.UTC(dtv.year, dtv.month, dtv.day, dtv.hour, dtv.minutes, dtv.seconds, dtv.milliseconds));
            }
            else if (dtv.hasTime) {
                return new Date(dtv.year, dtv.month, dtv.day, dtv.hour, dtv.minutes, dtv.seconds, dtv.milliseconds);
            }
            else {
                return new Date(dtv.year, dtv.month, dtv.day);
            }
        }

        /**
         * Returns a formatted representation of a javascript date object or ISO date string.
         * If the value is an ISO string and no format is specified then it will default to
         * pattern 'd' for date only values and pattern 'G' for timestamps.
         * For more information on date format patterns see either the .NET or Kendo documentation.
         */
        function format(value, format) {
            if (value) {
                if (isDate(value)) {
                    return kendo.toString(value, format);
                }
                else if (isIsoDate(value)) {
                    return formatIsoDate(value, format);
                }
                else {
                    throw new Error("DateUtils.wholeDate(value) requires a Date object or ISO 8601 formatted string");
                }
            }
            return "";
        }

        /**
         * Returns a formatted representation of the ISO date/timestamp string.
         * If no format is specified then it will default to pattern 'd' for
         * date only values and pattern 'G' for timestamps.
         * For more information on date format patterns see either the .NET or
         * Kendo documentation.
         */
        function formatIsoDate(value, format) {
            var dtv = splitIsoDate(value);
            if (dtv) {
                var date = createDate(dtv);
                if (!format) {
                    format = dtv.hasTime ? 'G' : 'd';
                }
                return kendo.toString(date, format);
            }
        }

        /**
         * Converst a JavaScript Date object in to the ISO string
         * representation "yyyy-MM-dd".
         */
        function toIsoDate(value) {           
            var year = value.getFullYear().toString();
            var month = (value.getMonth() + 1).toString();
            var day = value.getDate().toString();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            var str = [year, month, day].join('-');
            return str;
        }

        /**
         * Converst a JavaScript Date object in to the ISO string
         * representation "yyyy-MM-ddThh:mm:ss.nnnZ".
         */
        function toIsoDatetime(value) {
            value = new Date(value.getTime() + (value.getTimezoneOffset() * 60000))
            var year = value.getFullYear().toString();
            var month = (value.getMonth() + 1).toString();
            var day = value.getDate().toString();
            var hours = value.getHours().toString();
            var minutes = value.getMinutes().toString();
            var seconds = value.getSeconds().toString();
            var milliseconds = value.getMilliseconds().toString();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            if (hours.length < 2) hours = '0' + hours;
            if (minutes.length < 2) minutes = '0' + minutes;
            if (seconds.length < 2) seconds = '0' + seconds;
            while (milliseconds.length < 3) milliseconds = '0' + milliseconds;
            var str = [year, month, day].join('-') + 'T' + [hours, minutes, seconds].join(':') + '.' + milliseconds + 'Z';
            return str;
        }

        /**
         * Calculate the whole year age between the value supplied and today
         */
        function calculateAge(start, end) {
            if (typeof start === 'undefined' || start == null ) {
                return undefined;
            }
            if (typeof end === 'undefined') {
                end = new Date();
            }
            if (isDate(start)) {
                start = toIsoDate(start);
            }
            if (isDate(end)) {
                end = toIsoDate(end);
            }
            var dtvStart = splitIsoDate(start);
            var dtvEnd = splitIsoDate(end);
            if (dtvStart.year === dtvEnd.year) {
                return 0;
            }
            var age = dtvEnd.year - dtvStart.year;
            if (dtvEnd.month < dtvStart.month || (dtvEnd.month === dtvStart.month && dtvEnd.day < dtvStart.day)) {
                if (age > 0) {
                    age--;
                } else {
                    age++;
                }
            }
            return age;
        }

        function daysDifference(startDate, endDate) {
            startDate = wholeDate(startDate);
            endDate = wholeDate(endDate);

            var diff = endDate.getTime() - startDate.getTime();
            if (diff < 0) {
                return Math.ceil(diff * 0.0000000115740741);
            }
            else {
                return Math.floor(diff * 0.0000000115740741);
            }
        }

        function monthsDifference(startDate, endDate) {
            startDate = wholeDate(startDate);
            endDate = wholeDate(endDate);

            let years = yearsDiff(startDate, endDate);
            let months = (years * 12) + (endDate.getMonth() - startDate.getMonth());
            return months;
        }

        function yearsDifference(startDate, endDate) {
            startDate = wholeDate(startDate);
            endDate = wholeDate(endDate);

            let yearsDiff = endDate.getFullYear() - startDate.getFullYear();
            return yearsDiff;
        }

        function weeksDifference(startDate, endDate) {
            startDate = wholeDate(startDate);
            endDate = wholeDate(endDate);

            var diff = (endDate.getTime() - startDate.getTime()) / 1000;
            diff /= (60 * 60 * 24 * 7);
            return Math.abs(Math.round(diff));
        }
    }

})();