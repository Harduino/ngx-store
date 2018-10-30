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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { WebStorageService } from './webstorage.service';
import { localStorageUtility } from '../utility/index';
import { Injectable } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';
var LocalStorageService = /** @class */ (function (_super) {
    __extends(LocalStorageService, _super);
    function LocalStorageService() {
        var _this = _super.call(this, localStorageUtility) || this;
        _this._changes =
            merge(fromEvent(window, 'storage')
                .pipe(filter(function (event) { return event.storageArea === localStorage; }), map(function (event) { return _this.mapNativeEvent(event); })), localStorageUtility.changes);
        return _this;
    }
    LocalStorageService.keys = [];
    LocalStorageService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [])
    ], LocalStorageService);
    return LocalStorageService;
}(WebStorageService));
export { LocalStorageService };
//# sourceMappingURL=local-storage.service.js.map