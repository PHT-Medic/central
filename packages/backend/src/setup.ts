import {setupSecurity} from "./modules/auth/security/setup";
import {setupDatabase} from "./db/setup";

function setup() {
    setupSecurity();
    setupDatabase();
}

setup();
