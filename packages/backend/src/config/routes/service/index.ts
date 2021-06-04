import {Router} from "express";
import {setupHarborRoutes} from "./harbor";

export default function setupServiceRoutes() {
    let router = Router();

    router.use('/harbor', setupHarborRoutes());

    return router;
}
