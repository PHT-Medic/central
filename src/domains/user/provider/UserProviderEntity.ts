export interface UserProviderEntity {
    id: number,
    user_id: number,
    provider_id: string,
    provider_user_id: string,
    provider_user_name: string,
    access_token?: string | null,
    refresh_token?: string | null,
    expires_in?: string | null,
    created_at?: string | null,
    updated_at?: string | null
}

export default UserProviderEntity;
