import { ConfigHelper } from './config.helper';
// TODO allow to set different config for local and session storage
// TODO check if NGXSTORE_CONFIG implements WebStorageConfigInterface
// TODO allow to set configuration in node-config (`config` on npm)
export { CONFIG_PREFIX } from './config.helper';
var DefaultConfig = {
    prefix: 'ngx_',
    previousPrefix: 'angular2ws_',
    clearType: 'prefix',
    mutateObjects: true,
    cookiesScope: '',
    cookiesCheckInterval: 0,
    debugMode: false,
};
var ConfigFills = {};
var localStoragePrefix = ConfigHelper.getItem('prefix');
if (typeof NGXSTORE_CONFIG === 'object') {
    ConfigFills = Object.assign({}, NGXSTORE_CONFIG);
}
if (localStoragePrefix !== undefined && localStoragePrefix !== null) {
    ConfigFills.previousPrefix = localStoragePrefix;
}
else if (ConfigFills.previousPrefix === undefined) {
    ConfigFills.previousPrefix = DefaultConfig.previousPrefix;
}
// merge default config, deprecated config and global config all together
export var Config = Object.assign({}, DefaultConfig, ConfigFills);
export var debug = console;
//# sourceMappingURL=config.js.map