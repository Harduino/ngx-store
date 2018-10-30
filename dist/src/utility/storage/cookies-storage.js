var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Config, debug } from '../../config/index';
import { NgxStorage } from './storage';
import { WebStorageUtility } from '../webstorage.utility';
import { interval } from 'rxjs';
var CookiesStorage = /** @class */ (function (_super) {
    __extends(CookiesStorage, _super);
    function CookiesStorage() {
        var _this = _super.call(this) || this;
        _this.getAllItems();
        if (Config.cookiesCheckInterval) {
            interval(Config.cookiesCheckInterval)
                .subscribe(function () {
                if (!_this.externalChanges.observers.length) {
                    return; // don't run if there are no set subscriptions
                }
                _this.getAllItems();
            });
        }
        return _this;
    }
    Object.defineProperty(CookiesStorage.prototype, "type", {
        get: function () {
            return 'cookiesStorage';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CookiesStorage.prototype, "length", {
        get: function () {
            return this.getAllKeys().length;
        },
        enumerable: true,
        configurable: true
    });
    CookiesStorage.prototype.key = function (index) {
        return this.getAllKeys()[index];
    };
    CookiesStorage.prototype.getItem = function (key) {
        return this.getAllItems().get(key);
    };
    CookiesStorage.prototype.removeItem = function (key) {
        if (typeof document === 'undefined')
            return;
        var domain = this.resolveDomain(Config.cookiesScope);
        domain = (domain) ? 'domain=' + domain + ';' : '';
        document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;' + domain;
        this.cachedItemsMap.delete(key);
    };
    /**
     * @param key
     * @param value
     * @param expirationDate passing null affects in lifetime cookie
     */
    CookiesStorage.prototype.setItem = function (key, value, expirationDate) {
        if (typeof document === 'undefined')
            return;
        var domain = this.resolveDomain(Config.cookiesScope);
        debug.log('Cookies domain:', domain);
        domain = (domain) ? 'domain=' + domain + ';' : '';
        var utcDate = '';
        if (expirationDate instanceof Date) {
            utcDate = expirationDate.toUTCString();
        }
        else if (expirationDate === null) {
            utcDate = 'Fri, 18 Dec 2099 12:00:00 GMT';
        }
        var expires = utcDate ? '; expires=' + utcDate : '';
        var cookie = key + '=' + value + expires + ';path=/;' + domain;
        debug.log('Cookie`s set instruction:', cookie);
        this.cachedItemsMap.set(key, value);
        document.cookie = cookie;
    };
    CookiesStorage.prototype.clear = function () {
        var _this = this;
        this.getAllKeys().forEach(function (key) { return _this.removeItem(key); });
    };
    CookiesStorage.prototype.forEach = function (callbackFn) {
        return this.getAllItems().forEach(function (value, key) { return callbackFn(value, key); });
    };
    CookiesStorage.prototype.getAllKeys = function () {
        return Array.from(this.getAllItems().keys());
    };
    // TODO: consider getting cookies from all paths
    CookiesStorage.prototype.getAllItems = function () {
        var _this = this;
        if (this.cachedCookieString === document.cookie) { // No changes
            return this.cachedItemsMap;
        }
        var map = new Map();
        if (typeof document === 'undefined')
            return map;
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            var eqPos = cookie.indexOf('=');
            var key = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            var value = eqPos > -1 ? cookie.substr(eqPos + 1, cookie.length) : cookie;
            map.set(key, value);
        }
        // detect changes and emit events
        if (this.cachedItemsMap) {
            map.forEach(function (value, key) {
                var cachedValue = _this.cachedItemsMap.get(key);
                cachedValue = (cachedValue !== undefined) ? cachedValue : null;
                if (value !== cachedValue) {
                    _this.emitEvent(key, WebStorageUtility.getGettable(value), WebStorageUtility.getGettable(cachedValue));
                }
            });
            this.cachedItemsMap.forEach(function (value, key) {
                if (!map.has(key)) {
                    _this.emitEvent(key, null, WebStorageUtility.getGettable(value));
                }
            });
        }
        this.cachedCookieString = document.cookie;
        return this.cachedItemsMap = map;
    };
    /**
     * domain.com         + path="."          = .domain.com
     * domain.com         + path=".sub."      = .sub.domain.com
     * sub.domain.com     + path="sub."       = sub.domain.com
     * www.sub.domain.com + path="."          = .sub.domain.com
     * localhost          + path=".whatever." = localhost
     * @param path
     */
    CookiesStorage.prototype.resolveDomain = function (path) {
        if (!path)
            return '';
        var hostname = document.domain;
        if ((hostname.match(/\./g) || []).length < 1) {
            return '';
        }
        var www = (path[0] !== '.' && hostname.indexOf('www.') === 0) ? 'www.' : '';
        return www + path + this.getDomain();
    };
    /**
     * This function determines base domain by setting cookie at the highest level possible
     * @url http://rossscrivener.co.uk/blog/javascript-get-domain-exclude-subdomain
     */
    CookiesStorage.prototype.getDomain = function () {
        var i = 0;
        var domain = document.domain;
        var domainParts = domain.split('.');
        var s = '_gd' + (new Date()).getTime();
        while (i < (domainParts.length - 1) && document.cookie.indexOf(s + '=' + s) === -1) {
            domain = domainParts.slice(-1 - (++i)).join('.');
            document.cookie = s + '=' + s + ';domain=' + domain + ';';
        }
        document.cookie = s + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=' + domain + ';';
        return domain;
    };
    return CookiesStorage;
}(NgxStorage));
export { CookiesStorage };
export var cookiesStorage = new CookiesStorage();
//# sourceMappingURL=cookies-storage.js.map