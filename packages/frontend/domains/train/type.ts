export enum TrainCommand {
    BUILD_START = 'buildStart',
    BUILD_STOP = 'buildStop',
    BUILD_STATUS = 'buildStatus',

    RUN_STATUS = 'runStatus',
    RUN_START = 'runStart',
    RUN_STOP = 'runStop',

    RESULT_STATUS = 'resultStatus',
    RESULT_START = 'resultStart',
    RESULT_STOP = 'resultStop',

    // special command
    RESULT_DOWNLOAD = 'resultDownload',

    GENERATE_HASH = 'generateHash'
}
