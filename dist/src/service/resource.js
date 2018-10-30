import { Config } from '../config/config';
var _get = require('lodash.get');
var _set = require('lodash.set');
var _merge = require('lodash.merge');
var Resource = /** @class */ (function () {
    function Resource(service, key) {
        this.service = service;
        this.key = key;
        this._defaultValue = null;
        this._path = [];
        this._prefix = Config.prefix;
    }
    Object.defineProperty(Resource.prototype, "value", {
        /**
         * Returns value taking path into account
         * @returns {any}
         */
        get: function () {
            return this.considerDefault(this.readValue());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "defaultValue", {
        /**
         * Returns default value
         * @returns {T}
         */
        get: function () {
            return this._defaultValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "path", {
        /**
         * Returns current path as a string
         * @returns {string}
         */
        get: function () {
            return this.pathString;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "prefix", {
        /**
         * Returns currently set prefix
         * @returns {string}
         */
        get: function () {
            return this._prefix;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets path of object property
     * @param {string} path
     * @returns {this}
     */
    Resource.prototype.setPath = function (path) {
        this._path = path.split('.');
        return this;
    };
    /**
     * Appends current path
     * e.g. if path('key') and appendPath('nested'), the path will be "key.nested"
     * @param {string} path
     * @returns {this}
     */
    Resource.prototype.appendPath = function (path) {
        this._path.push(path);
        return this;
    };
    /**
     * Removes last item of path
     * e.g. if path('key.nested') and truncatePath(), the path will be "key"
     * @returns {this}
     */
    Resource.prototype.truncatePath = function () {
        this._path.pop();
        return this;
    };
    /**
     * Resets set path
     * @returns {this}
     */
    Resource.prototype.resetPath = function () {
        this._path = [];
        return this;
    };
    /**
     * Sets prefix
     * @param {string} prefix
     * @returns {this}
     */
    Resource.prototype.setPrefix = function (prefix) {
        this._prefix = prefix;
        return this;
    };
    /**
     * Moves storage item to new key using given prefix
     * @param {string} prefix
     * @returns {this}
     */
    Resource.prototype.changePrefix = function (prefix) {
        this.service.utility.set(this.key, this.fullValue, { prefix: prefix });
        this.service.utility.remove(this.key, { prefix: this._prefix });
        return this.setPrefix(prefix);
    };
    /**
     * Sets default value for both reading and saving operations
     * @param defaultValue
     * @returns {this}
     */
    Resource.prototype.setDefaultValue = function (defaultValue) {
        this._defaultValue = defaultValue;
        var value = this.readValue();
        if (this.isNullOrUndefined(value)) {
            this.save(defaultValue);
        }
        return this;
    };
    /**
     * Creates or overrides value as a new entry or existing object property depending on path
     * @param value
     * @returns {this}
     */
    Resource.prototype.save = function (value) {
        if (this.pathString) {
            value = _set(this.fullValue, this.pathString, this.considerDefault(value));
        }
        this.service.utility.set(this.key, this.considerDefault(value), { prefix: this._prefix });
        return this;
    };
    /**
     * Updates existing object property using current path
     * @param {T} value
     * @returns {this}
     */
    Resource.prototype.update = function (value) {
        return this.save(_merge(this.readValue(), value));
    };
    /**
     * Removes item stored under current key
     * @returns {this}
     */
    Resource.prototype.remove = function () {
        this.service.utility.remove(this.key);
        return this;
    };
    Object.defineProperty(Resource.prototype, "fullValue", {
        get: function () {
            return this.considerDefault(this.service.utility.get(this.key, { prefix: this._prefix }));
        },
        enumerable: true,
        configurable: true
    });
    Resource.prototype.considerDefault = function (value) {
        return this.isNullOrUndefined(value) ? this._defaultValue : value;
    };
    Resource.prototype.isNullOrUndefined = function (value) {
        return (value === null || value === undefined);
    };
    Object.defineProperty(Resource.prototype, "pathString", {
        get: function () {
            return this._path.join('.');
        },
        enumerable: true,
        configurable: true
    });
    Resource.prototype.readValue = function () {
        var value = this.service.utility.get(this.key, { prefix: this._prefix });
        if (this.pathString) {
            return _get(value, this.pathString);
        }
        return value;
    };
    return Resource;
}());
export { Resource };
//# sourceMappingURL=resource.js.map