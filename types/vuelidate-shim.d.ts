// the individual validators to import
declare module 'vuelidate/lib/validators' {
    /** Accepts only alphabet characters. */
    function alpha(value: any): boolean
    /** Accepts only alphanumerics. */
    function alphaNum(value: any): boolean
    /** Checks if a number is in specified bounds. Min and max are both inclusive. */
    function between(min: number, max: number): (value: any) => boolean
    /** Accepts valid email addresses. Keep in mind you still have to carefully verify it on your server, as it is impossible to tell if the address is real without sending verification email. */
    function email(value: any): boolean
    /** Requires the input to have a maximum specified length, inclusive. Works with arrays. */
    function maxLength(max: number): (value: any) => boolean
    /** Requires the input to have a minimum specified length, inclusive. Works with arrays. */
    function minLength(min: number): (value: any) => boolean
    /** Requires non-empty data. Checks for empty arrays and strings containing only whitespaces. */
    function required(value: any): boolean
    /** Checks for equality with a given property. Locator might be either a sibling property name or a function, that will get your component as this and nested model which sibling properties under second parameter. */
    function sameAs(locator: string): (value: any, vm?: any) => boolean

    // stripped these down to just any[] to keep this first attempt simple
    /** Passes when at least one of provided validators passes. */
    function or(...validators: any[]): () => boolean
    /** Passes when all of provided validators passes. */
    function and(...validators: any[]): () => boolean

    // new validators since @mrellipse's version, need comments/verification of params/types
    function numeric(value: any): boolean
    function ipAddress(value: any): boolean
    function macAddress(separator?: string): (value: any) => boolean
    function requiredIf(locator: string): (value: any, vm?: any) => boolean
    function requiredUnless(locator: string): (value: any, vm?: any) => boolean
    function url(value: any): boolean
    function minValue(min: number): (value: any) => boolean
    function maxValue(max: number): (value: any) => boolean
}
