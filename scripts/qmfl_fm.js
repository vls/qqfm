/*
 * QMFL
 * Copyright(c) 2011, Music WebDev Group.
 */
if (typeof (MUSIC) == "undefined" || !MUSIC) {
    var MUSIC = {
        version: "1.0",
        _QMFL: true,
        _debugMode: false
    };
}
MUSIC.emptyFn = function () {};
MUSIC.returnFn = function (v) {
    return v;
};
(function () {
    var ua = MUSIC.userAgent = {},
        agent = navigator.userAgent,
        nv = navigator.appVersion,
        r, m, optmz;
    ua.adjustBehaviors = MUSIC.emptyFn;
    if (window.ActiveXObject) {
        ua.ie = 9 - ((agent.indexOf('Trident/5.0') > -1) ? 0 : 1) - (window.XDomainRequest ? 0 : 1) - (window.XMLHttpRequest ? 0 : 1);
        ua.isBeta = navigator.appMinorVersion && navigator.appMinorVersion.toLowerCase().indexOf('beta') > -1;
        if (ua.ie < 7) {
            try {
                document.execCommand('BackgroundImageCache', false, true);
            } catch (ign) {}
        }
        MUSIC._doc = document;
        optmz = function (st) {
            return function (fns, tm) {
                var aargs;
                if (typeof fns == 'string') {
                    return st(fns, tm);
                } else {
                    aargs = Array.prototype.slice.call(arguments, 2);
                    return st(function () {
                        fns.apply(null, aargs);
                    }, tm);
                }
            };
        };
        MUSIC._setTimeout = optmz(window.setTimeout);
        MUSIC._setInterval = optmz(window.setInterval);
    } else if (document.getBoxObjectFor || typeof (window.mozInnerScreenX) != 'undefined') {
        r = /(?:Firefox|GranParadiso|Iceweasel|Minefield).(\d+\.\d+)/i;
        ua.firefox = parseFloat((r.exec(agent) || r.exec('Firefox/3.3'))[1], 10);
    } else if (!navigator.taintEnabled) {
        m = /AppleWebKit.(\d+\.\d+)/i.exec(agent);
        ua.webkit = m ? parseFloat(m[1], 10) : (document.evaluate ? (document.querySelector ? 525 : 420) : 419);
        if ((m = /Chrome.(\d+\.\d+)/i.exec(agent)) || window.chrome) {
            ua.chrome = m ? parseFloat(m[1], 10) : '2.0';
        } else if ((m = /Version.(\d+\.\d+)/i.exec(agent)) || window.safariHandler) {
            ua.safari = m ? parseFloat(m[1], 10) : '3.3';
        }
        ua.air = agent.indexOf('AdobeAIR') > -1 ? 1 : 0;
        ua.isiPad = agent.indexOf('iPad') > -1;
        ua.isiPhone = agent.indexOf('iPhone') > -1;
    } else if (window.opera) {
        ua.opera = parseFloat(window.opera.version(), 10);
    } else {
        ua.ie = 6;
    }
    if (!(ua.macs = agent.indexOf('Mac OS X') > -1)) {
        ua.windows = ((m = /Windows.+?(\d+\.\d+)/i.exec(agent)), m && parseFloat(m[1], 10));
        ua.linux = agent.indexOf('Linux') > -1;
    }
})();
if (MUSIC.userAgent.ie) {
    eval((MUSIC.userAgent.ie < 9 ? "var document = MUSIC._doc;" : "") + "var setTimeout = MUSIC._setTimeout, setInterval = MUSIC._setInterval");
}
var ua = MUSIC.userAgent;
MUSIC.object = {
    map: function (object, scope) {
        return MUSIC.object.extend(scope || window, object);
    },
    extend: function () {
        var args = arguments,
            len = arguments.length,
            deep = false,
            i = 1,
            target = args[0],
            opts, src, clone, copy;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && typeof target !== "function") {
            target = {};
        }
        if (len === i) {
            target = MUSIC;
            --i;
        }
        for (; i < len; i++) {
            if ((opts = arguments[i]) != null) {
                for (var name in opts) {
                    src = target[name];
                    copy = opts[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && typeof copy === "object" && !copy.nodeType) {
                        if (src) {
                            clone = src;
                        } else if (MUSIC.lang.isArray(copy)) {
                            clone = [];
                        } else if (MUSIC.object.getType(copy) === 'object') {
                            clone = {};
                        } else {
                            clone = copy;
                        }
                        target[name] = MUSIC.object.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    },
    each: function (obj, callback) {
        var value, i = 0,
            length = obj.length,
            isObj = (length === undefined) || (typeof (obj) == "function");
        if (isObj) {
            for (var name in obj) {
                if (callback.call(obj[name], obj[name], name, obj) === false) {
                    break;
                }
            }
        } else {
            for (value = obj[0]; i < length && false !== callback.call(value, value, i, obj); value = obj[++i]) {}
        }
        return obj;
    },
    getType: function (obj) {
        return obj === null ? 'null' : (obj === undefined ? 'undefined' : Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
    },
    routeRE: /([\d\w_]+)/g,
    route: function (obj, path) {
        obj = obj || {};
        path = String(path);
        var r = MUSIC.object.routeRE,
            m;
        r.lastIndex = 0;
        while ((m = r.exec(path)) !== null) {
            obj = obj[m[0]];
            if (obj === undefined || obj === null) {
                break;
            }
        }
        return obj;
    },
    bind: function (obj, fn) {
        var slice = Array.prototype.slice,
            args = slice.call(arguments, 2);
        return function () {
            obj = obj || this;
            fn = typeof fn == 'string' ? obj[fn] : fn;
            fn = typeof fn == 'function' ? fn : MUSIC.emptyFn;
            return fn.apply(obj, args.concat(slice.call(arguments, 0)));
        };
    },
    ease: function (src, tar, rule) {
        if (tar) {
            if (typeof (rule) != 'function') {
                rule = MUSIC.object._eachFn;
            }
            MUSIC.object.each(src, function (v, k) {
                if (typeof (v) == 'function') {
                    tar[rule(k)] = v;
                }
            });
        }
    },
    _easeFn: function (name) {
        return '$' + name;
    }
};
MUSIC.namespace = MUSIC.object;
MUSIC.runTime = {
    isDebugMode: false,
    error: MUSIC.emptyFn,
    warn: MUSIC.emptyFn
};
MUSIC.console = function (expr) {
    if (window.console) {
        if (console.assert) {
            console.assert.apply(null, arguments);
        } else {
            expr || console.log.apply(null, slice.call(arguments, 1));
        }
    }
};
MUSIC.console.print = function (msg) {
    window.console && console.log(msg);
};
MUSIC.object.map(MUSIC.object, MUSIC);
MUSIC.widget = {};
MUSIC.channel = {};
MUSIC.module = {};

MUSIC.config = {
    debugLevel: 0,
    defaultDataCharacterSet: "GB2312",
    DCCookieDomain: "music.qq.com",
    domainPrefix: "qq.com",
    toolPath: "http://imgcache.qq.com/music/miniportal_v4/tool/",
    tipsPath: "http://music.qq.com/tips/",
    gbEncoderPath: "http://imgcache.qq.com/qzone/v5/toolpages/",
    FSHelperPage: "http://imgcache.qq.com/music/miniportal_v4/tool/html/fp_gbk.html",
    defaultShareObject: "http://qzs.qq.com/qzone/v5/toolpages/getset.swf",
    staticServer: "http://imgcache.qq.com/ac/qzone/qzfl/lc/"
};

MUSIC.string = {
    RegExps: {
        trim: /^\s+|\s+$/g,
        ltrim: /^\s+/,
        rtrim: /\s+$/,
        nl2br: /\n/g,
        s2nb: /[\x20]{2}/g,
        URIencode: /[\x09\x0A\x0D\x20\x21-\x29\x2B\x2C\x2F\x3A-\x3F\x5B-\x5E\x60\x7B-\x7E]/g,
        escHTML: {
            re_amp: /&/g,
            re_lt: /</g,
            re_gt: />/g,
            re_apos: /\x27/g,
            re_quot: /\x22/g
        },
        escString: {
            bsls: /\\/g,
            nl: /\n/g,
            rt: /\r/g,
            tab: /\t/g
        },
        restXHTML: {
            re_amp: /&amp;/g,
            re_lt: /&lt;/g,
            re_gt: /&gt;/g,
            re_apos: /&(?:apos|#0?39);/g,
            re_quot: /&quot;/g
        },
        write: /\{(\d{1,2})(?:\:([xodQqb]))?\}/g,
        isURL: /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i,
        cut: /[\x00-\xFF]/,
        getRealLen: {
            r0: /[^\x00-\xFF]/g,
            r1: /[\x00-\xFF]/g
        },
        format: /\{([\d\w\.]+)\}/g
    },
    commonReplace: function (s, p, r) {
        return s.replace(p, r);
    },
    listReplace: function (s, l) {
        if (MUSIC.lang.isHashMap(l)) {
            for (var i in l) {
                s = MUSIC.string.commonReplace(s, l[i], i);
            }
            return s;
        } else {
            return s + '';
        }
    },
    trim: function (str) {
        return MUSIC.string.commonReplace(str + "", MUSIC.string.RegExps.trim, '');
    },
    ltrim: function (str) {
        return MUSIC.string.commonReplace(str + "", MUSIC.string.RegExps.ltrim, '');
    },
    rtrim: function (str) {
        return MUSIC.string.commonReplace(str + "", MUSIC.string.RegExps.rtrim, '');
    },
    nl2br: function (str) {
        return MUSIC.string.commonReplace(str + "", MUSIC.string.RegExps.nl2br, '<br />');
    },
    s2nb: function (str) {
        return MUSIC.string.commonReplace(str + "", MUSIC.string.RegExps.s2nb, '&nbsp;&nbsp;');
    },
    URIencode: function (str) {
        var cc, ccc;
        return (str + "").replace(MUSIC.string.RegExps.URIencode, function (a) {
            if (a == "\x20") {
                return "+";
            } else if (a == "\x0D") {
                return "";
            }
            cc = a.charCodeAt(0);
            ccc = cc.toString(16);
            return "%" + ((cc < 16) ? ("0" + ccc) : ccc);
        });
    },
    replaceUrl: function (str) {
        return str.replace(/=/g, "%3D").replace(/&/g, "%26").replace(/\?/g, "%3F").replace(/#/g, "%23");
    },
    decodeURLSymbol: function (str) {
        return str.replace(/%3d/g, "=").replace(/%3f/g, "?").replace(/%26/g, "&").replace(/%3c/g, "<").replace(/%3e/g, ">").replace(/%22/g, "\"").replace(/%27/g, "'").replace(/\+/g, " ").replace(/%2f/ig, '/');
    },
    GbkUrlDecode: function (str, callback) {
        var jsLoader = new MUSIC.JsLoader();
        jsLoader.onload = function () {
            callback(UrlDecode(str));
        };
        if ( !! navigator && "systemLanguage" in navigator && navigator.systemLanguage != "zh-cn") {
            jsLoader.load(MUSIC.config.toolPath + "js/gbk_decode.js");
        } else {
            var opts = {
                type: "text/vbscript"
            };
            jsLoader.load("http://imgcache.qq.com/music/miniportal_v3/js/vburldecode.js", null, opts);
        }
    },
    escHTML: function (str) {
        var t = MUSIC.string.RegExps.escHTML;
        return MUSIC.string.listReplace((str + ""), {
            '&amp;': t.re_amp,
            '&lt;': t.re_lt,
            '&gt;': t.re_gt,
            '&#039;': t.re_apos,
            '&quot;': t.re_quot
        });
    },
    escString: function (str) {
        var t = MUSIC.string.RegExps.escString,
            h = MUSIC.string.RegExps.escHTML;
        return MUSIC.string.listReplace((str + ""), {
            '\\\\': t.bsls,
            '\\n': t.nl,
            '': t.rt,
            '\\t': t.tab,
            '\\\'': h.re_apos,
            '\\"': h.re_quot
        });
    },
    restHTML: function (str) {
        if (!MUSIC.string.restHTML.__utilDiv) {
            MUSIC.string.restHTML.__utilDiv = document.createElement("div");
        }
        var t = MUSIC.string.restHTML.__utilDiv;
        t.innerHTML = (str + "");
        if (typeof (t.innerText) != 'undefined') {
            return t.innerText;
        } else if (typeof (t.textContent) != 'undefined') {
            return t.textContent;
        } else if (typeof (t.text) != 'undefined') {
            return t.text;
        } else {
            return '';
        }
    },
    restXHTML: function (str) {
        var t = MUSIC.string.RegExps.restXHTML;
        return MUSIC.string.listReplace((str + ""), {
            '<': t.re_lt,
            '>': t.re_gt,
            '\x27': t.re_apos,
            '\x22': t.re_quot,
            '&': t.re_amp
        });
    },
    write: function (strFormat, someArgs) {
        if (arguments.length < 1 || !MUSIC.lang.isString(strFormat)) {
            return '';
        }
        var rArr = MUSIC.lang.arg2arr(arguments),
            result = rArr.shift(),
            tmp;
        return result.replace(MUSIC.string.RegExps.write, function (a, b, c) {
            b = parseInt(b, 10);
            if (b < 0 || (typeof rArr[b] == 'undefined')) {
                return '(n/a)';
            } else {
                if (!c) {
                    return rArr[b];
                } else {
                    switch (c) {
                    case 'x':
                        return '0x' + rArr[b].toString(16);
                    case 'o':
                        return 'o' + rArr[b].toString(8);
                    case 'd':
                        return rArr[b].toString(10);
                    case 'Q':
                        return '\x22' + rArr[b].toString(16) + '\x22';
                    case 'q':
                        return '`' + rArr[b].toString(16) + '\x27';
                    case 'b':
                        return '<' + !! rArr[b] + '>';
                    }
                }
            }
        });
    },
    isURL: function (s) {
        return MUSIC.string.RegExps.isURL.test(s);
    },
    escapeURI: function (s) {
        if (window.encodeURIComponent) {
            return encodeURIComponent(s);
        }
        if (window.escape) {
            return escape(s);
        }
        return '';
    },
    fillLength: function (source, length, ch, isRight) {
        if ((source = String(source)).length < length) {
            var ar = new Array(length - source.length);
            ar[isRight ? 'unshift' : 'push'](source);
            source = ar.join(ch == undefined ? '0' : ch);
        }
        return source;
    },
    getRealLen: function (s, isUTF8) {
        if (typeof (s) != 'string') {
            return 0;
        }
        if (!isUTF8) {
            return s.replace(MUSIC.string.RegExps.getRealLen.r0, "**").length;
        } else {
            var cc = s.replace(MUSIC.string.RegExps.getRealLen.r1, "");
            return (s.length - cc.length) + (encodeURI(cc).length / 3);
        }
    },
    format: function (str) {
        var args = Array.prototype.slice.call(arguments),
            v;
        str = args.shift() + '';
        if (args.length == 1 && typeof (args[0]) == 'object') {
            args = args[0];
        }
        MUSIC.string.RegExps.format.lastIndex = 0;
        return str.replace(MUSIC.string.RegExps.format, function (m, n) {
            v = MUSIC.object.route(args, n);
            return v === undefined ? m : v;
        });
    },
    checkKoreaChar: function (str) {
        for (i = 0; i < str.length; i++) {
            if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
                return true;
            }
        }
        return false;
    },
    escapeKoreaChar: function (str) {
        var dest = [];
        for (var i = 0; i < str.length; i++) {
            if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
                dest.push("&#" + str.charCodeAt(i) + ";");
            } else {
                dest.push(str.charAt(i));
            }
        }
        return dest.join('');
    },
    removeUbb: function (s) {
        s = s.replace(/\[em\]e(\d{1,3})\[\/em\]/g, "");
        s = s.replace(/\[(img)\].*\[\/img\]/ig, "");
        s = s.replace(/\[(flash)\].*\[\/flash\]/ig, "");
        s = s.replace(/\[(video)\].*\[\/video\]/ig, "");
        s = s.replace(/\[(audio)\].*\[\/audio\]/ig, "");
        s = s.replace(/&nbsp;/g, "");
        s = s.replace(/\[\/?(b|url|img|flash|video|audio|ftc|ffg|fts|ft|email|center|u|i|marque|m|r|quote)[^\]]*\]/ig, "");
        return s;
    }
};
MUSIC.object.extend(String.prototype, {
    trim: function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    },
    escapeHTML: function () {
        var div = document.createElement('div');
        var text = document.createTextNode(this);
        div.appendChild(text);
        return div.innerHTML;
    },
    unescapeHTML: function () {
        var div = document.createElement('div');
        div.innerHTML = this;
        return div.innerText || div.textNode || '';
    },
    cut: function (bitLen, tails) {
        str = this;
        bitLen -= 0;
        tails = tails || '...';
        if (isNaN(bitLen)) {
            return str;
        }
        var len = str.length,
            i = Math.min(Math.floor(bitLen / 2), len),
            cnt = MUSIC.string.getRealLen(str.slice(0, i));
        for (; i < len && cnt < bitLen; i++) {
            cnt += 1 + (str.charCodeAt(i) > 255);
        }
        return str.slice(0, cnt > bitLen ? i - 1 : i) + (i < len ? tails : '');
    },
    jstpl_format: function (ns) {
        function fn(w, g) {
            if (g in ns) return ns[g];
            return '';
        };
        return this.replace(/%\(([A-Za-z0-9_|.]+)\)/g, fn);
    }
});

function UrlDecode(str) {
    var ret = "";
    try {
        for (var i = 0; i < str.length; i++) {
            var chr = str.charAt(i);
            if (chr == "+") {
                ret += " ";
            } else if (chr == "%") {
                var asc = str.substring(i + 1, i + 3);
                if (parseInt("0x" + asc) > 0x7f) {
                    var chr2 = str.charAt(i + 3);
                    if (chr2 == "%") {
                        ret += asc2str(parseInt("0x" + asc + str.substring(i + 4, i + 6)));
                        i += 5;
                    } else {
                        ret += asc2str(parseInt("0x" + asc + str2asc(str.substring(i + 3, i + 4))));
                        i += 3;
                    }
                } else {
                    ret += asc2str(parseInt("0x" + asc));
                    i += 2;
                }
            } else {
                ret += chr;
            }
        }
    } catch (e) {
        return str;
    }
    return ret;
}

MUSIC.event = {
    KEYS: {
        BACKSPACE: 8,
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        DELETE: 46
    },
    _eventListDictionary: {},
    _fnSeqUID: 0,
    _objSeqUID: 0,
    addEvent: function (obj, eventType, fn, argArray) {
        var cfn, res = false,
            l;
        if (!obj) {
            return res;
        }
        if (!obj.eventsListUID) {
            obj.eventsListUID = "e" + (++MUSIC.event._objSeqUID);
        }
        if (!(l = MUSIC.event._eventListDictionary[obj.eventsListUID])) {
            l = MUSIC.event._eventListDictionary[obj.eventsListUID] = {};
        }
        if (!fn.__elUID) {
            fn.__elUID = "e" + (++MUSIC.event._fnSeqUID) + obj.eventsListUID;
        }
        if (!l[eventType]) {
            l[eventType] = {};
        }
        if (typeof (l[eventType][fn.__elUID]) == 'function') {
            return false;
        }
        cfn = function (evt) {
            return fn.apply(obj, !argArray ? [MUSIC.event.getEvent(evt)] : ([MUSIC.event.getEvent(evt)]).concat(argArray));
        };
        if (obj.addEventListener) {
            obj.addEventListener(eventType, cfn, false);
            res = true;
        } else if (obj.attachEvent) {
            res = obj.attachEvent("on" + eventType, cfn);
        } else {
            res = false;
        }
        if (res) {
            l[eventType][fn.__elUID] = cfn;
        }
        return res;
    },
    removeEvent: function (obj, eventType, fn) {
        var cfn = fn,
            res = false,
            l = MUSIC.event._eventListDictionary,
            r;
        if (!obj) {
            return res;
        }
        if (!fn) {
            return MUSIC.event.purgeEvent(obj, eventType);
        }
        if (obj.eventsListUID && l[obj.eventsListUID]) {
            l = l[obj.eventsListUID][eventType];
            if (l && l[fn.__elUID]) {
                cfn = l[fn.__elUID];
                r = l;
            }
        }
        if (obj.removeEventListener) {
            obj.removeEventListener(eventType, cfn, false);
            res = true;
        } else if (obj.detachEvent) {
            obj.detachEvent("on" + eventType, cfn);
            res = true;
        } else {
            return false;
        }
        if (res && r && r[fn.__elUID]) {
            delete r[fn.__elUID];
        }
        return res;
    },
    purgeEvent: function (obj, type) {
        var l;
        if (obj.eventsListUID && (l = MUSIC.event._eventListDictionary[obj.eventsListUID]) && l[type]) {
            for (var k in l[type]) {
                if (obj.removeEventListener) {
                    obj.removeEventListener(type, l[type][k], false);
                } else if (obj.detachEvent) {
                    obj.detachEvent('on' + type, l[type][k]);
                }
            }
        }
        if (obj['on' + type]) {
            obj['on' + type] = null;
        }
        if (l) {
            l[type] = null;
            delete l[type];
        }
        return true;
    },
    getEvent: function (evt) {
        var evt = window.event || evt,
            c, cnt;
        if (!evt && window.Event) {
            c = arguments.callee;
            cnt = 0;
            while (c) {
                if ((evt = c.arguments[0]) && typeof (evt.srcElement) != "undefined") {
                    break;
                } else if (cnt > 9) {
                    break;
                }
                c = c.caller;
                ++cnt;
            }
        }
        return evt;
    },
    getButton: function (evt) {
        var e = MUSIC.event.getEvent(evt);
        if (!e) {
            return -1
        }
        if (MUSIC.userAgent.ie) {
            return e.button - Math.ceil(e.button / 2);
        } else {
            return e.button;
        }
    },
    getTarget: function (evt) {
        var e = MUSIC.event.getEvent(evt);
        if (e) {
            return e.srcElement || e.target;
        } else {
            return null;
        }
    },
    getCurrentTarget: function (evt) {
        var e = MUSIC.event.getEvent(evt);
        if (e) {
            return e.currentTarget || document.activeElement;
        } else {
            return null;
        }
    },
    cancelBubble: function (evt) {
        evt = MUSIC.event.getEvent(evt);
        if (!evt) {
            return false
        }
        if (evt.stopPropagation) {
            evt.stopPropagation();
        } else {
            if (!evt.cancelBubble) {
                evt.cancelBubble = true;
            }
        }
    },
    preventDefault: function (evt) {
        evt = MUSIC.event.getEvent(evt);
        if (!evt) {
            return false
        }
        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }
    },
    mouseX: function (evt) {
        evt = MUSIC.event.getEvent(evt);
        return evt.pageX || (evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
    },
    mouseY: function (evt) {
        evt = MUSIC.event.getEvent(evt);
        return evt.pageY || (evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
    },
    getRelatedTarget: function (ev) {
        ev = MUSIC.event.getEvent(ev);
        var t = ev.relatedTarget;
        if (!t) {
            if (ev.type == "mouseout") {
                t = ev.toElement;
            } else if (ev.type == "mouseover") {
                t = ev.fromElement;
            } else {}
        }
        return t;
    },
    replaceAllEvent: function (container) {
        container = container || document;

        function replaceElmEvent(elm, index) {
            if (!elm) {
                return;
            }
            MUSIC.object.each(['dblclick', 'mouseover', 'mouseout', 'mousemove', 'error', 'click'], function (event_type) {
                var _event = elm.getAttribute('r_on' + event_type);
                if (_event) {
                    var event_handler = new Function(_event);
                    elm.removeAttribute('r_on' + event_type);
                    MUSIC.event.addEvent(elm, event_type, event_handler);
                }
            });
        }
        var _arr = container.getElementsByName('script_btn');
        for (var i = 0, len = _arr.length; i < len; i++) {
            replaceElmEvent(_arr[i], i);
        }
    },
    onDomReady: function (fn) {
        MUSIC.event.onDomReady._fn = function () {
            fn();
            MUSIC.event.onDomReady._fn = null;
        };
        if (document.addEventListener) {
            if (MUSIC.userAgent.safari < 4) {
                var interval = setInterval(function () {
                    if ((/loaded|complete/).test(document.readyState)) {
                        MUSIC.event.onDomReady._fn();
                        clearInterval(interval);
                    }
                }, 50);
            } else {
                document.addEventListener("DOMContentLoaded", MUSIC.event.onDomReady._fn, true);
            }
        } else {
            var src = window.location.protocol == 'https:' ? '//:' : 'javascript:void(0)';
            document.write('<script onreadystatechange="if(this.readyState==\'complete\'){this.parentNode.removeChild(this);MUSIC.event.onDomReady._fn();}" defer="defer" src="' + src + '"><\/script\>');
        }
    }
};
MUSIC.event.on = MUSIC.event.addEvent;
MUSIC.event.bind = MUSIC.object.bind;

MUSIC.lang = {
    isString: function (o) {
        return MUSIC.object.getType(o) == "string";
    },
    isArray: function (o) {
        return MUSIC.object.getType(o) == "array";
    },
    isFunction: function (o) {
        return MUSIC.object.getType(o) == "function";
    },
    isHashMap: function (o) {
        return MUSIC.object.getType(o) == "object";
    },
    isNode: function (o) {
        return typeof (o.nodeName) != 'undefined' || typeof (o.nodeType) != 'undefined';
    },
    isElement: function (o) {
        return o && o.nodeType == 1;
    },
    arg2arr: function (refArgs, start) {
        if (typeof start == 'undefined') {
            start = 0;
        }
        return Array.prototype.slice.apply(refArgs, [start, refArgs.length]);
    },
    objectClone: function (obj, preventName) {
        if ((typeof obj) == 'object') {
            var res = (MUSIC.lang.isArray(obj) || !! obj.sort) ? [] : {};
            for (var i in obj) {
                if (i != preventName) res[i] = objectClone(obj[i], preventName);
            }
            return res;
        } else if ((typeof obj) == 'function') {
            return (new obj()).constructor;
        }
        return obj;
    },
    propertieCopy: function (s, b, propertiSet) {
        if (typeof propertiSet == 'undefined') {
            for (var p in b) {
                s[p] = b[p];
            }
        } else {
            for (var p in propertiSet) {
                s[p] = b[p];
            }
        }
        return s;
    },
    chain: function (u, v) {
        var calls = [];
        for (var ii = 0, len = arguments.length; ii < len; ii++) {
            calls.push(arguments[ii]);
        }
        return (function () {
            for (var ii = 0, len = calls.length; ii < len; ii++) {
                if (calls[ii] && calls[ii].apply(null, arguments) === false) {
                    return false;
                }
            }
            return true;
        });
    }
};
Function.prototype.bind = function () {
    var __method = this,
        args = MUSIC.lang.arg2arr(arguments),
        object = args.shift();
    return function () {
        return __method.apply(object, args.concat(MUSIC.lang.arg2arr(arguments)));
    }
}
Function.prototype.bindAsEventListener = function (object) {
    var __method = this,
        args = MUSIC.lang.arg2arr(arguments),
        object = args.shift();
    return function (event) {
        return __method.apply(object, [(event || window.event)].concat(args).concat(MUSIC.lang.arg2arr(arguments)));
    }
}

MUSIC.dom = {
    getById: function (id) {
        return document.getElementById(id);
    },
    getByName: function (name, tagName) {
        if (!tagName) return document.getElementsByName(name);
        var arr = [];
        var e = document.getElementsByTagName(tagName);
        for (var i = 0; i < e.length; ++i) {
            if ( !! e[i].getAttribute("name") && (e[i].getAttribute("name").toLowerCase() == name.toLowerCase())) {
                arr.push(e[i]);
            }
        }
        return arr;
    },
    get: function (e) {
        return (typeof (e) == "string") ? document.getElementById(e) : e;
    },
    getNode: function (e) {
        return (e && (e.nodeType || e.item)) ? e : document.getElementById(e);
    },
    removeElement: function (elem) {
        if (elem = MUSIC.dom.get(elem)) {
            if (MUSIC.userAgent.ie == 9 && elem.tagName == "SCRIPT") {
                elem.src = "";
            }
            elem.removeNode ? elem.removeNode(true) : (elem.parentNode && elem.parentNode.removeChild(elem));
        }
        return elem = null;
    },
    searchChain: function (elem, prop, func) {
        prop = prop || 'parentNode';
        while (elem) {
            if (!func || func.call(elem, elem)) {
                return elem;
            }
            elem = elem[prop];
        }
        return null;
    },
    searchElementByClassName: function (elem, className) {
        elem = MUSIC.dom.get(elem);
        return MUSIC.dom.searchChain(elem, 'parentNode', function (el) {
            return MUSIC.css.hasClassName(el, className);
        });
    },
    getElementsByClassName: function (className, tag, root) {
        tag = tag || '*';
        root = (root) ? MUSIC.dom.get(root) : null || document;
        if (!root) {
            return [];
        }
        var nodes = [],
            elements = root.getElementsByTagName(tag),
            re = MUSIC.css.getClassRegEx(className);
        for (var i = 0, len = elements.length; i < len; ++i) {
            if (re.test(elements[i].className)) {
                nodes[nodes.length] = elements[i];
            }
        }
        return nodes;
    },
    isAncestor: function (a, b) {
        return a && b && a != b && ((typeof a.contains == "object") ? a.contains(b) : !! (a.compareDocumentPosition(b) & 16));
    },
    getAncestorBy: function (elem, method) {
        elem = MUSIC.dom.get(elem);
        return MUSIC.dom.searchChain(elem.parentNode, 'parentNode', function (el) {
            return el.nodeType == 1 && (!method || method(el));
        });
    },
    getFirstChild: function (elem) {
        elem = MUSIC.dom.get(elem);
        return elem.firstElementChild || MUSIC.dom.searchChain(elem && elem.firstChild, 'nextSibling', function (el) {
            return el.nodeType == 1;
        });
    },
    getLastChild: function (elem) {
        elem = MUSIC.dom.get(elem);
        return elem.lastElementChild || MUSIC.dom.searchChain(elem && elem.lastChild, 'previousSibling', function (el) {
            return el.nodeType == 1;
        });
    },
    getNextSibling: function (elem) {
        elem = MUSIC.dom.get(elem);
        return elem.nextElementSibling || MUSIC.dom.searchChain(elem && elem.nextSibling, 'nextSibling', function (el) {
            return el.nodeType == 1;
        });
    },
    getPreviousSibling: function (elem) {
        elem = MUSIC.dom.get(elem);
        return elem.previousElementSibling || MUSIC.dom.searchChain(elem && elem.previousSibling, 'previousSibling', function (el) {
            return el.nodeType == 1;
        });
    },
    swapNode: function (node1, node2) {
        if (node1.swapNode) {
            node1.swapNode(node2);
        } else {
            var prt = node2.parentNode,
                next = node2.nextSibling;
            if (next == node1) {
                prt.insertBefore(node1, node2);
            } else if (node2 == node1.nextSibling) {
                prt.insertBefore(node2, node1);
            } else {
                node1.parentNode.replaceChild(node2, node1);
                prt.insertBefore(node1, next);
            }
        }
    },
    createElementIn: function (tagName, elem, insertFirst, attrs) {
        var _e = (elem = MUSIC.dom.get(elem) || document.body).ownerDocument.createElement(tagName || "div"),
            k;
        if (attrs) {
            for (k in attrs) {
                if (k == "class") {
                    _e.className = attrs[k];
                } else if (k == "style") {
                    _e.style.cssText = attrs[k];
                } else {
                    _e[k] = attrs[k];
                }
            }
        }
        insertFirst ? elem.insertBefore(_e, elem.firstChild) : elem.appendChild(_e);
        return _e;
    },
    getStyle: function (el, property) {
        el = MUSIC.dom.get(el);
        if (!el || el.nodeType == 9) {
            return null;
        }
        var w3cMode = document.defaultView && document.defaultView.getComputedStyle,
            computed = !w3cMode ? null : document.defaultView.getComputedStyle(el, ''),
            value = "";
        switch (property) {
        case "float":
            property = w3cMode ? "cssFloat" : "styleFloat";
            break;
        case "opacity":
            if (!w3cMode) {
                var val = 100;
                try {
                    val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
                } catch (e) {
                    try {
                        val = el.filters('alpha').opacity;
                    } catch (e) {}
                }
                return val / 100;
            } else {
                return parseFloat((computed || el.style)[property]);
            }
            break;
        case "backgroundPositionX":
            if (w3cMode) {
                property = "backgroundPosition";
                return ((computed || el.style)[property]).split(" ")[0];
            }
            break;
        case "backgroundPositionY":
            if (w3cMode) {
                property = "backgroundPosition";
                return ((computed || el.style)[property]).split(" ")[1];
            }
            break;
        }
        if (w3cMode) {
            return (computed || el.style)[property];
        } else {
            return (el.currentStyle[property] || el.style[property]);
        }
    },
    setStyle: function (el, properties, value) {
        if (!(el = MUSIC.dom.get(el)) || el.nodeType != 1) {
            return false;
        }
        var tmp, bRtn = true,
            w3cMode = (tmp = document.defaultView) && tmp.getComputedStyle,
            rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
        if (typeof (properties) == 'string') {
            tmp = properties;
            properties = {};
            properties[tmp] = value;
        }
        for (var prop in properties) {
            value = properties[prop];
            if (prop == 'float') {
                prop = w3cMode ? "cssFloat" : "styleFloat";
            } else if (prop == 'opacity') {
                if (!w3cMode) {
                    prop = 'filter';
                    value = value >= 1 ? '' : ('alpha(opacity=' + Math.round(value * 100) + ')');
                }
            } else if (prop == 'backgroundPositionX' || prop == 'backgroundPositionY') {
                tmp = prop.slice(-1) == 'X' ? 'Y' : 'X';
                if (w3cMode) {
                    var v = MUSIC.dom.getStyle(el, "backgroundPosition" + tmp);
                    prop = 'backgroundPosition';
                    typeof (value) == 'number' && (value = value + 'px');
                    value = tmp == 'Y' ? (value + " " + (v || "top")) : ((v || 'left') + " " + value);
                }
            }
            if (typeof el.style[prop] != "undefined") {
                el.style[prop] = value + (typeof value === "number" && !rexclude.test(prop) ? 'px' : '');
                bRtn = bRtn && true;
            } else {
                bRtn = bRtn && false;
            }
        }
        return bRtn;
    },
    createNamedElement: function (type, name, doc) {
        var _doc = doc || document,
            element;
        try {
            element = _doc.createElement('<' + type + ' name="' + name + '">');
        } catch (ign) {}
        if (!element) {
            element = _doc.createElement(type);
        }
        if (!element.name) {
            element.name = name;
        }
        return element;
    },
    getRect: function (elem) {
        if (elem = MUSIC.dom.get(elem)) {
            var box = {};
            try {
                box = MUSIC.object.extend({}, elem.getBoundingClientRect());
                if (typeof box.width == 'undefined') {
                    box.width = box.right - box.left;
                    box.height = box.bottom - box.top;
                }
            } catch (e) {
                box = {
                    left: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    bottom: 0,
                    top: 0
                };
            }
            return box;
        }
    },
    getPosition: function (elem) {
        var box, s, doc;
        if (box = MUSIC.dom.getRect(elem)) {
            if (s = MUSIC.dom.getScrollLeft(doc = elem.ownerDocument)) {
                box.left += s, box.right += s;
            }
            if (s = MUSIC.dom.getScrollTop(doc)) {
                box.top += s, box.bottom += s;
            }
            return box;
        }
    },
    setPosition: function (el, pos) {
        MUSIC.dom.setXY(el, pos['left'], pos['top']);
        MUSIC.dom.setSize(el, pos['width'], pos['height']);
    },
    getXY: function (elem, doc) {
        var box = MUSIC.dom.getPosition(elem) || {
            left: 0,
            top: 0
        };
        return [box.left, box.top];
    },
    getSize: function (elem) {
        var box = MUSIC.dom.getPosition(elem) || {
            width: -1,
            height: -1
        };
        return [box.width, box.height];
    },
    setXY: function (elem, x, y) {
        var _ml = parseInt(MUSIC.dom.getStyle(elem, "marginLeft")) || 0,
            _mt = parseInt(MUSIC.dom.getStyle(elem, "marginTop")) || 0;
        MUSIC.dom.setStyle(elem, {
            left: (parseInt(x) || 0) - _ml + "px",
            top: (parseInt(y) || 0) - _mt + "px"
        });
    },
    getScrollLeft: function (doc) {
        var _doc = doc || document;
        return Math.max(_doc.documentElement.scrollLeft, _doc.body.scrollLeft);
    },
    getScrollTop: function (doc) {
        var _doc = doc || document;
        return Math.max(_doc.documentElement.scrollTop, _doc.body.scrollTop);
    },
    getScrollHeight: function (doc) {
        var _doc = doc || document;
        return Math.max(_doc.documentElement.scrollHeight, _doc.body.scrollHeight);
    },
    getScrollWidth: function (doc) {
        var _doc = doc || document;
        return Math.max(_doc.documentElement.scrollWidth, _doc.body.scrollWidth);
    },
    setScrollLeft: function (value, doc) {
        var _doc = doc || document;
        _doc[_doc.compatMode == "CSS1Compat" && !MUSIC.userAgent.webkit ? "documentElement" : "body"].scrollLeft = value;
    },
    setScrollTop: function (value, doc) {
        var _doc = doc || document;
        _doc[_doc.compatMode == "CSS1Compat" && !MUSIC.userAgent.webkit ? "documentElement" : "body"].scrollTop = value;
    },
    getClientHeight: function (doc) {
        var _doc = doc || document;
        return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientHeight : _doc.body.clientHeight;
    },
    getClientWidth: function (doc) {
        var _doc = doc || document;
        return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientWidth : _doc.body.clientWidth;
    },
    _SET_SIZE_RE: /^\d+(?:\.\d*)?(px|%|em|in|cm|mm|pc|pt)?$/,
    setSize: function (el, w, h) {
        el = MUSIC.dom.get(el);
        var _r = MUSIC.dom._SET_SIZE_RE,
            m;
        MUSIC.dom.setStyle(el, "width", (m = _r.exec(w)) ? (m[1] ? w : (parseInt(w, 10) + 'px')) : 'auto');
        MUSIC.dom.setStyle(el, "height", (m = _r.exec(h)) ? (m[1] ? h : (parseInt(h, 10) + 'px')) : 'auto');
    },
    getDocumentWindow: function (doc) {
        var _doc = doc || document;
        return _doc.parentWindow || _doc.defaultView;
    },
    getElementsByTagNameNS: function (node, ns, tgn) {
        node = node || document;
        var res = [];
        if (node.getElementsByTagNameNS) {
            return node.getElementsByTagName(ns + ":" + tgn);
        } else if (node.getElementsByTagName) {
            var n = document.namespaces;
            if (n.length > 0) {
                var l = node.getElementsByTagName(tgn);
                for (var i = 0, len = l.length; i < len; ++i) {
                    if (l[i].scopeName == ns) {
                        res.push(l[i]);
                    }
                }
            }
        }
        return res;
    },
    getElementByTagNameBubble: function (elem, tn) {
        if (!tn) {
            return null;
        }
        var maxLv = 15;
        tn = String(tn).toUpperCase();
        if (tn == 'BODY') {
            return document.body;
        }
        elem = MUSIC.dom.searchChain(elem = MUSIC.dom.get(elem), 'parentNode', function (el) {
            return el.tagName == tn || el.tagName == 'BODY' || (--maxLv) < 0;
        });
        return !elem || maxLv < 0 ? null : elem;
    },
    insertAdjacent: function (elem, where, html, isText) {
        var range, pos = ['beforeBegin', 'afterBegin', 'beforeEnd', 'afterEnd'],
            doc;
        if (MUSIC.lang.isElement(elem) && pos[where] && (MUSIC.lang.isString(html) || MUSIC.lang.isElement(html))) {
            if (elem.insertAdjacentHTML) {
                elem['insertAdjacent' + (typeof (html) == 'object' ? 'Element' : (isText ? 'Text' : 'HTML'))](pos[where], html);
            } else {
                range = (doc = elem.ownerDocument).createRange();
                range[where == 1 || where == 2 ? 'selectNodeContents' : 'selectNode'](elem);
                range.collapse(where < 2);
                range.insertNode(typeof (html) != 'string' ? html : isText ? doc.createTextNode(html) : range.createContextualFragment(html));
            }
            return true;
        }
        return false;
    }
};

MUSIC.util = {
    gLocation: window.location.href,
    buildUri: function (s) {
        return new MUSIC.util.URI(s);
    },
    URI: function (s) {
        if (!(MUSIC.object.getType(s) == "string")) {
            return null;
        }
        if (s.indexOf("://") < 1) {
            s = location.protocol + "//" + location.host + (s.indexOf("/") == 0 ? "" : location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)) + s;
        }
        var depart = s.split("://");
        if (MUSIC.object.getType(depart) == "array" && depart.length > 1 && (/^[a-zA-Z]+$/).test(depart[0])) {
            this.protocol = depart[0].toLowerCase();
            var h = depart[1].split("/");
            if (MUSIC.object.getType(h) == "array") {
                this.host = h[0];
                this.pathname = "/" + h.slice(1).join("/").replace(/(\?|\#).+/i, "");
                this.href = s;
                var se = depart[1].lastIndexOf("?"),
                    ha = depart[1].lastIndexOf("#");
                this.search = (se >= 0) ? depart[1].substring(se + 1) : "";
                this.hash = (ha >= 0) ? depart[1].substring(ha + 1) : "";
                if (this.search.length > 0 && this.hash.length > 0) {
                    if (ha < se) {
                        this.search = "";
                    } else {
                        this.search = depart[1].substring(se, ha);
                    }
                }
                return this;
            } else {
                return null;
            }
        } else {
            return null;
        }
    },
    splitHttpParamString: function (s) {
        return MUSIC.util.commonDictionarySplit(s, "&");
    },
    commonDictionarySplit: function (s, esp, vq, eq) {
        var res = {};
        if (!s || typeof (s) != "string") {
            return res;
        }
        if (typeof (esp) != 'string') {
            esp = "&";
        }
        if (typeof (vq) != 'string') {
            vq = "";
        }
        if (typeof (eq) != 'string') {
            eq = "=";
        }
        var l = s.split(vq + esp),
            len = l.length,
            tmp, t = eq + vq,
            p;
        if (vq) {
            tmp = l[len - 1].split(vq);
            l[len - 1] = tmp.slice(0, tmp.length - 1).join(vq);
        }
        for (var i = 0, len; i < len; i++) {
            if (eq) {
                tmp = l[i].split(t);
                if (tmp.length > 1) {
                    res[tmp[0]] = tmp.slice(1).join(t);
                    continue;
                }
            }
            res[l[i]] = true;
        }
        return res;
    },
    getUrlParams: function () {
        var res = {},
            uri = this.buildUri(this.gLocation);
        MUSIC.object.extend(res, this.splitHttpParamString(uri.hash));
        MUSIC.object.extend(res, this.splitHttpParamString(uri.search));
        return res;
    },
    buildArgs: function (args) {
        var buf = [];
        for (var key in args) {
            var value = args[key];
            if (typeof value == 'string') {
                buf.push(key + '=' + value);
            }
        }
        return buf.join('&');
    },
    updateUrlHash: function (mapValue) {
        var res = {},
            uri = this.buildUri(this.gLocation);
        MUSIC.object.extend(res, this.splitHttpParamString(uri.hash));
        MUSIC.object.extend(res, mapValue || {});
        setTimeout('window.location.hash = "' + this.buildArgs(mapValue).replace(/\"/g, '\\"') + '"', 0);
    },
    formatTime: function (iTime) {
        var sDate = "";
        try {
            iTime = parseInt(iTime) * 1000;
            var oDate = new Date(iTime);
            var oNow = new Date();
            var iDiff = Math.floor(oNow.valueOf() / 86400000) - Math.floor(iTime / 86400000);
            switch (iDiff) {
            case 0:
                sDate = "今天";
                break;
            case 1:
                sDate = "昨天";
                break;
            case 2:
                sDate = "前天";
                break;
            default:
                sDate = (oDate.getMonth() + 1) + "月" + oDate.getDate() + "日";
                break;
            }
            var sHour = "" + oDate.getHours();
            sHour = sHour.length == 1 ? ("0" + sHour) : sHour;
            var sMin = "" + oDate.getMinutes();
            sMin = sMin.length == 1 ? ("0" + sMin) : sMin;
            sDate += " " + sHour + ":" + sMin;
            return sDate;
        } catch (e) {
            sDate = "";
        }
    }
};

MUSIC.css = {
    classNameCache: {},
    getClassRegEx: function (className) {
        var o = MUSIC.css.classNameCache;
        return o[className] || (o[className] = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)'));
    },
    convertHexColor: function (color) {
        color = String(color || '');
        color.charAt(0) == '#' && (color = color.substring(1));
        color.length == 3 && (color = color.replace(/([0-9a-f])/ig, '$1$1'));
        return color.length == 6 ? [parseInt(color.substr(0, 2), 16), parseInt(color.substr(2, 2), 16), parseInt(color.substr(4, 2), 16)] : [0, 0, 0];
    },
    styleSheets: {},
    getStyleSheetById: function (id) {
        var s;
        return (s = MUSIC.dom.get(id)) && s.sheet || (s = document.styleSheets) && s[id];
    },
    getRulesBySheet: function (sheetId) {
        var ss = typeof (sheetId) == "object" ? sheetId : MUSIC.css.getStyleSheetById(sheetId),
            rs = {},
            head, base;
        if (ss && !(rs = ss.cssRules || ss.rules)) {
            if (head = document.getElementsByTagName('head')[0]) {
                if (base = head.getElementsByTagName('base')[0]) {
                    MUSIC.dom.removeElement(base);
                    rs = ss.cssRules;
                    head.appendChild(base);
                }
            }
        }
        return rs;
    },
    getRuleBySelector: function (sheetId, selector) {
        var _ss = this.getStyleSheetById(sheetId);
        if (!_ss.cacheSelector) {
            _ss.cacheSelector = {}
        };
        if (_ss) {
            var _rs = _ss.cssRules || _ss.rules;
            var re = new RegExp('^' + selector + '$', "i");
            var _cs = _ss.cacheSelector[selector];
            if (_cs && re.test(_rs[_cs].selectorText)) {
                return _rs[_cs];
            } else {
                for (var i = 0; i < _rs.length; i++) {
                    if (re.test(_rs[i].selectorText)) {
                        _ss.cacheSelector[selector] = i;
                        return _rs[i];
                    }
                }
                return null;
            }
        } else {
            return null;
        }
    },
    insertCSSLink: function (url, opts, callback) {
        var sid, doc, t, cssLink, head;
        if (typeof opts == "string") {
            sid = opts;
        }
        opts = typeof opts == "object" ? opts : {};
        sid = opts.linkID || sid;
        doc = opts.doc || document;
        head = doc.getElementsByTagName("head")[0];
        cssLink = ((t = doc.getElementById(sid)) && (t.nodeName == "LINK")) ? t : null;
        if (!cssLink) {
            cssLink = doc.createElement("link");
            sid && (cssLink.id = sid);
            cssLink.rel = cssLink.rev = "stylesheet";
            cssLink.type = "text/css";
            cssLink.media = opts.media || "screen";
            head.appendChild(cssLink);
        }
        cssLink.onload = function () {
            if (callback) {
                callback();
            }
        }
        setTimeout(function () {
            url && (cssLink.href = url);
        }, 0);
        return (MUSIC.userAgent.ie != 9 && cssLink.sheet) || cssLink;
    },
    insertStyleSheet: function (sheetId, rules) {
        var node = document.createElement("style");
        node.type = 'text/css';
        sheetId && (node.id = sheetId);
        document.getElementsByTagName("head")[0].appendChild(node);
        if (rules) {
            if (node.styleSheet) {
                node.styleSheet.cssText = rules;
            } else {
                node.appendChild(document.createTextNode(rules));
            }
        }
        return node.sheet || node;
    },
    removeStyleSheet: function (id) {
        var _ss = MUSIC.css.getStyleSheetById(id);
        _ss && MUSIC.dom.removeElement(_ss.owningElement || _ss.ownerNode);
    },
    updateClassName: function (elem, removeNames, addNames) {
        if (!elem || elem.nodeType != 1) {
            return "";
        }
        var oriName = elem.className,
            ar, b;
        if (removeNames && typeof (removeNames) == 'string' || addNames && typeof (addNames) == 'string') {
            if (removeNames == '*') {
                oriName = '';
            } else {
                ar = oriName.split(' ');
                var i = 0,
                    l = ar.length,
                    n;
                oriName = {};
                for (; i < l; ++i) {
                    ar[i] && (oriName[ar[i]] = true);
                }
                if (addNames) {
                    ar = addNames.split(' ');
                    l = ar.length;
                    for (i = 0; i < l; ++i) {
                        (n = ar[i]) && !oriName[n] && (b = oriName[n] = true);
                    }
                }
                if (removeNames) {
                    ar = removeNames.split(' ');
                    l = ar.length;
                    for (i = 0; i < l; i++) {
                        (n = ar[i]) && oriName[n] && (b = true) && delete oriName[n];
                    }
                }
            }
            if (b) {
                ar.length = 0;
                for (var k in oriName) {
                    ar.push(k);
                }
                oriName = ar.join(' ');
                elem.className = oriName;
            }
        }
        return oriName;
    },
    hasClassName: function (elem, name) {
        return elem && (elem = elem.className) && name && ((' ' + elem + ' ').indexOf(' ' + name + ' ') + 1);
    },
    addClassName: function (elem, names) {
        return MUSIC.css.updateClassName(elem, null, names);
    },
    removeClassName: function (elem, names) {
        return MUSIC.css.updateClassName(elem, names);
    },
    replaceClassName: function (elems, a, b) {
        MUSIC.css.swapClassName(elems, a, b, true);
    },
    swapClassName: function (elems, a, b, _isRep) {
        if (elems && typeof (elems) == "object") {
            if (elems.length === undefined) {
                elems = [elems];
            }
            for (var elem, i = 0, l = elems.length; i < l; ++i) {
                if ((elem = elems[i]) && elem.nodeType == 1) {
                    if (MUSIC.css.hasClassName(elem, a)) {
                        MUSIC.css.updateClassName(elem, a, b);
                    } else if (!_isRep && MUSIC.css.hasClassName(elem, b)) {
                        MUSIC.css.updateClassName(elem, b, a);
                    }
                }
            }
        }
    },
    toggleClassName: function (elem, name) {
        if (!elem || elem.nodeType != 1) {
            return;
        }
        if (MUSIC.css.hasClassName(elem, name)) {
            MUSIC.css.updateClassName(elem, name);
        } else {
            MUSIC.css.updateClassName(elem, null, name);
        }
    }
};

MUSIC.debug = {
    errorLogs: [],
    startDebug: function () {
        window.onerror = function (msg, url, line) {
            var urls = (url || "").replace(/\\/g, "/").split("/");
            MUSIC.console.print(msg + "<br/>" + urls[urls.length - 1] + " (line:" + line + ")", 1);
            MUSIC.debug.errorLogs.push(msg);
            return false;
        }
    },
    stopDebug: function () {
        window.onerror = null;
    },
    clearErrorLog: function () {
        this.errorLogs = [];
    },
    showLog: function () {
        var o = ENV.get("debug_out");
        if ( !! o) {
            o.innerHTML = MUSIC.string.nl2br(MUSIC.string.escHTML(this.errorLogs.join("\n")));
        }
    },
    getLogString: function () {
        return (this.errorLogs.join("\n"));
    }
};
MUSIC.runTime = (function () {
    function isDebugMode() {
        return (MUSIC.config.debugLevel > 1);
    }

    function log(msg, type) {
        var info;
        if (isDebugMode()) {
            info = msg + '\n=STACK=\n' + stack();
        } else {
            if (type == 'error') {
                info = msg;
            } else if (type == 'warn') {}
        }
        MUSIC.debug.errorLogs.push(info);
    }

    function warn(sf, args) {
        log(MUSIC.string.write.apply(MUSIC.string, arguments), 'warn');
    }

    function error(sf, args) {
        log(MUSIC.string.write.apply(MUSIC.string, arguments), 'error');
    }

    function stack(e, a) {
        function genTrace(ee, aa) {
            if (ee.stack) {
                return ee.stack;
            } else if (ee.message.indexOf("\nBacktrace:\n") >= 0) {
                var cnt = 0;
                return ee.message.split("\nBacktrace:\n")[1].replace(/\s*\n\s*/g, function () {
                    cnt++;
                    return (cnt % 2 == 0) ? "\n" : " @ ";
                });
            } else {
                var entry = (aa.callee == stack) ? aa.callee.caller : aa.callee;
                var eas = entry.arguments;
                var r = [];
                for (var i = 0, len = eas.length; i < len; i++) {
                    r.push((typeof eas[i] == 'undefined') ? ("<u>") : ((eas[i] === null) ? ("<n>") : (eas[i])));
                }
                var fnp = /function\s+([^\s\(]+)\(/;
                var fname = fnp.test(entry.toString()) ? (fnp.exec(entry.toString())[1]) : ("<ANON>");
                return (fname + "(" + r.join() + ");").replace(/\n/g, "");
            }
        }
        var res;
        if ((e instanceof Error) && (typeof arguments == 'object') && ( !! arguments.callee)) {
            res = genTrace(e, a);
        } else {
            try {
                ({}).sds();
            } catch (err) {
                res = genTrace(err, arguments);
            }
        }
        return res.replace(/\n/g, " <= ");
    }
    return {
        stack: stack,
        warn: warn,
        error: error,
        isDebugMode: isDebugMode
    };
})();

MUSIC.enviroment = (function () {
    var _p = {},
        hookPool = {};

    function envGet(kname) {
        return _p[kname];
    }

    function envDel(kname) {
        delete _p[kname];
        return true;
    }

    function envSet(kname, value) {
        if (typeof value == 'undefined') {
            if (typeof kname == 'undefined') {
                return false;
            } else if (!(_p[kname] === undefined)) {
                return false;
            }
        } else {
            _p[kname] = value;
            return true;
        }
    }
    return {
        get: envGet,
        set: envSet,
        del: envDel,
        hookPool: hookPool
    };
})();
var ENV = MUSIC.enviroment;
MUSIC.pageEvents = (function () {
    function _ihp() {
        var qs = location.search.substring(1),
            qh = location.hash.substring(1),
            s, h, n;
        ENV.set("_queryString", qs);
        ENV.set("_queryHash", qh);
        ENV.set("queryString", s = MUSIC.util.splitHttpParamString(qs));
        ENV.set("queryHash", h = MUSIC.util.splitHttpParamString(qh));
        if (s && s.DEBUG) {
            n = parseInt(s.DEBUG, 10);
            if (!isNaN(n)) {
                MUSIC.config.debugLevel = n;
            }
        }
    }

    function _bootStrap() {
        if (document.addEventListener) {
            if (MUSIC.userAgent.safari < 4) {
                var interval = setInterval(function () {
                    if ((/loaded|complete/).test(document.readyState)) {
                        _onloadHook();
                        clearInterval(interval);
                    }
                }, 50);
            } else {
                document.addEventListener("DOMContentLoaded", _onloadHook, true);
            }
        } else {
            var src = 'javascript:void(0)';
            if (window.location.protocol == 'https:') {
                src = '//:';
            }
            document.write('<script onreadystatechange="if(this.readyState==\'complete\'){this.parentNode.removeChild(this);MUSIC.pageEvents._onloadHook();}" defer="defer" src="' + src + '"><\/script\>');
        }
        window.onload = MUSIC.lang.chain(window.onload, function () {
            _onloadHook();
            _runHooks('onafterloadhooks');
        });
        window.onbeforeunload = function () {
            return _runHooks('onbeforeunloadhooks');
        };
        window.onunload = MUSIC.lang.chain(window.onunload, function () {
            _runHooks('onunloadhooks');
        });
    }

    function _onloadHook() {
        _runHooks('onloadhooks');
        MUSIC.enviroment.loaded = true;
    }

    function _runHook(handler) {
        try {
            handler();
        } catch (ex) {}
    }

    function _runHooks(hooks) {
        var isbeforeunload = (hooks == 'onbeforeunloadhooks'),
            warn = null,
            hc = window.ENV.hookPool;
        do {
            var h = hc[hooks];
            if (!isbeforeunload) {
                hc[hooks] = null;
            }
            if (!h) {
                break;
            }
            for (var ii = 0; ii < h.length; ii++) {
                if (isbeforeunload) {
                    warn = warn || h[ii]();
                } else {
                    h[ii]();
                }
            }
            if (isbeforeunload) {
                break;
            }
        } while (hc[hooks]);
        if (isbeforeunload) {
            if (warn) {
                return warn;
            } else {
                MUSIC.enviroment.loaded = false;
            }
        }
    }

    function _addHook(hooks, handler) {
        var c = window.ENV.hookPool;
        (c[hooks] ? c[hooks] : (c[hooks] = [])).push(handler);
    }

    function _insertHook(hooks, handler, position) {
        var c = window.ENV.hookPool;
        if (typeof (position) == 'number' && position >= 0) {
            if (!c[hooks]) {
                c[hooks] = [];
            }
            c[hooks].splice(position, 0, handler);
        } else {
            return false;
        }
    }

    function _lr(handler) {
        MUSIC.enviroment.loaded ? _runHook(handler) : _addHook('onloadhooks', handler);
    }

    function _bulr(handler) {
        _addHook('onbeforeunloadhooks', handler);
    }

    function _ulr(handler) {
        _addHook('onunloadhooks', handler);
    }

    function pinit() {
        _bootStrap();
        _ihp();
        var _dt;
        if (_dt = document.getElementById("__DEBUG_out")) {
            ENV.set("dout", _dt);
        }
        var __dalert;
        if (!ENV.get("alertConverted")) {
            __dalert = alert;
            eval('var alert=function(msg){if(msg!=undefined){__dalert(msg);return msg;}}');
            ENV.set("alertConverted", true);
        }
        var t = ENV.get("queryHash");
        if (t && t.DEBUG) {
            MUSIC.config.debugLevel = 2;
        }
    }
    return {
        onloadRegister: _lr,
        onbeforeunloadRegister: _bulr,
        onunloadRegister: _ulr,
        initHttpParams: _ihp,
        bootstrapEventHandlers: _bootStrap,
        _onloadHook: _onloadHook,
        insertHooktoHooksQueue: _insertHook,
        pageBaseInit: pinit
    };
})();

MUSIC.object.extend(MUSIC.console, {
    _inited: false,
    _html: '<h5 id="log_head" class="qzfl_log_head"><button id="log_close">x</button>console</h5><ul id="log_list"></ul><div class="qzfl_log_foot"><div class="log_console">&gt;<input id="log_console"/></div></div>',
    _opened: false,
    TYPE: {
        DEBUG: 0,
        ERROR: 1,
        WARNING: 2,
        INFO: 3,
        PROFILE: 4
    },
    _typeInfo: [
        ["qzfl_log_debug", "√"],
        ["qzfl_log_error", "!"],
        ["qzfl_log_warning", "-"],
        ["qzfl_log_info", "i"],
        ["qzfl_log_profile", "└"]
    ],
    show: function () {
        if (!this._inited) {
            this._init();
        }
        this._main.style.display = "block";
        this._opened = true;
    },
    hide: function () {
        MUSIC.console._main.style.display = "none";
        MUSIC.console._opened = false;
    },
    _init: function () {
        this._main = MUSIC.dom.createElementIn("div", document.body);
        this._main.className = "qzfl_log";
        this._main.innerHTML = this._html;
        this._input = MUSIC.dom.get("log_console");
        this._button = MUSIC.dom.get("log_close");
        this._list = MUSIC.dom.get("log_list");
        MUSIC.css.insertCSSLink("http://imgcache.qq.com/qzone/qzfl/console.css");
        if (MUSIC.dragdrop) {
            MUSIC.dragdrop.registerDragdropHandler(MUSIC.dom.get("log_head"), this._main);
        }
        MUSIC.event.addEvent(this._input, "keypress", this._execScript);
        MUSIC.event.addEvent(this._button, "click", this.hide);
        this._inited = true;
    },
    print: function (msg, type) {
        if (!this._opened) {
            this.show();
        }
        var _item = MUSIC.dom.createElementIn("li", MUSIC.console._list);
        var _ti = MUSIC.console._typeInfo[type] || MUSIC.console._typeInfo[0];
        _item.className = _ti[0];
        _item.innerHTML = '<span class="log_icon">' + _ti[1] + '</span>' + msg;
        this._list.scrollTop = this._list.scrollHeight;
    },
    clear: function () {
        MUSIC.console._list.innerHTML = "";
    },
    _showHashmap: function (object) {
        var descString = [];
        var n = 20;
        for (var value in object) {
            try {
                descString.push(value + " ==> " + object[value]);
            } catch (exception) {
                descString.push(value + " =!> " + exception.message);
            }
            if (!n--) {
                alert(descString.join("\n"));
                descString = [];
                n = 20;
            }
        }
        if (descString.length > 0) {
            alert(descString.join("\n"));
        } else {
            alert(object);
        }
    },
    _execScript: function (e) {
        e = MUSIC.event.getEvent(e);
        if (e.keyCode != "13") {
            return;
        }
        switch (MUSIC.console._input.value) {
        case "help":
            var _rv = "Console Help<br/>help - console help<br/>clear - clear console list.<br/>hide - hide console"
            MUSIC.console.print(_rv, 3);
            break;
        case "clear":
            MUSIC.console.clear();
            break;
        case "hide":
            MUSIC.console.hide();
            break;
        default:
            var _rv = '<span style="color:#CCFF00">' + MUSIC.console._input.value + '</span><br/>';
            try {
                _rv += (eval(MUSIC.console._input.value) || "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")
                MUSIC.console.print(_rv, 0);
            } catch (ex) {
                _rv += ex.description;
                MUSIC.console.print(_rv, 1);
            }
        }
        MUSIC.console._input.value = "";
    }
});

MUSIC.cookie = {
    set: function (name, value, domain, path, hour) {
        if (hour) {
            var expire = new Date();
            expire.setTime(expire.getTime() + 3600000 * hour);
        }
        document.cookie = name + "=" + escape(value) + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + MUSIC.config.DCCookieDomain + ";"));
        return true;
    },
    get: function (name) {
        var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
            m = document.cookie.match(r);
        return (!m ? "" : unescape(m[1]));
    },
    del: function (name, domain, path) {
        document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + MUSIC.config.DCCookieDomain + ";"));
    }
};
MUSIC.CookieSet = function () {
    var args = Array.prototype.slice.apply(arguments);
    var _key = '';
    var _uin = MUSIC.widget.user.getUin();
    return {
        delimeter: ',',
        basekey: '',
        check_func: null,
        need_attrs: [],
        key_need_uin: false,
        value_need_uin: true,
        key: function () {
            if (_key) return _key;
            if (!this.basekey) {
                return null;
            }
            var key = this.basekey;
            if (this.key_need_uin) {
                if (_uin <= 10000) {
                    return null;
                }
                key += uin;
            }
            _key = key;
            return key;
        },
        get: function () {
            var key = this.key();
            if (!key) {
                return null;
            }
            var cookie = getCookie(key);
            var parts = cookie.split(this.delimeter);
            var need_length = args.length + (this.value_need_uin ? 1 : 0);
            if (parts.length != need_length) {
                this.clear();
                return null;
            }
            if (this.value_need_uin) {
                if (parseInt(parts[0]) != _uin) {
                    this.clear();
                    return null;
                }
                parts.splice(0, 1);
            }
            var data = {};
            MUSIC.object.each(args, function (arg, idx) {
                var value = parts[idx];
                data[arg] = value;
            });
            if (typeof this.check_func == 'function') {
                if (!this.check_func(data)) {
                    this.clear();
                    return null;
                }
            }
            return data;
        },
        set: function (data) {
            var key = this.key();
            if (!key) {
                return false;
            }
            if (typeof this.check_func == 'function') {
                if (!this.check_func(data)) {
                    return false;
                }
            }
            var parts = [];
            if (this.value_need_uin) {
                parts.push(_uin);
            }
            MUSIC.object.each(args, function (arg) {
                var value = "" + data[arg];
                if (value.constructor != Function) {
                    parts.push(value.replace(/,/g, "%2c"));
                }
            });
            setCookie(key, parts.join(this.delimeter));
            return true;
        },
        clear: function () {
            var key = this.key();
            if (!key) {
                return false;
            }
            delCookie(key);
            return true;
        }
    };
}
var getCookie = MUSIC.cookie.get;
var setCookie = MUSIC.cookie.set;
var delCookie = MUSIC.cookie.del;

(function (qdc) {
    var dataPool = {};
    qdc.get = qdc.load = function (key) {
        return dataPool[key];
    };
    qdc.del = function (key) {
        dataPool[key] = null;
        delete dataPool[key];
        return true;
    };
    qdc.save = function saveData(key, value) {
        dataPool[key] = value;
        return true;
    };
})(MUSIC.dataCenter = {});

MUSIC.XHR = function (actionURL, cname, method, data, isAsync, nocache) {
    if (!cname) {
        cname = "_xhrInstence_" + (MUSIC.XHR.counter + 1);
    }
    var prot;
    if (MUSIC.XHR.instance[cname] instanceof MUSIC.XHR) {
        prot = MUSIC.XHR.instance[cname];
    } else {
        prot = (MUSIC.XHR.instance[cname] = this);
        MUSIC.XHR.counter++;
    }
    prot._name = cname;
    prot._nc = !! nocache;
    prot._method = (MUSIC.object.getType(method) != "string" || method.toUpperCase() != "GET") ? "POST" : (method = "GET");
    prot._isAsync = (!(isAsync === false)) ? true : isAsync;
    prot._uri = actionURL;
    prot._data = (MUSIC.object.getType(data) == "object" || MUSIC.object.getType(data) == 'string') ? data : {};
    prot._sender = null;
    prot._isHeaderSetted = false;
    this.onSuccess = MUSIC.emptyFn;
    this.onError = MUSIC.emptyFn;
    this.charset = "gb2312";
    this.proxyPath = "";
    return prot;
};
MUSIC.XHR.instance = {};
MUSIC.XHR.counter = 0;
MUSIC.XHR._errCodeMap = {
    400: {
        msg: 'Bad Request'
    },
    401: {
        msg: 'Unauthorized'
    },
    403: {
        msg: 'Forbidden'
    },
    404: {
        msg: 'Not Found'
    },
    999: {
        msg: 'Proxy page error'
    },
    1000: {
        msg: 'Bad Response'
    },
    1001: {
        msg: 'No Network'
    },
    1002: {
        msg: 'No Data'
    },
    1003: {
        msg: 'Eval Error'
    }
};
MUSIC.XHR.xsend = function (o, uri) {
    if (!(o instanceof MUSIC.XHR)) {
        return false;
    }
    if (MUSIC.userAgent.firefox && MUSIC.userAgent.firefox < 3) {
        return false;
    }

    function clear(obj) {
        try {
            obj._sender = obj._sender.callback = obj._sender.errorCallback = obj._sender.onreadystatechange = null;
        } catch (ignore) {}
        if (MUSIC.userAgent.safari || MUSIC.userAgent.opera) {
            setTimeout('MUSIC.dom.removeElement("_xsend_frm_' + obj._name + '")', 50);
        } else {
            MUSIC.dom.removeElement("_xsend_frm_" + obj._name);
        }
    }
    if (o._sender === null || o._sender === void(0)) {
        var sender = document.createElement("iframe");
        sender.id = "_xsend_frm_" + o._name;
        sender.style.width = sender.style.height = sender.style.borderWidth = "0";
        document.body.appendChild(sender);
        sender.callback = MUSIC.event.bind(o, function (data) {
            o.onSuccess(data);
            clear(o);
        });
        sender.errorCallback = MUSIC.event.bind(o, function (num) {
            o.onError(MUSIC.XHR._errCodeMap[num]);
            clear(o);
        });
        o._sender = sender;
    }
    var tmp = MUSIC.config.gbEncoderPath;
    o.GBEncoderPath = tmp ? tmp : "";
    o._sender.src = uri.protocol + "://" + uri.host + (this.proxyPath ? this.proxyPath : "/xhr_proxy_gbk.html");
    return true;
};
MUSIC.XHR.genHttpParamString = function (o, cs) {
    cs = (cs || "gb2312").toLowerCase();
    var r = [];
    for (var i in o) {
        r.push(i + "=" + ((cs == "utf-8") ? encodeURIComponent(o[i]) : MUSIC.string.URIencode(o[i])));
    }
    return r.join("&");
};
MUSIC.XHR.prototype.send = function () {
    if (this._method == 'POST' && this._data == null) {
        return false;
    }
    var u = new MUSIC.util.URI(this._uri);
    if (u == null) {
        return false;
    }
    this._uri = u.href;
    if (MUSIC.object.getType(this._data) == "object") {
        this._data = MUSIC.XHR.genHttpParamString(this._data, this.charset);
    }
    if (this._method == 'GET' && this._data) {
        this._uri += (this._uri.indexOf("?") < 0 ? "?" : "&") + this._data;
    }
    if (u.host != location.host) {
        return MUSIC.XHR.xsend(this, u);
    }
    if (!this._sender) {
        var sender;
        if (window.XMLHttpRequest) {
            sender = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                !(sender = new ActiveXObject("Msxml2.XMLHTTP")) && (sender = new ActiveXObject("Microsoft.XMLHTTP"));
            } catch (ign) {}
        }
        if (!sender) {
            return false;
        }
        this._sender = sender;
    }
    try {
        this._sender.open(this._method, this._uri, this._isAsync);
    } catch (err) {
        return false;
    }
    if (this._method == 'POST' && !this._isHeaderSetted) {
        this._sender.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        this._isHeaderSetted = true;
    }
    if (this._nc) {
        this._sender.setRequestHeader('If-Modified-Since', 'Thu, 1 Jan 1970 00:00:00 GMT');
        this._sender.setRequestHeader('Cache-Control', 'no-cache');
    }
    this._sender.onreadystatechange = MUSIC.event.bind(this, function () {
        try {
            if (this._sender.readyState == 4) {
                if (this._sender.status >= 200 && this._sender.status < 300) {
                    this.onSuccess({
                        text: this._sender.responseText,
                        xmlDom: this._sender.responseXML
                    });
                } else {
                    if (MUSIC.userAgent.safari && (MUSIC.object.getType(this._sender.status) == 'undefined')) {
                        this.onError(MUSIC.XHR._errCodeMap[1002]);
                    } else {
                        this.onError(MUSIC.XHR._errCodeMap[this._sender.status]);
                    }
                }
                delete this._sender;
                this._sender = null;
            }
        } catch (err) {}
    });
    this._sender.send((this._method == 'POST' ? this._data : void(0)));
    return true;
};
MUSIC.XHR.prototype.destroy = function () {
    var n = this._name;
    delete MUSIC.XHR.instance[n]._sender;
    MUSIC.XHR.instance[n]._sender = null;
    delete MUSIC.XHR.instance[n];
    MUSIC.XHR.counter--;
    return null;
};

MUSIC.media = {
    _flashVersion: null,
    adjustImageSize: function (objImage, url, maxwidth, maxheight, callback) {
        var image = new Image();
        image.onload = (function (mainImg, tempImg, mw, mh) {
            return function () {
                tempImg.onload = null;
                var _w = tempImg.width,
                    _h = tempImg.height;
                if (_w > mw || _h > mh) {
                    var _tmp = Math.min(mw * _h, mh * _w);
                    mainImg.style.width = parseInt(_tmp / _h);
                    mainImg.style.height = parseInt(_tmp / _w);
                } else {
                    mainImg.style.width = "";
                    mainImg.style.height = "";
                }
                mainImg.src = tempImg.src;
                if (typeof (callback) == 'function') {
                    callback(mainImg, mw, mh, tempImg, _w, _h);
                }
                try {
                    g_musicMain.resizePage();
                } catch (e) {}
            }
        })(objImage, image, maxwidth, maxheight);
        image.src = url;
    },
    getFlashHtml: function (flashArguments, requiredVersion, flashPlayerCID) {
        var _attrs = new StringBuilder();
        var _params = new StringBuilder();
        if (typeof (flashPlayerCID) == 'undefined') {
            flashPlayerCID = 'D27CDB6E-AE6D-11cf-96B8-444553540000';
        }
        for (var k in flashArguments) {
            switch (k) {
            case "movie":
                continue;
                break;
            case "id":
            case "name":
            case "width":
            case "height":
            case "style":
                _attrs.append(k + "='" + flashArguments[k] + "' ");
                break;
            default:
                _params.append("<param name='" + ((k == "src") ? "movie" : k) + "' value='" + flashArguments[k] + "' />");
                _attrs.append(k + "='" + flashArguments[k] + "' ");
            }
        }
        if (requiredVersion && (requiredVersion instanceof MUSIC.media.SWFVersion)) {
            if (requiredVersion.major == 9 && requiredVersion.rev == 16) {
                (function () {
                    __flash_unloadHandler = MUSIC.emptyFn;
                    __flash_savedUnloadHandler = MUSIC.emptyFn;
                })();
            }
        } else {
            requiredVersion = new MUSIC.media.SWFVersion(8, 0);
        }
        _attrs.append("codeBase='http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab#version=" + requiredVersion + "' ");
        if (ua.ie) {
            return "<object classid='clsid:" + flashPlayerCID + "' " + _attrs + ">" + _params + "</object>";
        } else {
            return "<embed " + _attrs + " pluginspage='http://www.macromedia.com/go/getflashplayer' type='application/x-shockwave-flash'></embed>";
        }
    },
    getWMMHtml: function (wmpArguments, cid) {
        var params = new StringBuilder();
        var objArgm = new StringBuilder();
        if (typeof (cid) == 'undefined') {
            cid = "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6";
        }
        for (var k in wmpArguments) {
            switch (k) {
            case "id":
            case "width":
            case "height":
            case "style":
                objArgm.append(k + '="' + wmpArguments[k] + '" ');
                break;
            case "src":
                objArgm.append(k + '="' + wmpArguments[k] + '" ');
                break;
            default:
                objArgm.append(k + '="' + wmpArguments[k] + '" ');
                params.append('<param name="' + k + '" value="' + wmpArguments[k] + '" />');
            }
        }
        if (wmpArguments["src"]) {
            params.append('<param name="URL" value="' + wmpArguments["src"] + '" />');
        }
        if (ua.ie) {
            return '<object classid="' + cid + '" ' + objArgm + '>' + params + '</object>';
        } else {
            return '<embed ' + objArgm + '></embed>';
        }
    }
}
MUSIC.media.SWFVersion = function () {
    var a;
    if (arguments.length > 1) {
        a = arg2arr(arguments);
    } else if (arguments.length == 1) {
        if (typeof (arguments[0]) == "object") {
            a = arguments[0];
        } else if (typeof arguments[0] == 'number') {
            a = [arguments[0]];
        } else {
            a = [];
        }
    } else {
        a = [];
    }
    this.major = parseInt(a[0], 10) || 0;
    this.minor = parseInt(a[1], 10) || 0;
    this.rev = parseInt(a[2], 10) || 0;
    this.add = parseInt(a[3], 10) || 0;
}
MUSIC.media.SWFVersion.prototype.toString = function (spliter) {
    return ([this.major, this.minor, this.rev, this.add]).join((typeof spliter == 'undefined') ? "," : spliter);
};
MUSIC.media.SWFVersion.prototype.toNumber = function () {
    var se = 0.001;
    return this.major + this.minor * se + this.rev * se * se + this.add * se * se * se;
};
MUSIC.media.getFlashVersion = function () {
    if (!MUSIC.media._flashVersion) {
        var resv = 0;
        if (navigator.plugins && navigator.mimeTypes.length) {
            var x = navigator.plugins['Shockwave Flash'];
            if (x && x.description) {
                resv = x.description.replace(/(?:[a-z]|[A-Z]|\s)+/, "").replace(/(?:\s+r|\s+b[0-9]+)/, ".").split(".");
            }
        } else {
            try {
                for (var i = (resv = 6), axo = new Object(); axo != null; ++i) {
                    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
                    resv = i;
                }
            } catch (e) {
                resv = Math.max(resv - 1, 0);
            }
            try {
                resv = new MUSIC.media.SWFVersion(axo.GetVariable("$version").split(" ")[1].split(","));
            } catch (ignore) {}
        }
        if (!(resv instanceof MUSIC.media.SWFVersion)) {
            resv = new MUSIC.media.SWFVersion(resv);
        }
        if (resv.major < 3) {
            resv.major = 0;
        }
        MUSIC.media._flashVersion = resv;
    }
    return MUSIC.media._flashVersion;
};
var insertFlash = MUSIC.media.getFlashHtml;

MUSIC.FormSender = function (actionURL, method, data, charset) {
    this.name = "_fpInstence_" + MUSIC.FormSender.counter;
    MUSIC.FormSender.instance[this.name] = this;
    MUSIC.FormSender.counter++;
    this.method = method || "POST";
    this.uri = actionURL;
    this.data = (typeof (data) == "object" || typeof (data) == 'string') ? data : null;
    this.proxyURL = (typeof (charset) == 'string' && charset.toUpperCase() == "UTF-8") ? MUSIC.config.FSHelperPage.replace(/_gbk/, "_utf8") : MUSIC.config.FSHelperPage;
    this._sender = null;
    this.onSuccess = MUSIC.emptyFn;
    this.onError = MUSIC.emptyFn;
};
MUSIC.FormSender.instance = {};
MUSIC.FormSender.counter = 0;
MUSIC.FormSender._errCodeMap = {
    999: {
        msg: 'Connection or Server error'
    }
};
MUSIC.FormSender.pluginsPool = {
    "formHandler": []
};
MUSIC.FormSender._pluginsRunner = function (pType, data) {
    var _s = MUSIC.FormSender,
        l = _s.pluginsPool[pType],
        t = data,
        len;
    if (l && (len = l.length)) {
        for (var i = 0; i < len; ++i) {
            if (typeof (l[i]) == "function") {
                t = l[i](t);
            }
        }
    }
    return t;
};
MUSIC.FormSender.prototype.send = function () {
    if (this.method == 'POST' && this.data == null) {
        return false;
    }
    //document.domain = "qq.com";

    function clear(o) {
        o._sender = o._sender.callback = o._sender.errorCallback = o._sender.onreadystatechange = null;
        if (MUSIC.userAgent.safari || MUSIC.userAgent.opera) {
            setTimeout('MUSIC.dom.removeElement(document.getElementById("_fp_frm_' + o.name + '"))', 50);
        } else {
            MUSIC.dom.removeElement(document.getElementById("_fp_frm_" + o.name));
        }
    }
    if (this._sender === null || this._sender === void(0)) {
        var sender = document.createElement("iframe");
        sender.id = "_fp_frm_" + this.name;
        sender.style.cssText = "width:0;height:0;border-width:0;display:none;";
        document.body.appendChild(sender);
        sender.callback = MUSIC.event.bind(this, function (o) {
            clearTimeout(timer);
            this.onSuccess(o);
            clear(this);
        });
        sender.errorCallback = MUSIC.event.bind(this, function (o) {
            clearTimeout(timer);
            this.onError(o);
            clear(this);
        });
        if (typeof (sender.onreadystatechange) != 'undefined') {
            sender.onreadystatechange = MUSIC.event.bind(this, function () {
                if (this._sender.readyState == 'complete' && this._sender.submited) {
                    clear(this);
                    this.onError(MUSIC.FormSender._errCodeMap[999]);
                }
            });
        } else {
            var timer = setTimeout(MUSIC.event.bind(this, function () {
                try {
                    var _t = this._sender.contentWindow.location.href;
                    if (_t.indexOf(this.uri) == 0) {
                        clearTimeout(timer);
                        clear(this);
                        this.onError(MUSIC.FormSender._errCodeMap[999]);
                    }
                } catch (err) {
                    clearTimeout(timer);
                    clear(this);
                    this.onError(MUSIC.FormSender._errCodeMap[999]);
                }
            }), 200);
        }
        this._sender = sender;
    }
    this._sender.src = this.proxyURL;
    return true;
};
MUSIC.FormSender.prototype.destroy = function () {
    var n = this.name;
    delete MUSIC.FormSender.instance[n]._sender;
    MUSIC.FormSender.instance[n]._sender = null;
    delete MUSIC.FormSender.instance[n];
    MUSIC.FormSender.counter--;
    return null;
};

MUSIC.JsLoader = function (isDebug) {
    this.debug = isDebug || (MUSIC.config.debugLevel > 1);
    this.onload = MUSIC.emptyFn;
    this.onerror = MUSIC.emptyFn;
};
MUSIC.JsLoader.prototype.load = function (src, doc, opt) {
    var opts = {},
        t = typeof (opt),
        o = this;
    if (t == "string") {
        opts.charset = opt;
    } else if (t == "object") {
        opts = opt;
    }
    opts.charset = opts.charset || "gb2312";
    setTimeout(function () {
        o._load.apply(o, [src, doc || document, opts]);
        o = null;
    }, 0);
};
MUSIC.JsLoader.count = 0;
MUSIC.JsLoader._idleInstancesIDQueue = [];
MUSIC.JsLoader.prototype._load = function (src, doc, opts) {
    var _ie = MUSIC.userAgent.ie,
        o = this,
        tmp, k, idp = MUSIC.JsLoader._idleInstancesIDQueue,
        _rm = MUSIC.dom.removeElement,
        _ae = MUSIC.event.addEvent,
        _new = false,
        _js;
    if (!(_js = document.getElementById(idp.pop()))) {
        _js = doc.createElement("script");
        _js.id = "_qz_jsloader_" + (++MUSIC.JsLoader.count);
        _new = true;
    }
    _ae(_js, (_ie ? "readystatechange" : "load"), function () {
        if (!_js || _ie && !(_js.readyState == 'loaded')) {
            return;
        }
        _ie && idp.push(_js.id);
        _js._inUse = false;
        o.onload();
        !_ie && _rm(_js);
        _js = _ae = o = null;
    });
    if (!_ie) {
        _ae(_js, 'error', function () {
            _ie && idp.push(_js.id);
            _js._inUse = false;
            o.onerror();
            !_ie && _rm(_js);
            _js = _ae = o = null;
        })
    }
    for (k in opts) {
        if (typeof (tmp = opts[k]) == "string" && k.toLowerCase() != "src") {
            _js.setAttribute(k, tmp);
        }
    }
    _new && doc.getElementsByTagName("head")[0].appendChild(_js);
    _js._inUse = true;
    _js.src = src;
    opts = null;
};
MUSIC["js" + "Loader"] = MUSIC.JsLoader;

MUSIC.JSONGetter = function (actionURL, cname, data, charset, junctionMode) {
    if (MUSIC.object.getType(cname) != "string") {
        cname = "_jsonInstence_" + (MUSIC.JSONGetter.counter + 1);
    }
    var prot = MUSIC.JSONGetter.instance[cname];
    if (prot instanceof MUSIC.JSONGetter) {} else {
        MUSIC.JSONGetter.instance[cname] = prot = this;
        MUSIC.JSONGetter.counter++;
        prot._name = cname;
        prot._sender = null;
        prot._timer = null;
        this.onSuccess = MUSIC.emptyFn;
        this.onError = MUSIC.emptyFn;
        this.onTimeout = MUSIC.emptyFn;
        this.timeout = 5000;
        this.clear = MUSIC.emptyFn;
        this._baseClear = function () {
            this._waiting = false;
            this._squeue = [];
            this._equeue = [];
            this.onSuccess = this.onError = MUSIC.emptyFn;
            this.clear = null;
        };
    }
    prot._uri = actionURL;
    prot._data = (data && (MUSIC.object.getType(data) == "object" || MUSIC.object.getType(data) == "string")) ? data : null;
    prot._charset = (MUSIC.object.getType(charset) != 'string') ? MUSIC.config.defaultDataCharacterSet : charset;
    prot._jMode = !! junctionMode;
    return prot;
};
MUSIC.JSONGetter.instance = {};
MUSIC.JSONGetter.counter = 0;
MUSIC.JSONGetter._errCodeMap = {
    999: {
        msg: 'Connection or Server error.'
    },
    998: {
        msg: 'Connection to Server timeout.'
    }
};
MUSIC.JSONGetter.genHttpParamString = function (o) {
    var r = [];
    for (var i in o) {
        r.push(i + "=" + encodeURIComponent(o[i]));
    }
    return r.join("&");
};
MUSIC.JSONGetter.prototype.addOnSuccess = function (f) {
    if (typeof (f) == "function") {
        if (this._squeue && this._squeue.push) {} else {
            this._squeue = [];
        }
        this._squeue.push(f);
    }
};
MUSIC.JSONGetter._runFnQueue = function (q, resultArgs, th) {
    var f;
    if (q && q.length) {
        while (q.length > 0) {
            f = q.shift();
            if (typeof (f) == "function") {
                f.apply(th ? th : null, resultArgs);
            }
        }
    }
};
MUSIC.JSONGetter.prototype.addOnError = function (f) {
    if (typeof (f) == "function") {
        if (this._equeue && this._equeue.push) {} else {
            this._equeue = [];
        }
        this._equeue.push(f);
    }
};
MUSIC.JSONGetter.pluginsPool = {
    "srcStringHandler": []
};
MUSIC.JSONGetter._pluginsRunner = function (pType, data) {
    var _s = MUSIC.JSONGetter,
        l = _s.pluginsPool[pType],
        t = data,
        len;
    if (l && (len = l.length)) {
        for (var i = 0; i < len; ++i) {
            if (typeof (l[i]) == "function") {
                t = l[i](t);
            }
        }
    }
    return t;
};
MUSIC.JSONGetter.prototype.send = function (callbackFnName) {
    if (this._waiting) {
        return;
    }
    var clear, cfn = (MUSIC.object.getType(callbackFnName) != 'string') ? "callback" : callbackFnName,
        da = this._uri;
    if (this._data) {
        da += (da.indexOf("?") < 0 ? "?" : "&") + ((typeof (this._data) == "object") ? MUSIC.JSONGetter.genHttpParamString(this._data) : this._data);
    }
    da = MUSIC.JSONGetter._pluginsRunner("srcStringHandler", da);
    if (this._jMode) {
        window[cfn] = this.onSuccess;
        var _sd = new MUSIC.JsLoader();
        _sd.onerror = this.onError;
        _sd.load(da, void(0), this._charset);
        return;
    }
    this._timer = setTimeout((function (th) {
        return function () {
            th.onTimeout();
        };
    })(this), this.timeout);
    if (MUSIC.userAgent.ie && !(MUSIC.userAgent.beta && navigator.appVersion.indexOf("Trident\/4.0") > -1)) {
        var df = document.createDocumentFragment(),
            sender = (MUSIC.userAgent.ie == 9 ? document : df).createElement("script");
        sender.charset = this._charset;
        this._senderDoc = df;
        this._sender = sender;
        this.clear = clear = function (o) {
            clearTimeout(o._timer);
            if (o._sender) {
                o._sender.onreadystatechange = null;
            }
            df = o._senderDoc = o._sender = null;
            o._baseClear();
        };
        df[cfn] = (function (th) {
            return (function () {
                th._waiting = false;
                th.onSuccess.apply(th, arguments);
                MUSIC.JSONGetter._runFnQueue(th._squeue, arguments, th);
                clear(th);
            });
        })(this);
        sender.onreadystatechange = (function (th) {
            return (function () {
                if (th._sender && th._sender.readyState == "loaded") {
                    try {
                        th._waiting = false;
                        var _eo = MUSIC.JSONGetter._errCodeMap[999];
                        th.onError(_eo);
                        MUSIC.JSONGetter._runFnQueue(th._equeue, [_eo], th);
                        clear(th);
                    } catch (ignore) {}
                }
            });
        })(this);
        this._waiting = true;
        df.appendChild(sender);
        this._sender.src = da;
    } else {
        this.clear = clear = function (o) {
            clearTimeout(o._timer);
            if (o._sender) {
                o._sender.src = "about:blank";
                o._sender = o._sender.callback = o._sender.errorCallback = null;
            }
            if (MUSIC.userAgent.safari || MUSIC.userAgent.opera) {
                setTimeout('MUSIC.dom.removeElement(document.getElementById("_JSON_frm_' + o._name + '"))', 50);
            } else {
                MUSIC.dom.removeElement(document.getElementById("_JSON_frm_" + o._name));
            }
            o._baseClear();
        };
        var _cb = (function (th) {
            return (function () {
                th._waiting = false;
                th.onSuccess.apply(th, arguments);
                MUSIC.JSONGetter._runFnQueue(th._squeue, arguments, th);
                clear(th);
            });
        })(this);
        var _ecb = (function (th) {
            return (function () {
                th._waiting = false;
                var _eo = MUSIC.JSONGetter._errCodeMap[999];
                th.onError(_eo);
                MUSIC.JSONGetter._runFnQueue(th._equeue, [_eo], th);
                clear(th);
            });
        })(this);
        var frm = document.createElement("iframe");
        frm.id = "_JSON_frm_" + this._name;
        frm.style.width = frm.style.height = frm.style.borderWidth = "0";
        this._sender = frm;
        var _dm = (document.domain == location.host) ? '' : 'document.domain="' + document.domain + '";',
            dout = '<html><head><meta http-equiv="Content-type" content="text/html; charset=' + this._charset + '"/></head><body><script>' + _dm + ';function ' + cfn + '(){frameElement.callback.apply(null, arguments);}<\/script><script charset="' + this._charset + '" src="' + da + '"><\/script><script>setTimeout(frameElement.errorCallback,50);<\/script></body></html>';
        frm.callback = _cb;
        frm.errorCallback = _ecb;
        this._waiting = true;
        if (MUSIC.userAgent.chrome || MUSIC.userAgent.opera || MUSIC.userAgent.firefox < 3) {
            frm.src = "javascript:'" + encodeURIComponent(MUSIC.string.escString(dout)) + "'";
            document.body.appendChild(frm);
        } else {
            document.body.appendChild(frm);
            frm.contentWindow.document.open('text/html');
            frm.contentWindow.document.write(dout);
            frm.contentWindow.document.close();
        }
    }
};
MUSIC.JSONGetter.prototype.destroy = function () {
    var n = this._name;
    delete MUSIC.JSONGetter.instance[n]._sender;
    MUSIC.JSONGetter.instance[n]._sender = null;
    delete MUSIC.JSONGetter.instance[n];
    MUSIC.JSONGetter.counter--;
    return null;
};

function JsonLoadData(url, callback, errcallback, callbackFunctionName, charset) {
    var j = new MUSIC.JSONGetter(url, callbackFunctionName, null, charset, !(ua.ie == 9));
    j.onSuccess = callback;
    j.onError = errcallback;
    j.onTimeout = errcallback;
    j.send(callbackFunctionName);
}

MUSIC.lazyLoad = (function () {
    var _timer = null,
        _elems = [],
        _count = 0,
        _options = {
            container: document,
            binder: null,
            windowElem: document.documentElement,
            frame: null,
            srcname: "_src",
            funcname: "_func",
            threshold: 0,
            delay: 100,
            defaultImg: "http://imgcache.qq.com/music/musicbox_v3/img/pics/default.gif",
            errImg: "http://imgcache.qq.com/MusicPortal_v1/img/albumpic_error.jpg",
            tagNames: ['img', 'iframe'],
            name: "btnlazyload"
        },
        $ = MUSIC,
        $C = $.css,
        $D = $.dom,
        $E = $.event;

    function _setOptions(options) {
        $.object.extend(_options, options || {});
    }

    function _onChange() {
        if (_timer != null) {
            return;
        }
        _timer = setTimeout(_load, _options.delay);
    }

    function _isVisible(range, e) {
        var b = $D.getPosition(e);
        if (range.left <= b.right && b.left <= range.right && range.top <= b.bottom && b.top <= range.bottom) {
            return true;
        }
        return false;
    }

    function _load() {
        if (_count < 1) {
            _dispose();
            return;
        }
        var _top = _options.frame ? MUSIC.dom.getPosition(_options.frame).top : 0;
        var _thres = _options.threshold;
        range = $D.getPosition(_options.windowElem);
        range.left -= _thres;
        range.right += _thres;
        range.top -= _thres - _top;
        range.bottom += _thres - _top;
        for (var i = 0, j = _elems.length; i < j; i++) {
            if (!_elems[i]) {
                continue;
            }
            if (_isVisible(range, _elems[i])) {
                var _elem = _elems[i],
                    _src = _elem.getAttribute(_options.srcname),
                    _w = parseInt(_elem.getAttribute("maxW")),
                    _h = parseInt(_elem.getAttribute("maxH")),
                    _func = _elem.getAttribute(_options.funcname);
                if ( !! _src) {
                    $E.on(_elem, "error", (function (ele, img) {
                        return function () {
                            ele.src = img;
                        }
                    })(_elem, _options.errImg));
                    _elem.removeAttribute(_options.srcname);
                    if (_w > 0 && _h > 0) {
                        MUSIC.media.adjustImageSize(_elem, _src, _w, _h);
                    } else {
                        _elem.src = _src;
                    }
                    delete _elems[i];
                    _count--;
                    continue;
                }
                if ( !! _func) {
                    eval(_func);
                    _elem.removeAttribute(_options.funcname);
                    delete _elems[i];
                    _count--;
                }
            }
        }
        if (_timer != null) {
            clearTimeout(_timer);
            _timer = null;
        }
    }

    function init(options) {
        _setOptions(options);
        _addItems(_options.container);
    }

    function _addItems(container) {
        var _elems_tmp = [];
        $.object.each(_options.tagNames, function (tagName) {
            $.object.each(container.getElementsByTagName(tagName), function (e) {
                if ( !! e && e.getAttribute(_options.srcname) && !e.getAttribute("src")) {
                    _elems.push(e);
                    _elems_tmp.push(e);
                    _count++;
                }
            });
        });
        $.object.each(document.getElementsByName(_options.name), function (e) {
            if ( !! e && e.getAttribute(_options.funcname)) {
                _elems.push(e);
                _count++;
            }
        });
        var defaultImg = new Image();
        $E.on(defaultImg, "load", (function (els, img) {
            return function () {
                $.object.each(els, function (e) {
                    if (e && e.tagName.toUpperCase() == "IMG" && e.getAttribute(_options.srcname)) {
                        e.src = img;
                    }
                });
            }
        })(_elems_tmp, _options.defaultImg));
        defaultImg.src = _options.defaultImg;
        $E.on(_options.binder, "scroll", _onChange);
        _load();
    }

    function _dispose() {
        if (_timer != null) {
            clearTimeout(_timer);
            _timer = null;
        }
        _elems = [];
        $E.removeEvent(_options.binder, "scroll", _onChange);
    }
    return {
        init: init,
        addItems: _addItems
    }
})();

MUSIC.UserData = function (doc, times) {
    doc = doc || document;
    try {
        this.normalDB = "qqmusicuserdata";
        this.error = false;
        if (ua.ie) {
            var id = "udLink";
            this.UD = doc.getElementById(id);
            if (!this.UD) {
                this.UD = doc.createElement("script");
                this.UD.id = id;
                doc.getElementsByTagName("head")[0].appendChild(this.UD);
                try {
                    UDiID = this.UD.addBehavior("#default#userdata");
                } catch (e) {
                    this.error = true;
                    return;
                }
            }
            var expiresDate = new Date();
            if (!times) {
                var hour = 24 - expiresDate.getHours();
                times = hour * 3600 * 1000;
            }
            expiresDate.setTime(expiresDate.getTime() + times);
            this.UD.expires = expiresDate.toUTCString();
            try {
                this.UD.load(this.normalDB);
            } catch (e) {
                this.UD.save(this.normalDB);
            }
        }
    } catch (e) {
        this.error = true;
    }
}
MUSIC.UserData.prototype.clear = function (sStoreName) {
    try {
        if (this.error) return false;
        if (ua.ie) {
            sStoreName = (!sStoreName) ? this.normalDB : sStoreName;
            this.UD.load(sStoreName);
            this.UD.expires = new Date(315532799000).toUTCString();
            this.UD.save(sStoreName);
        }
    } catch (e) {
        this.error = true;
    }
}
MUSIC.UserData.prototype.remove = function (key, sStoreName) {
    try {
        if (ua.ie) {
            sStoreName = (!sStoreName) ? this.normalDB : sStoreName;
            this.UD.setAttribute(key, null);
            this.UD.save(sStoreName);
        } else if (window.sessionStorage) {
            sessionStorage.removeItem(key);
        }
    } catch (e) {
        this.error = true;
    }
}
MUSIC.UserData.prototype.save = function (key, value, sStoreName) {
    try {
        if (this.error) return false;
        if (ua.ie) {
            sStoreName = (!sStoreName) ? this.normalDB : sStoreName;
            this.UD.load(sStoreName);
            this.UD.setAttribute(key, value);
            this.UD.save(sStoreName);
        } else if (window.sessionStorage) {
            sessionStorage.setItem(key, value);
        }
    } catch (e) {
        this.error = true;
    }
}
MUSIC.UserData.prototype.load = function (key, sStoreName) {
    try {
        if (this.error) return '';
        if (ua.ie) {
            sStoreName = (!sStoreName) ? this.normalDB : sStoreName;
            this.UD.load(sStoreName);
            return this.UD.getAttribute(key);
        } else if (window.sessionStorage) {
            return sessionStorage.getItem(key);
        }
    } catch (e) {
        this.error = true;
        return '';
    }
}

MUSIC.widget.other = {
    jumpWithKey: function (url) {
        var uin = getCookie("qqmusic_uin");
        var key = getCookie("qqmusic_key");
        if (uin < 10000) {
            window.open(url);
            return;
        }
        var ptloginUrl = "http://ptlogin2.qq.com/qqmusicvip?keyindex=14&clientuin=" + uin + "&clientkey=" + key + "&url=" + encodeURIComponent(url);
        window.open(ptloginUrl);
    },
    jumpMiniblogWithLogin: function (url) {
        var uin = getCookie("qqmusic_uin");
        var key = getCookie("qqmusic_key");
        if (uin < 10000) {
            window.open(url);
            return;
        }
        var ptloginUrl = "http://ptlogin2.qq.com/jump?pgv_ref=QQMusic.midportal&keyindex=14&clientuin=" + uin + "&clientkey=" + key + "&u1=" + encodeURIComponent(url);
        if (window.open(ptloginUrl) == null) {
            g_popup.show(1, "弹出窗口被阻止！请取消拦截窗口设置！", "", 3000, 390);
        }
    },
    jumpQzoneMusic: function (channel, hostuin) {
        var uin = getCookie("qqmusic_uin");
        var key = getCookie("qqmusic_key");
        var url = 'http://ptlogin2.qq.com/musicbox?keyindex=14&url=' + channel + '&uin=' + uin + '&clientkey=' + key;
        if ( !! hostuin) {
            url += "&hostuin=" + hostuin;
        }
        if (window.open(url) == null) {
            g_popup.show(1, "弹出窗口被阻止！请取消拦截窗口设置！", "", 3000, 390);
        }
    },
    jumpILike: function () {
        this.jumpQzoneMusic('music_lovelist');
    }
}
var g_other = MUSIC.widget.other;
var jumpWithKey = g_other.jumpWithKey;
var jumpMiniblogWithLogin = g_other.jumpMiniblogWithLogin;
var jumpQzoneMusic = g_other.jumpQzoneMusic;

MUSIC.widget.trackServ = {
    shareMusic: function (music) {
        var uin = g_user.getUin();
        if (uin < 10001) {
            g_user.callback = (function (music) {
                return function () {
                    g_trackServ.shareMusic(music);
                }
            })(music);
            g_user.openLogin(null, 'self');
            return;
        }
        g_user.getVipInfo(function (data) {
            music.nick = data.nickname;
            g_dialog.show({
                mode: "iframe",
                title: "音乐分享",
                url: MUSIC.config.tipsPath + "share_music.html",
                objArg: music
            });
        });
    },
    songTips: function () {},
    showLyricTips: function (songid) {
        function dealXmlSucc(xmlHttp) {
            var xmlDom = xmlHttp.xmlDom,
                data = [],
                html_lyric = '';
            data.push('<div class="songlrc"><p>');
            var lyric_tag = xmlDom.getElementsByTagName("lyric");
            var origin_lyric = '';
            if ( !! lyric_tag[0]) {
                origin_lyric = lyric_tag[0].firstChild;
            } else {
                dealXmlFail();
                return;
            }
            if (origin_lyric) {
                origin_lyric = origin_lyric.nodeValue;
                html_lyric = origin_lyric.replace(/\[[^\[\]]*\]/g, "<p>").replace(/\n/g, "</p>").trim();
            }
            data.push(html_lyric);
            data.push('</p></div>');
            g_dialog.show({
                mode: "bigpage",
                title: "歌词",
                desc: data.join('')
            });
        }

        function dealXmlFail() {
            g_popup.show(1, "歌词不存在！", "", 2000, 200);
        }
        var ajax = new MUSIC.XHR('http://music.qq.com/miniportal/static/lyric/' + songid % 100 + '/' + songid + '.xml', 'song_lyric', 'get', null);
        ajax.onSuccess = dealXmlSucc;
        ajax.onError = dealXmlFail;
        ajax.send();
    },
    watchMv: function (vid) {
        window.open("http://v.qq.com/video/play.html?vid=" + vid + "&ADTAG=INNER.MUSIC.MINIPORTAL");
        pgvClickStat("mv");
    },
    sevQzoneBack: function (musicObj) {
        if (LoginMiniportal() < 10001) {
            return;
        }
        var music = {},
            idlist = '';
        if (MUSIC.lang.isElement(musicObj)) {
            music = g_player.formatMusic(musicObj.parentNode.parentNode);
            idlist = music.mid;
        } else if (MUSIC.lang.isString(musicObj)) {
            idlist = musicObj;
        } else {
            idlist = musicObj.mid;
        }

        function _noVip() {
            g_dialog.show({
                mode: "common",
                title: "绿钻特权",
                icon_type: 1,
                sub_title: "设为空间背景音乐是绿钻特权！",
                desc: "您是普通用户，暂不能使用本功能。",
                button_info1: {
                    highlight: 1,
                    onclick: "g_user.openVip('music.bfq.bjyy1.1')",
                    title: "开通绿钻"
                },
                button_info2: {
                    highlight: 1,
                    onclick: "jumpQzoneMusic('music_2pl?id=" + idlist + "')",
                    title: "单条购买"
                }
            });
        }

        function _succ() {
            g_popup.show(0, "设置背景音乐成功！", '<a href="javascript:;" onclick="jumpQzoneMusic(\'music_playlist\');">前往空间音乐盒</a>', 3000, 280);
        }

        function _failed() {
            g_popup.show(1, "设置背景音乐失败！", "当前网络繁忙，请您稍后再试。", 3000, 300);
        }

        function _exceed() {
            g_user.getVipInfo(function (data) {
                var iLevel = g_user.countVipLevel(data.score),
                    iLimit = _getBgLimit(iLevel),
                    _d = {
                        mode: "common",
                        title: "绿钻特权",
                        icon_type: 1,
                        sub_title: "您的背景音乐数量已达到上限！"
                    };
                if (iLevel < 6) {
                    _d.desc = "您是绿钻贵族<strong>Lv" + iLevel + "</strong>，当前上限为<strong>" + iLimit + "</strong>首，比普通用户多<strong>" + (iLimit - 20) + "</strong>首，下一等级上限为<strong>" + _getBgLimit(iLevel + 1) + "</strong>首。";
                } else {
                    _d.desc = "您是绿钻贵族<strong>Lv" + iLevel + "</strong>，当前上限为<strong>100</strong>首，比普通用户多<strong>80</strong>首。";
                }
                if (iLevel < 6 && data.yearFlag != 1) {
                    _d.desc += "推荐您开通年费绿钻，升级加速50%。";
                    _d.button_info1 = {
                        highlight: 1,
                        onclick: "g_user.openYearVip('music.bfq.bjyy1.1')",
                        title: "开通年费绿钻"
                    }
                    _d.button_info2 = {
                        highlight: 0,
                        onclick: "g_dialog.hide()",
                        title: "关闭"
                    }
                } else {
                    _d.button_info1 = {
                        highlight: 0,
                        onclick: "g_dialog.hide()",
                        title: "关闭"
                    }
                }
                g_dialog.show(_d);
            });
        }

        function _getBgLimit(iLevel) {
            var arr = [0, 50, 60, 70, 80, 90, 100, 100];
            if (iLevel <= 0) {
                iLevel = 0;
            }
            if (iLevel >= 7) {
                iLevel = 7;
            }
            return arr[iLevel];
        }

        function _do() {
            var url = "http://qzone-music.qq.com/fcg-bin/fcg_client_add2playlist.fcg?id=" + idlist + "&uin=" + getCookie("qqmusic_uin") + "&key=" + getCookie("qqmusic_key") + "&return=json";
            var j = new MUSIC.JSONGetter(url, "sevQzoneBack", null, "gb2312", false);
            j.onSuccess = function (data) {
                switch (data.retcode) {
                case 5:
                    _noVip();
                    break;
                case 8:
                    _exceed();
                    break;
                case 10:
                    _succ();
                    break;
                default:
                    _failed();
                    break;
                }
            };
            j.onError = _failed;
            j.send("JsonCallback");
        }
        g_user.getVipInfo(function (data) {
            if (data.vip == 1) {
                _do();
            } else if (data.vip == 2) {
                _noVip();
            } else {
                g_player.loginMiniportal();
            }
        });
        pgvClickStat("bgmusic");
    }
};
var g_trackServ = MUSIC.widget.trackServ;

MUSIC.widget.pager = {
    _currentPage: {},
    _totalPages: {},
    _indexContainer: {},
    _callback: {},
    _pager_tpl: ['<a href=\"javascript:;\" onclick=\"MUSIC.widget.pager.goToPage(%(cur),%(per),%(total),%(show),%(pages),\'%(ns)\');return false;\">', '<span>%(tips)</span></a>%(other)'].join(''),
    get: function (params) {
        this._indexContainer[params.ns] = params.indexContainer;
        this._callback[params.ns] = params.callback;
        this._currentPage[params.ns] = 1;
        this._totalPages[params.ns] = 1;
        var obj = this;
        var ret = null;
        (function pageLoad() {
            try {
                obj._indexContainer[params.ns].innerHTML = obj.pageNo(params.total, params.curPage, params.perPage, params.index, params.ns).join("");
            } catch (e) {
                obj._indexContainer[params.ns].innerHTML = obj.pageNo(params.total, params.curPage, params.perPage, params.index, params.ns);
            }
        })()
        obj = null;
    },
    pageNo: function (total, currentPage, perPage, showIndex, ns) {
        var showIndex = showIndex ? showIndex : 7,
            _index = Math.round(showIndex / 2),
            currentPage = parseInt(currentPage, 10) || 1,
            perPage = perPage ? perPage : 7,
            pages = 1;
        if (showIndex == 1) {
            _index = 0;
        }
        if (total / perPage > parseInt(total / perPage)) {
            pages = parseInt(total / perPage) + 1;
        } else {
            pages = parseInt(total / perPage);
        }
        if (pages == 1) {
            return "";
        }
        this._totalPages[ns] = pages;
        var pageIndex = [];
        this._currentPage[ns] = currentPage;
        pageIndex.push('<div class="mod_pager">');
        if (currentPage > 1) {
            pageIndex.push('<span class=\"prev\">');
            pageIndex.push(this._pager_tpl.jstpl_format({
                cur: (currentPage - 1),
                per: perPage,
                total: total,
                show: showIndex,
                pages: pages,
                ns: ns,
                tips: '上一页',
                other: ''
            }));
            pageIndex.push('</span>');
        }
        pageIndex.push('<span class="num">');
        if (pages <= 2 * showIndex) {
            for (var i = 1; i <= pages; i++) {
                if (i == currentPage) {
                    pageIndex.push('<a class="on"><span>' + i + "</span></a>");
                } else {
                    pageIndex.push(this._pager_tpl.jstpl_format({
                        cur: i,
                        per: perPage,
                        total: total,
                        show: showIndex,
                        pages: pages,
                        ns: ns,
                        tips: i,
                        other: ''
                    }));
                }
            }
        } else {
            var b_OutputSpan = false;
            var e_OutputSpan = false;
            var startIndex;
            if ((currentPage - _index) < 1) {
                startIndex = 1;
            } else {
                startIndex = currentPage - _index;
            }
            var endIndex;
            if ((currentPage + _index) > pages) {
                endIndex = pages;
            } else {
                endIndex = currentPage + _index
            }
            if (endIndex - startIndex < showIndex) {
                endIndex = ((startIndex + showIndex) > pages) ? (pages) : startIndex + showIndex;
            }
            if (endIndex - startIndex < showIndex) {
                startIndex = ((endIndex - showIndex) < 1) ? 1 : (endIndex - showIndex);
            }
            for (var i = startIndex; i <= endIndex; i++) {
                if (startIndex >= 2 && !b_OutputSpan) {
                    pageIndex.push(this._pager_tpl.jstpl_format({
                        cur: 1,
                        per: perPage,
                        total: total,
                        show: showIndex,
                        pages: pages,
                        ns: ns,
                        tips: 1,
                        other: startIndex == 2 ? '' : '<span>...</span>'
                    }));
                    b_OutputSpan = true;
                }
                if (i == currentPage) {
                    pageIndex.push('<a class="on"><span>' + i + "</span></a>");
                } else {
                    pageIndex.push(this._pager_tpl.jstpl_format({
                        cur: i,
                        per: perPage,
                        total: total,
                        show: showIndex,
                        pages: pages,
                        ns: ns,
                        tips: i,
                        other: ''
                    }));
                }
            }
            if (pages - endIndex > 1 && !e_OutputSpan) {
                pageIndex.push("<span>...</span>");
                e_OutputSpan = true;
            }
            if (pages - endIndex >= 1) {
                pageIndex.push(this._pager_tpl.jstpl_format({
                    cur: this._totalPages[ns],
                    per: perPage,
                    total: total,
                    show: showIndex,
                    pages: pages,
                    ns: ns,
                    tips: this._totalPages[ns],
                    other: ''
                }));
            }
        }
        pageIndex.push('</span>');
        if (pages != currentPage) {
            pageIndex.push('<span class=\"next\">');
            pageIndex.push(this._pager_tpl.jstpl_format({
                cur: (currentPage + 1),
                per: perPage,
                total: total,
                show: showIndex,
                pages: pages,
                ns: ns,
                tips: '下一页',
                other: ''
            }));
            pageIndex.push("</span>");
        }
        pageIndex.push("</div>");
        return pageIndex;
    },
    goToPage: function (index, RecordsPerPage, totalRecords, onceShow, total_page, ns) {
        index < 1 ? index = 1 : index;
        index > total_page ? index = total_page : index;
        var startIndex = (index - 1) * RecordsPerPage;
        var endIndex = index * RecordsPerPage - 1;
        this._currentPage[ns] = index;
        if (endIndex > totalRecords - 1) {
            endIndex = totalRecords - 1;
        }
        try {
            MUSIC.widget.pager._indexContainer[ns].innerHTML = MUSIC.widget.pager.pageNo(totalRecords, index, RecordsPerPage, onceShow, ns).join("");
        } catch (e) {
            MUSIC.widget.pager._indexContainer[ns].innerHTML = MUSIC.widget.pager.pageNo(totalRecords, index, RecordsPerPage, onceShow, ns);
        }
        MUSIC.widget.pager._callback[ns](index);
    }
}

MUSIC.widget.user = {
    callback: null,
    getUin: function () {
        var _puin = getCookie("uin"),
            _uin = 0;
        if (_puin == "") {
            return _uin;
        }
        if (_puin.indexOf('o') == 0) {
            _uin = parseInt(_puin.substring(1, _puin.length), 10);
        } else {
            _uin = parseInt(_puin, 10);
        }
        return _uin;
    },
    isLogin: function () {
        return MUSIC.widget.user.getUin() > 10000 ? true : false;
    },
    openLogin: function (url, target) {
        MUSIC.widget.user.clearAllCookies();
        url = url || gLocation.replace(/#+\s*$/, '');
        target = target || 'parent';
        var frame_url;
        if (target == 'parent') {
            frame_url = "http://ui.ptlogin2.qq.com/cgi-bin/login?f_url=loginerroralert&style=0&appid=24000201&target=parent&s_url=" + escape(url);
        } else if (target == 'self') {
            frame_url = "http://ui.ptlogin2.qq.com/cgi-bin/login?f_url=loginerroralert&style=0&appid=24000201&target=self&s_url=" + escape('http://fm.qq.com/close.html');
        } else {
            return;
        }
        g_dialog.show({
            mode: "iframe",
            title: "",
            url: frame_url
        });
    },
    loginOut: function (callback) {
        MUSIC.widget.user.clearAllCookies();
        if (callback) {
            callback();
        } else {
            window.location = window.location.href.replace(/#.*$/, "");
        }
    },
    clearAllCookies: function () {
        delCookie("uin", "qq.com");
        delCookie("skey", "qq.com");
        UserInfoCookie.clear();
        UserExternCookie.clear();
    },
    countVipLevel: function (iScore) {
        var iLevel = 0;
        if (iScore >= 0 && iScore < 400) {
            iLevel = 1;
        }
        if (iScore >= 400 && iScore < 800) {
            iLevel = 2;
        }
        if (iScore >= 800 && iScore < 1600) {
            iLevel = 3;
        }
        if (iScore >= 1600 && iScore < 3000) {
            iLevel = 4;
        }
        if (iScore >= 3000 && iScore < 5000) {
            iLevel = 5;
        }
        if (iScore >= 5000 && iScore < 7000) {
            iLevel = 6;
        }
        if (iScore >= 7000) {
            iLevel = 7;
        }
        return iLevel;
    },
    isPrepay: function (payway) {
        return payway == 0 || payway == 5;
    },
    getSpeed: function (payway, yearFlag) {
        yearFlag = yearFlag || 0;
        var default_speed = 5;
        var speed_map = {
            0: 12,
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 13,
            8: 5
        };
        if (yearFlag == 1) {
            return 15;
        }
        try {
            return speed_map[parseInt(payway, 10)] || default_speed;
        } catch (e) {
            return default_speed;
        }
    },
    getVipInfo: function (callBack, errCallBack) {
        var _userinfo = UserInfoCookie.get();
        if (_userinfo != null) {
            if (callBack) {
                callBack(_userinfo);
            }
            return;
        }
        var url = "http://portalcgi.music.qq.com/fcgi-bin/music_mini_portal/cgi_getuser_info.fcg?rnd=" + new Date().valueOf(),
            j = new MUSIC.JSONGetter(url, "userinfo", null, "utf-8", false);
        j.onSuccess = function (data) {
            if (!('retcode' in data) || data.retcode == 0) {
                UserInfoCookie.set(data);
                if (callBack) {
                    callBack(data);
                }
            } else {
                if (errCallBack) {
                    errCallBack();
                }
            }
        }
        j.onError = function () {
            if (errCallBack) {
                errCallBack();
            } else {
                g_popup.show(1, "读取用户身份信息失败！", "当前网络繁忙，请您稍后再试。", 3000, 300);
            }
        };
        j.send("MusicJsonCallback");
    },
    getExternInfo: function (callBack, errCallBack) {
        var _userinfo = UserExternCookie.get();
        if (_userinfo != null) {
            if (callBack) {
                callBack(_userinfo);
            }
            return;
        }
        var url = "http://portalcgi.music.qq.com/fcgi-bin/music_mini_portal/cgi_getuser_extern.fcg?needisopen=1&rnd=" + new Date().valueOf(),
            j = new MUSIC.JSONGetter(url, "externinfo", null, "gb2312", false);
        j.onSuccess = function (data) {
            if (!('retcode' in data) || data.retcode == 0) {
                UserExternCookie.set(data);
                if (callBack) {
                    callBack(data);
                }
            } else {
                err_dealwith();
            }
        }
        j.onError = function () {
            if (errCallBack) {
                errCallBack();
            }
        };
        j.send("MusicJsonCallback");
    },
    openVip: function (aid, cm, defaultmonth) {
        aid = aid || '';
        cm = cm || '';
        defaultmonth = defaultmonth || '';
        var src = "http://ptlogin2.qq.com/jump_to_open_musicvip?aid=" + aid + "&cm=" + cm + "&defaultmonth=" + defaultmonth;
        window.open(src);
        UserInfoCookie.clear();
    },
    openYearVip: function (aid) {
        aid = aid || '';
        var src = "http://ptlogin2.qq.com/jump_to_open_musicvip?aid=" + aid + "&paytime=year&cm=tenpay";
        window.open(src);
        UserInfoCookie.clear();
    },
    getQzoneUserImage: function (uin, size) {
        uin = parseInt(uin, 10);
        if (uin < 10001) {
            return "http://imgcache.qq.com/minimusic_v2/theme1/img/initial_face_big_pic.gif";
        } else {
            return "http://qlogo" + (uin % 4 + 1) + ".store.qq.com/qzone/" + (uin) + "/" + (uin) + "/" + size;
        }
    }
}
var UserInfoCookie = MUSIC.CookieSet('vip', 'nickname', 'score', 'place', 'payway', 'start', 'end', 'yearFlag', 'yearstart', 'yearend', 'nowtime');
UserInfoCookie.basekey = 'detail';
UserInfoCookie.need_attrs = ['vip', 'score', 'place', 'payway', 'yearFlag'];
var UserExternCookie = MUSIC.CookieSet('msgcount', 'isopenminiblog');
UserExternCookie.basekey = 'extern';
UserExternCookie.need_attrs = ['msgcount', 'isopenminiblog'];

function ptlogin2_onResize(width, height) {
    g_dialog.onReady(width, height);
}

function ptlogin2_onClose() {
    g_dialog.hide();
}
var g_user = MUSIC.widget.user;
MUSIC.namespace.map(MUSIC.widget.user);

var gLocation = window.location.href;

function hideElement(e) {
    var obj;
    try {
        obj = MUSIC.dom.get(e);
        obj.style.display = "none";
    } catch (e) {}
}

function showElement(e) {
    try {
        obj = MUSIC.dom.get(e);
        obj.style.display = "block";
    } catch (e) {}
}
MUSIC.widget.main = {
    init: function () {
        MUSIC.event.replaceAllEvent();
        setTimeout(function () {
            g_statistics.initPvJs(function () {
                g_statistics.doPvg(gLocation);
            });
        }, 1000);
        this.watchPage();
    },
    reloadImg: function (container) {
        try {
            container = container || document
            var arrImg = container.images;
            if ( !! document.all) {
                for (var i = 0, length = arrImg.length; i < length; i++) {
                    if (arrImg[i].readyState == 'uninitialized') {
                        if (arrImg[i].src.search(/singer|album|topic|music_topic/) > 0) {
                            arrImg[i].src = "http://imgcache.qq.com/MusicPortal_v1/img/albumpic_error.jpg";
                        }
                    }
                }
            } else {
                for (var i = 0, length = arrImg.length; i < length; i++) {
                    if (arrImg[i].src.search(/singer|album|topic|music_topic/) > 0) {
                        var imgTmp = new Image();
                        imgTmp.src = arrImg[i].src;
                        if (imgTmp.width <= 0) {
                            arrImg[i].src = "http://imgcache.qq.com/MusicPortal_v1/img/albumpic_error.jpg";
                        }
                    }
                }
            }
        } catch (e) {}
    },
    watchPage: function () {
        var _url = gLocation.toString();
        var _id = 0;
        if (_url.search(/\/fm.qq.com\//) > 0) {
            MUSIC.widget.watch.set(170, 109);
            MUSIC.widget.watch.commit(1);
        }
    }
};
var g_musicMain = MUSIC.widget.main;

MUSIC.widget.tips = {
    class_icon_list: ["icon_hint_success", "icon_hint_warn", "icon_hint_help"],
    fix_elem: function (elem, needmask) {
        var $D = MUSIC.dom,
            _e_rect = $D.getRect(elem),
            _ch = $D.getClientHeight(),
            _cw = $D.getClientWidth(),
            _st = $D.getScrollTop(),
            _sl = $D.getScrollLeft();
        $D.setXY(elem, parseInt((_cw - _e_rect.width) / 2 + _sl), parseInt((_ch - _e_rect.height) / 2 + _st));
        if (needmask) {
            this.showMask();
        }
    },
    showMask: function () {
        var _elem = MUSIC.dom.get("divMaskPage");
        if (!_elem) {
            _elem = MUSIC.dom.createElementIn("div", null, false, {
                id: "divMaskPage",
                style: "position:absolute;top:0;left:0;background:#000;filter:alpha(opacity=30);opacity:0.3;z-index:990"
            });
        }
        _elem.style.width = MUSIC.dom.getScrollWidth() + "px";
        _elem.style.height = MUSIC.dom.getScrollHeight() + "px";
        showElement(_elem);
    },
    hideMask: function () {
        hideElement("divMaskPage");
    }
};
MUSIC.widget.tips.popup = (function () {
    var $ = MUSIC,
        $C = $.css,
        $D = $.dom,
        $E = $.event,
        _this = $.widget.tips,
        _popup_tpl = ['<div class="mod_popup_hint">', '%(content)', '</div>'].join(''),
        _timerScroll = null,
        _timerTips = null;

    function _insertCss(callback) {
        callback();
    }

    function show(type, title, desc, timeout, width) {
        var _tpl = ['<div class="hint_box %(class_min_box)">', '<div class="icon"><i class="%(class_icon)">提示</i></div>', '<div class="cont">', '<div class="inner">', '<h2 class="title c_tx2">%(title)</h2>', '<p>%(desc)</p>', '</div>', '</div>', '</div>'].join('');
        width = width || 240;
        _insertCss(function () {
            var _e = $D.get("divPopup");
            if (!_e) {
                _e = $D.createElementIn("div", null, false, {
                    id: "divPopup",
                    style: "position:absolute;z-index:1010;width:" + width + "px;"
                });
            } else {
                _e.style.width = width + "px";
            }
            var _data = {},
                _content = "";
            if (type >= 0 && type <= 2) {
                _data.class_icon = _this.class_icon_list[type];
            }
            _data.title = title || "";
            _data.desc = desc || "";
            _data.class_min_box = _data.desc ? "" : "min_box";
            var _content = _tpl.jstpl_format(_data);
            _data = {};
            _data.content = _content;
            _e.innerHTML = _popup_tpl.jstpl_format(_data);
            showElement(_e);
            _this.fix_elem(_e);
            if (_timerTips != null) {
                clearTimeout(_timerTips);
                _timerTips = null;
            }
            _timerTips = setTimeout(hide, timeout || 1000);
        });
    }

    function hide() {
        hideElement("divPopup");
        if (_timerScroll != null) {
            clearTimeout(_timerScroll);
            _timerScroll = null;
        }
        if (_timerTips != null) {
            clearTimeout(_timerTips);
            _timerTips = null;
        }
    }

    function init(options) {
        var _opt = {
            container: null,
            id: '',
            mode: "list",
            li_tpl: '<li class="%(class_on)"><a href="javascript:;"><span>%(text)</span></a></li>',
            eventType: "hover",
            arrow: "",
            arrow_pos: 0,
            width: 0,
            offset: {
                left: 0,
                top: 0
            },
            zIndex: 999,
            class_mod: "",
            showDelay: 200,
            hideDelay: 200,
            curIndex: -1,
            contents: null,
            showCall: $.emptyFn,
            hideCall: $.emptyFn
        };
        $.object.extend(_opt, options || {});
        var _container = $D.get(_opt.container);
        if (!_container) {
            return;
        }
        var _elemPopup = null;

        function _init() {
            var _tpl = ['<div class="%(class_mod)">', '%(content)', '</div>'].join('');
            _elemPopup = $D.createElementIn("div", null, false, {
                style: "position:absolute;z-index:" + _opt.zIndex + ";display:block;"
            });
            if (_opt.id != '') {
                _elemPopup.id = _opt.id;
            }
            var _data = {},
                _content = "";
            if (_opt.mode == "list") {
                var _html = [];
                _html.push('<ul>');
                $.object.each(_opt.contents, function (content, idx) {
                    if (idx == _opt.curIndex) {
                        content.class_on = "on";
                    }
                    content.index = idx;
                    _html.push(_opt.li_tpl.jstpl_format(content));
                });
                _html.push('</ul>');
                _content = _html.join('');
            } else {
                _content = _opt.contents;
            }
            _data.class_mod = _opt.class_mod || "";
            _data.content = _content;
            _content = _tpl.jstpl_format(_data);
            _data = {};
            _data.content = _content;
            _data.class_arrow = "mod_popup_arrow_" + _opt.arrow;
            var _arrow_map = {
                top: "right",
                left: "bottom",
                bottom: "left",
                right: "top"
            };
            if (_opt.arrow_pos > 0 && _opt.arrow in _arrow_map) {
                _data.style_arrow = _arrow_map[_opt.arrow] + ":" + _opt.arrow_pos + "px";
            }
            _elemPopup.innerHTML = _popup_tpl.jstpl_format(_data);
            if (_opt.eventType == "hover") {
                $E.on(_elemPopup, "mouseover", function () {
                    if (_hoverTimer) {
                        clearTimeout(_hoverTimer);
                    }
                    _hoverTimer = setTimeout(_show, _opt.showDelay);
                });
                $E.on(_elemPopup, "mouseout", function () {
                    if (_hoverTimer) {
                        clearTimeout(_hoverTimer);
                    }
                    _hoverTimer = setTimeout(_hide, _opt.hideDelay);
                });
            }
            if (_opt.mode == "list") {
                var _elems = _elemPopup.getElementsByTagName('a'),
                    _len = _elems.length;
                if (_len != _opt.contents.length) {
                    return;
                }

                function _click(event, idx) {
                    idx = parseInt(idx);
                    if (_opt.curIndex != idx) {
                        for (var i = 0; i < _len; i++) {
                            if (i == idx) {
                                _elems[i].className = "on";
                                _container.innerHTML = _opt.contents[i].text;
                                _opt.curIndex = idx;
                                if (_opt.contents[i].func) {
                                    _opt.contents[i].func.apply(null, [i, _elems[i]]);
                                }
                            } else {
                                _elems[i].className = "";
                            }
                        }
                    }
                    _hide();
                }
                $.object.each(_elems, function (elem, idx) {
                    $E.on(elem, "click", _click, "" + idx);
                });
            }
        }

        function _setPos() {
            var _tPos = $D.getPosition(_container),
                _mode = 0,
                _pos = {};
            _elems = _container.getElementsByTagName("i");
            if (_elems.length > 0) {
                _tPos = $D.getPosition(_elems[0]);
                _mode = 1;
            }
            _pos.width = _opt.width;
            if (_opt.offset.top > 0 && _opt.offset.left > 0) {
                _pos.top = _opt.offset.top;
                _pos.left = _opt.offset.left;
            } else {
                switch (_opt.arrow) {
                case "top":
                    if (_mode == 1) {
                        _pos.top = _tPos.bottom + 10;
                        _pos.left = _tPos.left - _pos.width + (_opt.arrow_pos > 0 ? _opt.arrow_pos : 16) + 13;
                    } else {
                        _pos.top = _tPos.bottom + 5;
                        _pos.left = parseInt(_tPos.left + _tPos.width / 2 + (_opt.arrow_pos > 0 ? _opt.arrow_pos : 16) - _pos.width) + 7;
                    }
                    break;
                case "bottom":
                    if (_mode == 1) {
                        _pos.top = _tPos.top - 10;
                        _pos.left = _tPos.left - _pos.width + (_opt.arrow_pos > 0 ? _opt.arrow_pos : 16) + 13;
                    } else {
                        _pos.top = _tPos.top - _tPos.height - 67;
                        _pos.left = _tPos.left - 5;
                    }
                    break;
                default:
                    _pos.top = _tPos.top;
                    _pos.left = _tPos.left;
                    break;
                }
            }
            $D.setPosition(_elemPopup, _pos);
        }

        function _show() {
            if (!_elemPopup) {
                _insertCss(function () {
                    _init();
                    _show();
                });
            } else {
                _setPos();
                showElement(_elemPopup);
                if (_opt.showCall) {
                    _opt.showCall();
                }
            }
        }

        function _hide() {
            hideElement(_elemPopup);
            if (_opt.hideCall) {
                _opt.hideCall();
            }
        }
        switch (_opt.eventType) {
        case "hover":
            var _hoverTimer = null;
            $E.on(_container, "mouseover", function () {
                if (_hoverTimer) {
                    clearTimeout(_hoverTimer);
                }
                _hoverTimer = setTimeout(_show, _opt.showDelay);
            });
            $E.on(_container, "mouseout", function () {
                if (_hoverTimer) {
                    clearTimeout(_hoverTimer);
                }
                _hoverTimer = setTimeout(_hide, _opt.hideDelay);
            });
            break;
        case "focus":
            var _hoverTimer = null;
            $E.on(_container, "focus", function () {
                _show();
            });
            $E.on(_container, "blur", function () {
                _hide();
            });
            break;
        case "click":
            $E.on(_container, "click", function () {
                if (!_elemPopup) {
                    _insertCss(function () {
                        _init();
                        _show();
                    });
                } else {
                    if (_elemPopup.style.display == "none") {
                        _show();
                    } else {
                        _hide();
                    }
                }
                $E.cancelBubble();
            });
            $E.on(document, "click", function () {
                var _target = $E.getTarget();
                if ($D.isAncestor(_elemPopup, _target)) {
                    return;
                }
                if (_elemPopup && _elemPopup.style.display != "none") {
                    _hide();
                }
            });
            break;
        default:
            break;
        }
    }
    return {
        show: show,
        hide: hide,
        init: init
    };
})();
MUSIC.widget.tips.dialog = (function () {
    var $ = MUSIC,
        $C = $.css,
        $D = $.dom,
        $E = $.event,
        _this = $.widget.tips,
        _dialog_tpl = ['%(dialog_title)', '<div class="cont">', '%(content)', '</div>', ].join('');
    _title_tpl = '<div class="tit" id="divdialogtitle"><h3>%(title)</h3><a class="btn_close" href="javascript:;" onclick="g_dialog.hide();">×</a></div>', _timerScroll = null, objArg = null;

    function _insertCss(callback) {
        callback();
    }

    function _fadeIn(e) {
        function u(a, b) {
            if (b >= 100) {
                a.style.filter = "none";
                a.style.opacity = 1;
                return;
            }
            a.style.filter = "alpha(opacity=" + b + ")";
            a.style.opacity = b / 100;
        }
        var speed = 25;
        var c1 = 0;
        var b = setInterval(function () {
            c1 += speed;
            if (c1 >= 100) c1 = 100;
            u(e, c1);
            if (c1 >= 100) {
                clearInterval(b);
            }
        }, 10);
    }

    function _on_scroll(event, elem) {
        if (_timerScroll != null) {
            return;
        }
        _timerScroll = setTimeout(function () {
            _this.fix_elem(elem, true);
            clearTimeout(_timerScroll);
            _timerScroll = null;
        }, 200);
    }

    function show(options) {
        g_tips.showMask();
        var _opt = {
            mode: "common",
            title: "",
            icon_type: -1,
            sub_title: "",
            desc: "",
            width: 420,
            button_info1: null,
            button_info2: null,
            url: "",
            objArg: null
        };
        $.object.extend(_opt, options || {});
        _insertCss(function () {
            var _e = $D.get("divdialog");
            if (!_e) {
                _e = $D.createElementIn("div", null, false, {
                    id: "divdialog",
                    style: "position:absolute;z-index:1000;filter:alpha(opacity=0);opacity:.0;",
                    "class": "mod_popup_dialog"
                });
            } else {
                _e.innerHTML = "";
                _e.style.cssText = "position:absolute;z-index:1000;filter:alpha(opacity=0);opacity:.0;";
            }
            var _data = {},
                _content = "",
                _tpl = "";
            if (_opt.mode == "iframe") {
                _content = '<iframe id="frame_tips" frameborder="0" width="1px;" height="1px;" scrolling="no" src="about:blank;"></iframe>';
                objArg = _opt.objArg;
            } else if (_opt.mode == "bigpage") {
                _content = _opt.desc;
            } else {
                _tpl = ['<div class="icon"><i class="%(class_icon)">提示</i></div>', '<div class="cont">', '<div class="inner" id="i2">', '<h2 class="title c_tx2">%(sub_title)</h2>', '<p>%(desc)</p>', '</div>', '</div>', '<div class="btns">', '<p class="byleft"><span class="again" style="display:none;"><input type="checkbox" id="again" /><label for="again">不再提示</label></span></p>', '<p class="byright">', '<a style="display:%(button_display1);" class="btn_gb %(button_class1)" href="javascript:;" onclick="%(button_onclick1)"><span>%(button_title1)</span></a>', '<a style="display:%(button_display2);" class="btn_gb %(button_class2)" href="javascript:;" onclick="%(button_onclick2)"><span>%(button_title2)</span></a>', '</p>', '</div>'].join('');
                if (_opt.icon_type >= 0 && _opt.icon_type <= 2) {
                    _data.class_icon = _this.class_icon_list[_opt.icon_type];
                }
                _data.sub_title = _opt.sub_title || "";
                _data.desc = _opt.desc || "";
                if (_opt.button_info1) {
                    _data.button_class1 = _opt.button_info1.highlight ? "btn_gb_on" : "";
                    _data.button_onclick1 = _opt.button_info1.onclick || "";
                    _data.button_title1 = _opt.button_info1.title || "";
                } else {
                    _data.button_display1 = "none";
                }
                if (_opt.button_info2) {
                    _data.button_class2 = _opt.button_info2.highlight ? "btn_gb_on" : "";
                    _data.button_onclick2 = _opt.button_info2.onclick || "";
                    _data.button_title2 = _opt.button_info2.title || "";
                } else {
                    _data.button_display2 = "none";
                }
                _content = _tpl.jstpl_format(_data);
            }
            _data = {};
            if (_opt.title == "") {
                _data.dialog_title = "";
            } else {
                _data.dialog_title = _title_tpl.jstpl_format({
                    title: _opt.title
                });
            }
            _data.content = _content;
            _e.innerHTML = _dialog_tpl.jstpl_format(_data);
            if (_opt.mode == "iframe") {
                document.getElementById("frame_tips").src = _opt.url;
            } else {
                _e.style.width = _opt.width + 'px';
                _this.fix_elem(_e, true);
                showElement(_e);
                _fadeIn(_e);
            }
        });
    }

    function onReady(width, height) {
        var _e = $D.get("divdialog"),
            _titleRect = $D.getRect("divdialogtitle"),
            elm = $D.get("frame_tips"),
            _w = 0,
            _h = 0;
        if (!_e) {
            return;
        }
        if (elm) {
            elm.width = width + 'px';
            elm.height = height + 'px';
        }
        _e.style.visibility = "hidden";
        _e.style.visibility = "visible";
        if (!_titleRect) {
            _e.style.width = width + 'px';
            _e.style.height = height + 'px';
        } else {
            _e.style.width = width + 'px';
            _e.style.height = height + _titleRect.height + 'px';
        }
        _this.fix_elem(_e);
        showElement(_e);
        _fadeIn(_e);
    }

    function hide() {
        hideElement("divdialog");
        if (_timerScroll != null) {
            clearTimeout(_timerScroll);
            _timerScroll = null;
        }
        $E.removeEvent(window, "scroll", _on_scroll);
        $E.removeEvent(window, "resize", _on_scroll);
        g_tips.hideMask();
    }

    function getArg() {
        return objArg;
    }
    return {
        show: show,
        hide: hide,
        onReady: onReady,
        getArg: getArg
    };
})();
var g_tips = MUSIC.widget.tips;
var g_popup = g_tips.popup;
var g_dialog = g_tips.dialog;

function g_showBusyTips() {
    g_popup.show(1, "服务器繁忙，请稍候重试！", "", 3000, 290);
}

MUSIC.widget.watch = {
    set: function (_busineseid, _webid) {
        this._webid = !_webid ? this._webid : _webid;
        this._busineseid = !_busineseid ? this._busineseid : _busineseid;
    },
    _busineseid: 170,
    _webid: 109,
    _rnd: 10,
    getWaitTime: function () {
        var t = top["TRANS_TIME_POINT"];
        if ( !! t) {
            t = parseInt(t);
        } else {
            t = 0;
        }
        top["TRANS_TIME_POINT"] = 0;
        return t;
    },
    _sended: false,
    timers: [],
    setTime: function () {
        this.timers = [];
        if (typeof g_watchCssBegin == "undefined") {
            return false;
        }
        var _begin = this.getWaitTime(),
            _end = new Date() - 0;
        if (_begin == 0) {
            _begin = g_watchCssBegin;
        }
        this.timers[0] = _end - _begin;
        if (this.timers[0] > 10000) {
            return false;
        }
        this.timers[1] = g_watchCssBegin - _begin;
        if (typeof g_watchPageBegin == "undefined") {
            return false;
        }
        this.timers[2] = g_watchPageBegin - g_watchCssBegin;
        if (typeof g_watchJsBegin == "undefined") {
            return false;
        }
        if (typeof g_watchRenderBegin == "undefined") {
            return false;
        }
        this.timers[3] = g_watchRenderBegin - g_watchJsBegin;
        this.timers[4] = _end - g_watchRenderBegin;
        return true;
    },
    send: function (_id, _rnd) {
        if (typeof (_rnd) == "number" && _rnd > 0) {
            this._rnd = _rnd;
        }
        if ((new Date().valueOf()) % this._rnd == 0) {
            var url = "http://isdspeed.qq.com/cgi-bin/r.cgi?flag1=170&flag2=" + this._webid;
            url += "&flag3=" + _id;
            url += "&flag4=" + this._rnd;
            for (var i = 0; i < this.timers.length; i++) {
                url += "&" + (i + 1) + "=" + this.timers[i];
            }
            new Image().src = url;
        }
    },
    commit: function (id) {
        if (this._sended) return;
        if (this.setTime()) {
            this._sended = true;
            setTimeout(this.send.bind(this), 2000, id);
        }
    }
}

MUSIC.widget.statistics = {
    initPvJs: function (callback) {
        var _sd = new MUSIC.JsLoader();
        _sd.onload = function () {
            if (callback) {
                callback();
            }
        };
        _sd.load("http://pingjs.qq.com/ping.js");
    },
    doPvg: function (url) {
        if (typeof (pgvMain) == 'function') {
            pvRepeatCount = 1;
            pgvMain("", {
                virtualURL: url
            });
        }
    },
    getStatSource: function () {
        var reg_map = {};
        for (var reg in reg_map) {
            var r = new RegExp(reg);
            if (r.test(gLocation)) return reg_map[reg];
        }
        return 9;
    },
    stat: function (optcode, dim1, dim2, song_id, source) {
        var index = 0;
        var uin = g_user.getUin();
        var base_url = "http://portalcgi.music.qq.com/fcgi-bin/statistic/cgi_musicportal_stat2.fcg?";

        function _stat() {
            var arg_list = [];
            arg_list.push('msg0=2080000072');
            if (!dim1 || dim1 < 0) {
                dim1 = 0;
            }
            if (!dim2 || dim2 < 0) {
                dim2 = 0;
            }
            if (!song_id || song_id < 0) {
                song_id = 0;
            }
            var item = [uin, dim1, dim2, song_id, optcode, source, 0, 0, 0, 0, 0];
            for (var i = 0, len = item.length; i < len; i++) {
                arg_list.push('a0-' + i + '=' + item[i]);
            }
            if (optcode > 0) {
                var url = base_url + arg_list.join('&');
                try {
                    new Image().src = url;
                } catch (e) {;
                }
            }
        }
        _stat();
    }
}
var g_statistics = MUSIC.widget.statistics;
var g_stat = g_statistics.stat;

MUSIC.widget.Timer = function () {
    this.freq = 100;
    this.totaltimes = 0;
    this.callback = MUSIC.emptyFn;
    this.endcallback = MUSIC.emptyFn;
};
MUSIC.widget.Timer.prototype = {
    timer: null,
    isExecuting: false,
    isOver: true,
    times: 0,
    start: function () {
        this.stop();
        this.isExecuting = false;
        this.isOver = false;
        this.times = 0;
        this.timer = setInterval(this.onTimerEvent.bind(this), this.freq);
    },
    stop: function () {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
        this.isOver = true;
        if (typeof (this.endcallback) == "function") {
            this.endcallback(this.times);
        }
    },
    onTimerEvent: function () {
        if (!this.isExecuting) {
            try {
                this.isExecuting = true;
                this.times++;
                if (typeof (this.callback) == "function") {
                    this.callback(this.times);
                }
                if (this.totaltimes >= 0 && this.times >= this.totaltimes) {
                    this.stop();
                }
            } catch (e) {} finally {
                this.isExecuting = false;
            }
        }
    }
} /*  |xGv00|9b27aba5a229d9be78ee43599261affd */
