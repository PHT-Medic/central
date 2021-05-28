import {Router} from 'express';
import {
    addProviderRoute,
    authorizeCallbackRoute,
    authorizeUrlRoute, dropProviderRoute, editProviderRoute,
    getProviderRoute,
    getProvidersRoute
} from "../../app/controllers/auth/provider/ProviderController";
import {
    addRealmRoute,
    dropRealmRoute,
    editRealmRoute,
    getRealmRoute,
    getRealmsRoute
} from "../../app/controllers/auth/realm/RealmController";
import {forceLoggedIn} from "../../modules/http/request/middleware/authMiddleware";
import {getRealmStationRouteHandler} from "../../app/controllers/auth/realm/station/RealmStationController";

export default function setupAuthRoutes() {
    let router = Router();

    router.get('/providers/:id/uri', [], authorizeUrlRoute);
    router.get('/providers/:id/callback',[], authorizeCallbackRoute);

    router.delete('/providers/:id', [forceLoggedIn], dropProviderRoute);
    router.post('/providers/:id', [forceLoggedIn], editProviderRoute);
    router.get('/providers/:id', getProviderRoute);

    router.post('/providers', [forceLoggedIn], addProviderRoute);
    router.get('/providers', getProvidersRoute);

    //----------------------------------------------------------

    router.get('/realms/:id/station', [forceLoggedIn], (req: any, res: any) => {
        return getRealmStationRouteHandler(req,res,'related');
    });

    router.delete('/realms/:id', [forceLoggedIn], dropRealmRoute);
    router.post('/realms/:id', [forceLoggedIn], editRealmRoute);
    router.get('/realms/:id', getRealmRoute);

    router.post('/realms', [forceLoggedIn], addRealmRoute);
    router.get('/realms', getRealmsRoute);

    return router;
};
