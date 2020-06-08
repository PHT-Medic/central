import dotenv from 'dotenv';
dotenv.config();

//--------------------------------------------------------------------
// Express Server
//--------------------------------------------------------------------
import http from 'http';
import express from 'express';

const expressApp = express();

let httpServer = new http.Server(expressApp);

// Payload parser
import bodyParser from 'body-parser';
expressApp.use(bodyParser.urlencoded({extended: false}));
expressApp.use(bodyParser.json());

// Cookie parser
import cookieParser from 'cookie-parser';
expressApp.use(cookieParser());

expressApp.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Loading routes
import router from './services/router';
router.registerRoutes(expressApp);

//--------------------------------------------------------------------
// Start Server
//--------------------------------------------------------------------
httpServer.listen(process.env.PORT,() => {
    console.log('Listening on port: '+ process.env.PORT);
});
