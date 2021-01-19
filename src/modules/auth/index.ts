export interface PermissionInterface {
    id: number,
    name: string,
    condition: any,
    scope: any,
    power: number | undefined
}

export function getExpirationDate(expiresIn: number | string) {
    if(typeof expiresIn !== 'number') {
        expiresIn = Number.parseInt(expiresIn, 10);
    }

    return new Date(Date.now() + expiresIn * 1000);
}
