export interface AuthUserEntity {
    id?: number,
    name: string,
    email?: string,
    password?: string,
    created_at?: string | number,
    updated_at?: string | number
}

export default AuthUserEntity;
