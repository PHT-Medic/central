import {Arguments, Argv, CommandModule} from "yargs";
import {createSecurityKeyPair} from "../../security";

interface AuthSetupArguments extends Arguments {
    security: 'create' | 'refresh' | 'none'
}

export class AuthSetupCommand implements CommandModule {
    command = "auth:setup";
    describe = "Run auth setup.";

    builder(args: Argv) {
        return args
            .option("security", {
                alias: "s",
                default: "create",
                describe: "Create security rsa keys.",
                choices: ["create", "refresh", "none"]
            })
    }

    async handler(args: AuthSetupArguments, exitProcess: boolean = true) {
        switch (args.security) {
            case "create":
                createSecurityKeyPair();
                break;
        }

        if(exitProcess) {
            process.exit(0);
        } else {
            return;
        }
    }
}
