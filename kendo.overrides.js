(function () {
    'use strict';

    var module = angular.module('app');

    module.config(function () {
        
        function e(selector, context) {
            // The jQuery object is actually just the init constructor 'enhanced'
            // Need init if jQuery is called (just allow error to be thrown if not included)
            return new jQuery.fn.init(selector, context);
        }

        kendo.ui.progress = function (t, n) {
            var i, r, o, a, s = t.find(".k-loading-mask");
            var l = kendo.support;
            var c = l.browser;
            n ? s.length || (i = l.isRtl(t), r = i ? "right" : "left", a = t.scrollLeft(), o = c.webkit && i ? t[0].scrollWidth - t.width() - 2 * a : 0, s = e("<div class='k-loading-mask'><span class='k-loading-text'>Loading...</span><div class='nocss3'><div class='k-loading-image'></div></div></div>").width("100%").height("100%").css("top", t.scrollTop()).css(r, Math.abs(a) + o).prependTo(t)) : s && s.remove()
        }
        
    });
})();