import {Application} from "express";
import {attachControllers} from "@decorators/express";
import {TokenController} from "../../app/controllers/auth/token";
import {RealmController} from "../../app/controllers/auth/realm";
import {ProviderController} from "../../app/controllers/auth/provider";
import {UserController} from "../../app/controllers/auth/user";
import {UserKeyController} from "../../app/controllers/auth/user-key";
import {MasterImageController} from "../../app/controllers/pht/master-image";
import {ProposalController} from "../../app/controllers/pht/proposal";
import {ProposalStationController} from "../../app/controllers/pht/proposal-station";
import {StationController} from "../../app/controllers/pht/station";
import {TrainController} from "../../app/controllers/pht/train";
import {TrainFileController} from "../../app/controllers/pht/train-file";
import {TrainStationController} from "../../app/controllers/pht/train-station";
import {UserRoleController} from "../../app/controllers/auth/user-role";
import {RoleController} from "../../app/controllers/auth/role";
import {RolePermissionController} from "../../app/controllers/auth/role-permission";
import {ServiceController} from "../../app/controllers/service";
import {PermissionController} from "../../app/controllers/auth/permission";

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
