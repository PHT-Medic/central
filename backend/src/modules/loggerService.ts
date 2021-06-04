import thirdPartyLogger from 'pino';

const LoggerService = thirdPartyLogger({
    name: 'auth',
    level: "debug",
    prettyPrint: true
});

export default LoggerService;


