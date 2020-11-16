import UserModel from "../../../domains/user/UserModel";
import UserEntity from "../../../domains/user/UserEntity";

export class Provider {
    public async loginWithCredentials(name: string, password: string) : Promise<UserEntity> {
        return await UserModel().verifyCredentials({
            name,
            password
        });
    }
}
