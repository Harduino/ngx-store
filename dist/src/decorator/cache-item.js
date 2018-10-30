import { Config, debug } from '../config/index';
import { Cache } from './cache';
var isEqual = require('lodash.isequal');
var CacheItem = /** @class */ (function () {
    function CacheItem(cacheItem) {
        this.name = '';
        this.targets = [];
        this.services = [];
        this.utilities = [];
        this.proxy = null;
        this._key = '';
        this.initializedTargets = new Set();
        this._key = cacheItem.key;
        this.name = cacheItem.name;
        this.addTargets(cacheItem.targets);
        this.addServices(cacheItem.services);
        this.addUtilities(cacheItem.utilities);
    }
    Object.defineProperty(CacheItem.prototype, "key", {
        get: function () {
            return this._key;
        },
        enumerable: true,
        configurable: true
    });
    CacheItem.prototype.saveValue = function (value, config, source) {
        if (config === void 0) { config = {}; }
        debug.groupCollapsed('CacheItem#saveValue for ' + this.key + ' in ' + this.currentTarget.constructor.name);
        debug.log('new value: ', value);
        debug.log('previous value: ', this.readValue());
        debug.log('targets.length: ', this.targets.length);
        debug.log('currentTarget:', this.currentTarget);
        debug.groupEnd();
        // prevent overwriting value by initializators
        if (!this.initializedTargets.has(this.currentTarget)) {
            this.initializedTargets.add(this.currentTarget);
            var readValue = this.readValue();
            var savedValue = (readValue !== null && readValue !== undefined) ? readValue : value;
            var proxy = this.getProxy(savedValue, config);
            proxy = (proxy !== null) ? proxy : value;
            debug.log('initial value for ' + this.key + ' in ' + this.currentTarget.constructor.name, proxy);
            this.propagateChange(savedValue, source);
            return proxy;
        }
        this.propagateChange(value, source);
        return this.getProxy(value, config);
    };
    CacheItem.prototype.getProxy = function (value, config) {
        if (config === void 0) { config = {}; }
        if (value === undefined && this.proxy)
            return this.proxy; // return cached proxy if value hasn't changed
        value = (value === undefined) ? this.readValue() : value;
        if (typeof value !== 'object' || value === null) {
            this.proxy = value;
            return value;
        }
        if ((!Config.mutateObjects && !config.mutate) || config.mutate === false)
            return value;
        var _self = this; // alias to use in standard function expressions
        var prototype = Object.assign(new value.constructor(), value.__proto__);
        prototype.save = function () {
            _self.saveValue(value, config);
        };
        // TODO set prototype for Array.prototype or something
        if (Array.isArray(value)) { // handle methods that could change value of array
            var methodsToOverwrite = [
                'pop', 'push', 'reverse', 'shift', 'unshift', 'splice',
                'filter', 'forEach', 'map', 'fill', 'sort', 'copyWithin'
            ];
            var _loop_1 = function (method) {
                prototype[method] = function () {
                    var readValue = _self.readValue();
                    var result = Array.prototype[method].apply(readValue, arguments);
                    debug.log('Saving value for ' + _self.key + ' by method ' + prototype.constructor.name + '.' + method);
                    _self.saveValue(readValue, config);
                    return result;
                };
            };
            for (var _i = 0, methodsToOverwrite_1 = methodsToOverwrite; _i < methodsToOverwrite_1.length; _i++) {
                var method = methodsToOverwrite_1[_i];
                _loop_1(method);
            }
        }
        Object.setPrototypeOf(value, prototype);
        this.proxy = value;
        return value;
    };
    CacheItem.prototype.readValue = function (config) {
        if (config === void 0) { config = {}; }
        var entry = this.utilities[0];
        var value = entry ? entry.utility.get(this.key, entry.config) : null;
        return (typeof value !== 'object') ? value : JSON.parse(JSON.stringify(this.getProxy(value, entry.config)));
    };
    CacheItem.prototype.addTargets = function (targets) {
        var _this = this;
        targets.forEach(function (target) {
            if (_this.targets.indexOf(target) === -1) {
                if (typeof target === 'object') { // handle Angular Component destruction
                    var originalFunction_1 = target.ngOnDestroy;
                    var _self_1 = _this;
                    target.ngOnDestroy = function () {
                        if (typeof originalFunction_1 === 'function') {
                            originalFunction_1.apply(this, arguments);
                        }
                        target.ngOnDestroy = originalFunction_1 || function () { };
                        _self_1.initializedTargets.delete(target);
                        _self_1.targets = _self_1.targets.filter(function (t) { return t !== target; });
                        if (!_self_1.targets.length) {
                            _self_1.services.forEach(function (service) {
                                service.keys = service.keys.filter(function (key) { return key !== _self_1._key; });
                            });
                            _self_1.resetProxy();
                            Cache.remove(_self_1);
                        }
                        debug.groupCollapsed(_self_1.key + " OnDestroy handler:");
                        debug.log('removed target:', target.constructor.name);
                        debug.log('remaining targets:', _self_1.targets);
                        debug.log('cacheItem:', Cache.get(_self_1.key));
                        debug.groupEnd();
                    };
                    _this.targets.push(target);
                }
            }
        });
    };
    CacheItem.prototype.addServices = function (services) {
        var _this = this;
        services.forEach(function (service) {
            if (_this.services.indexOf(service) === -1) {
                service.keys.push(_this._key);
                _this.services.push(service);
            }
        });
    };
    CacheItem.prototype.addUtilities = function (utilityEntries) {
        var _this = this;
        utilityEntries.forEach(function (entry) {
            if (_this.utilities.findIndex(function (e) { return e.utility === entry.utility; }) === -1) {
                _this.utilities.push(entry);
                entry.utility.set(_this.key, _this.readValue());
            }
        });
    };
    CacheItem.prototype.resetProxy = function () {
        this.proxy = null;
    };
    CacheItem.prototype.propagateChange = function (value, source) {
        var _this = this;
        if (isEqual(value, this.readValue()))
            return;
        this.utilities.forEach(function (entry) {
            var utility = entry.utility;
            // updating service which the change came from would affect in a cycle
            if (utility === source)
                return;
            debug.log("propagating change on " + _this.key + " to:", utility);
            utility.set(_this._key, value, entry.config);
        });
    };
    return CacheItem;
}());
export { CacheItem };
//# sourceMappingURL=cache-item.js.map