export type TokenPayload = {
    /**
     * owner id
     */
    sub: number | string,

    /**
     * issuer (api address)
     */
    iss: string,
    /**
     * remote address
     */
    remoteAddress: string
}
