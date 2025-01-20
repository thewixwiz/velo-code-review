import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

export const serverAction = webMethod(
    Permissions.Anyone,
    async (message) => {
        console.log("server action started: ", message);
        await timeout(30 * 1000);
        await wixData.insert("Test", { title: "30" }, { suppressAuth: true });
        console.log("30 seconds");
        await timeout(30 * 1000);
        await wixData.insert("Test", { title: "60" }, { suppressAuth: true });
        console.log("60 seconds")
        await timeout(30 * 1000);
        await wixData.insert("Test", { title: "90" }, { suppressAuth: true });
        console.log("90 seconds")
        await timeout(30 * 1000);
        await wixData.insert("Test", { title: "120" }, { suppressAuth: true });
        console.log("120 seconds")
        await timeout(10 * 60 * 1000);
        console.log("I'm still running: ", message);
        return true;
    }
);

async function restart() {
    console.log("I'm still running");
    await timeout(30 * 1000);
    restart();
}

function timeout(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}