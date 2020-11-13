import Vue from 'vue';
import {CookieSerializeOptions, parse as parseCookie, serialize as serializeCookie} from 'cookie';
import {Context} from "@nuxt/types";
import {decodeValue, encodeValue, isSet, isUnset} from "~/modules/storage/utils";
import {StorageOptionsInterface} from "~/modules/storage/types";

export default class BaseStorage {
    public ctx: Context
    public options: StorageOptionsInterface;
    public state : {[key: string] : any} = {};

    // ------------------------------------

    constructor (ctx: Context, options: StorageOptionsInterface) {
        this.ctx = ctx
        this.options = options;
        this.initState();
    }

    // ------------------------------------

    getKeyWithNamespace(key: string) : string {
        let fullKey: string = '';

        if(typeof this.options.namespace !== 'undefined') {
            fullKey += this.options.namespace+'_';
        }

        return fullKey+key;
    }

    // ------------------------------------
    // Universal
    // ------------------------------------

    set (key: string, value: any) {
        // Unset null, undefined
        if (isUnset(value)) {
            console.log('Unset key:'+key)
            return this.remove(key)
        }

        this.setState(key,value);

        this.setCookie(key, value)

        this.setLocalStorageItem(key, value);

        this.setSessionStorageItem(key, value);

        return value
    }

    get (key: string) {
        let value : any = this.getState(key);

        // Cookies
        if (isUnset(value)) {
            value = this.getCookie(key);
        }

        // Local Storage
        if (isUnset(value)) {
            value = this.getLocalStorageItem(key);
        }

        if(isUnset(value)) {
            value = this.getSessionStorageItem(key);
        }

        if (isUnset(value)) {
            value = this.getState(key)
        }

        return value
    }

    getAll() {
        let value : any = {};
        let storageValue : any;

        storageValue = this.getCookies();
        if(storageValue) {
            value = {...value, ...storageValue}
        }

        storageValue = this.getLocalStorageItems();
        if(storageValue) {
            value = {...value, ...storageValue}
        }

        storageValue = this.getSessionStorageItems();
        if(storageValue) {
            value = {...value, ...storageValue}
        }

        return value;
    }

    sync (key: string, defaultValue?: any) {
        let value = this.get(key)

        if (isUnset(value) && isSet(defaultValue)) {
            value = defaultValue
        }

        if (isSet(value)) {
            this.set(key, value)
        }

        return value
    }

    remove (key: string) {
        this.removeState(key);
        this.removeSessionStorageItem(key);
        this.removeLocalStorageItem(key)
        this.removeCookie(key)
    }

    // ------------------------------------
    // State
    // ------------------------------------

    initState() {
        Vue.set(this, 'state', {});
    }

    setState<T>(key: string, value: T) : T {
        Vue.set(this.state, key, value);

        return value;
    }

    getState(key: string) {
        return this.state[key];
    }

    removeState(key: string) {
        this.setState(key, undefined);
    }

    // ------------------------------------
    // Browser Storage
    // ------------------------------------

    getBrowserStorageItems(type: 'sessionStorage' | 'localStorage') {
        let storage : any;
        switch (type) {
            case 'sessionStorage':
                storage = sessionStorage;
                break;
            case 'localStorage':
                storage = localStorage;
                break;
        }

        if (typeof storage === 'undefined' || !this.options[type]) {
            return;
        }

        let items : {[key: string] : any} = {},
            keys = Object.keys(storage),
            i = keys.length;

        while ( i-- ) {
            let key = keys[i];
            if(typeof this.options.namespace !== "undefined") {
                if(key.substr(0, this.options.namespace.length) !== this.options.namespace) {
                    continue;
                }

                key = key.replace(this.options.namespace+'_', '');
            }

            items[key] = decodeValue(storage.getItem(keys[i]));
        }

        return items;
    }

    // ------------------------------------
    // Local storage
    // ------------------------------------

    setLocalStorageItem (key: string, value: any) {
        // Unset null, undefined
        if (isUnset(value)) {
            return this.removeLocalStorageItem(key)
        }

        if (typeof localStorage === 'undefined' || !this.options.localStorage) {
            return
        }

        const _key = this.getKeyWithNamespace(key);

        try {
            localStorage.setItem(_key, encodeValue(value))
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                throw e
            }
        }

        return value
    }

    getLocalStorageItem (key: string) : any {
        if (typeof localStorage === 'undefined' || !this.options.localStorage) {
            return
        }

        const _key = this.getKeyWithNamespace(key);

        const value = localStorage.getItem(_key)

        return decodeValue(value)
    }

    getLocalStorageItems() : any {
        return this.getBrowserStorageItems('localStorage');
    }

    removeLocalStorageItem (key: string) {
        if (typeof localStorage === 'undefined' || !this.options.localStorage) {
            return
        }

        const _key = this.getKeyWithNamespace(key);
        localStorage.removeItem(_key)
    }

    // ------------------------------------
    // Session storage
    // ------------------------------------

    setSessionStorageItem (key: string, value: any) {
        // Unset null, undefined
        if (isUnset(value)) {
            return this.removeSessionStorageItem(key)
        }

        if (typeof sessionStorage === 'undefined' || !this.options.sessionStorage) {
            return
        }

        const _key = this.getKeyWithNamespace(key);

        try {
            sessionStorage.setItem(_key, encodeValue(value))
        } catch (e) {
            throw e;
        }

        return value
    }

    getSessionStorageItem (key: string) {
        if (typeof sessionStorage === 'undefined' || !this.options.sessionStorage) {
            return
        }

        const _key = this.getKeyWithNamespace(key);

        const value = sessionStorage.getItem(_key)

        return decodeValue(value)
    }

    getSessionStorageItems() : any {
        return this.getBrowserStorageItems('sessionStorage');
    }

    removeSessionStorageItem (key: string) {
        if (typeof sessionStorage === 'undefined' || !this.options.sessionStorage) {
            return
        }

        const _key = this.getKeyWithNamespace(key);
        sessionStorage.removeItem(_key)
    }

    // ------------------------------------
    // Cookies
    // ------------------------------------
    getCookies () {
        const cookieStr = process.client
            ? document.cookie
            : this.ctx.req.headers.cookie

        let items : {[key: string] : any} = decodeValue(parseCookie(cookieStr || '') || {});
        for(let key in items) {
            items[key] = decodeValue(decodeURIComponent(items[key]));
        }

        return items;
    }

    setCookie (key: string, value: any) {
        if (!this.options.cookie || (process.server && !this.ctx.res)) {
            return
        }

        const _key = this.getKeyWithNamespace(key);
        const _options = <CookieSerializeOptions> Object.assign({}, this.options.cookie);
        const _value = encodeValue(value)

        // Unset null, undefined
        if (isUnset(value)) {
            _options.maxAge = -1
        }

        const serializedCookie = serializeCookie(_key, _value, _options);

        console.log(serializedCookie);

        if (process.client) {
            // Set in browser
            document.cookie = serializedCookie
        } else if (process.server && this.ctx.res) {
            // Send Set-Cookie header from server side
            let cookies = this.ctx.res.getHeader('Set-Cookie') || [];
            if(typeof cookies === 'number' || typeof cookies === 'string') {
                if(typeof cookies === 'number') {
                    cookies = cookies.toString();
                }
                cookies = [cookies];
            }

            cookies.unshift(serializedCookie);

            this.ctx.res.setHeader('Set-Cookie', cookies.filter((v, i, arr) => arr.findIndex(val => val.startsWith(v.substr(0, v.indexOf('=')))) === i));
        }

        return value
    }

    getCookie (key: string) {
        if (!this.options.cookie || (process.server && !this.ctx.req)) {
            return
        }

        const _key = this.getKeyWithNamespace(key);

        const cookies = this.getCookies()

        return cookies[_key] ?? undefined;
    }

    removeCookie (key: string) {
        this.setCookie(key, undefined)
    }
}

export function createStorage(ctx: Context, options: StorageOptionsInterface) {
    return new BaseStorage(ctx, options);
}
