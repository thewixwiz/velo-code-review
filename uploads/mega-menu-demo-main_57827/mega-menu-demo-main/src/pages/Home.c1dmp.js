import { serverAction } from 'backend/test';

$w.onReady(function () {

    $w("#testButton").onClick(async () => {
        console.log("testing");
        const result = await serverAction("hello world");
        console.log("result", result);
    })

});