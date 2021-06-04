declare module 'cookieparser' {
    export let maxLength: number;
    export function parse(cookie: string) : {[key: string]: string };
}
