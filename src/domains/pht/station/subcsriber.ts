import {EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent} from "typeorm";
import {Station} from "./index";
import {
    ensureHarborProject,
    ensureHarborWebHook,
    removeHarborProject, removeStationPublicKeyFromVault,
    saveStationPublicKeyToVault
} from "../../../modules/pht/harbor/api";

async function ensureServiceData(entity: Station, withHarbor: boolean = true) {
    try {
        await saveStationPublicKeyToVault(entity);
    } catch (e) {
        console.log('vault api not updatable...');
    }

    try {
        await ensureHarborProject(entity);
    } catch (e) {
        console.log('harbor project already exists or is not reachable...');
    }

    try {
        await ensureHarborWebHook(entity);
    } catch (e) {
        console.log('harbor project webhook could not be created...');
    }
}

async function removeServiceData(entity: Station) {
    try {
        await removeStationPublicKeyFromVault(entity);
    } catch (e) {
        console.log('vault api not removable...')
    }

    try {
        await removeHarborProject(entity);
    } catch (e) {
        console.log('harbor project could not be removed...');
    }
}

@EventSubscriber()
export class StationSubscriber implements EntitySubscriberInterface {
    listenTo(): Function | string {
        return Station;
    }

    afterInsert(event: InsertEvent<Station>) {
        ensureServiceData(event.entity)
            .catch(e => console.log(e));
    }

    afterUpdate(event: UpdateEvent<Station>): Promise<any> | void {
        ensureServiceData(event.entity, false)
            .catch(e => console.log(e));
    }

    beforeRemove(event: RemoveEvent<Station>) {
        removeServiceData(event.entity)
            .catch(e => console.log(e));
    }
}
