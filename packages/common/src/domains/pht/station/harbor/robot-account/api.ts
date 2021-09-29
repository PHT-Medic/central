import {buildStationHarborProjectName} from "../../../../../config";
import {
    dropHarborProjectAccount,
    ensureHarborProjectRobotAccount,
    findHarborRobotAccount,
    HarborRobotAccount
} from "../../../../service";

export async function findStationHarborProjectRobotAccount(id: string | number, withSecret: boolean = true): Promise<HarborRobotAccount | undefined> {
    const name: string = buildStationHarborProjectName(id);

    return await findHarborRobotAccount(name, withSecret);
}

export async function ensureStationHarborProjectRobotAccount(id: string | number): Promise<HarborRobotAccount> {
    const name: string = buildStationHarborProjectName(id);

    return await ensureHarborProjectRobotAccount(name);
}

export async function dropStationHarborProjectRobotAccount(id: string | number): Promise<void> {
    const robotAccount = await findStationHarborProjectRobotAccount(id, false);

    if (typeof robotAccount === 'undefined') {
        return;
    }

    await dropHarborProjectAccount(robotAccount.id);
}
