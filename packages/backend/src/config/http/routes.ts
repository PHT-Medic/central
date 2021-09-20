import {Application} from "express";
import {attachControllers} from "@decorators/express";
import {TokenController} from "../../app/controllers/auth/token";
import {RealmController} from "../../app/controllers/auth/realm/RealmController";
import {ProviderController} from "../../app/controllers/auth/provider/ProviderController";
import {UserController} from "../../app/controllers/auth/user";
import {UserKeyController} from "../../app/controllers/auth/user-key";
import {MasterImageController} from "../../app/controllers/pht/master-image/MasterImageController";
import {ProposalController} from "../../app/controllers/pht/proposal/ProposalController";
import {ProposalStationController} from "../../app/controllers/pht/proposal-station/ProposalStationController";
import {StationController} from "../../app/controllers/pht/station/StationController";
import {TrainController} from "../../app/controllers/pht/train/TrainController";
import {TrainFileController} from "../../app/controllers/pht/train-file/TrainFileController";
import {TrainStationController} from "../../app/controllers/pht/train-station/TrainStationController";
import {UserRoleController} from "../../app/controllers/auth/user-role";
import {RoleController} from "../../app/controllers/auth/role";
import {RolePermissionController} from "../../app/controllers/auth/role-permission";
import {ServiceController} from "../../app/controllers/service/ServiceController";
import {PermissionController} from "../../app/controllers/auth/permission/PermissionController";

export function registerControllers(router: Application) {
    attachControllers(router, [
        // Auth Controllers
        TokenController,
        RealmController,
        ProviderController,

        // Service
        ServiceController,

        PermissionController,
        RoleController,
        RolePermissionController,
        UserController,
        UserRoleController,
        UserKeyController,

        // PHT Controllers
        MasterImageController,
        ProposalController,
        ProposalStationController,
        StationController,
        TrainController,
        TrainFileController,
        TrainStationController,
    ]);

    return router;
}
