export async function postHookRouteHandler(req: any, res: any) {
    console.log('Service with id: ' + req.serviceId + ' called hook route');
    console.log(req.body);

    res.status(200).end();
}
