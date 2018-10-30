import { CookiesStorageService, LocalStorageService, SessionStorageService } from '../service/index';
import { cookiesStorageUtility, localStorageUtility, sessionStorageUtility, sharedStorageUtility } from '../utility/index';
import { SharedStorageService } from '../service/shared-storage.service';
import { Cache } from './cache';
export function LocalStorage(keyOrConfig, config) {
    return WebStorage(localStorageUtility, LocalStorageService, keyOrConfig, config);
}
export function SessionStorage(keyOrConfig, config) {
    return WebStorage(sessionStorageUtility, SessionStorageService, keyOrConfig, config);
}
export function CookieStorage(keyOrConfig, config) {
    return WebStorage(cookiesStorageUtility, CookiesStorageService, keyOrConfig, config);
}
export function SharedStorage(keyOrConfig, config) {
    return WebStorage(sharedStorageUtility, SharedStorageService, keyOrConfig, config);
}
function WebStorage(webStorageUtility, service, keyOrConfig, config) {
    if (config === void 0) { config = {}; }
    return function (target, propertyName) {
        var key;
        if (typeof keyOrConfig === 'object') {
            key = keyOrConfig.key;
            config = keyOrConfig;
        }
        else if (typeof keyOrConfig === 'string') {
            key = keyOrConfig;
        }
        key = key || config.key || propertyName;
        var cacheItem = Cache.getCacheFor({
            key: key,
            name: propertyName,
            targets: [target],
            services: [service],
            utilities: [{
                    utility: webStorageUtility,
                    config: config,
                }],
        });
        Object.defineProperty(target, propertyName, {
            get: function () {
                return cacheItem.getProxy(undefined, config);
            },
            set: function (value) {
                if (!Cache.get(cacheItem.key)) {
                    cacheItem = Cache.getCacheFor(cacheItem);
                }
                cacheItem.addTargets([target]);
                cacheItem.currentTarget = target;
                cacheItem.saveValue(value, config);
            },
        });
        return target;
    };
}
//# sourceMappingURL=webstorage.js.map