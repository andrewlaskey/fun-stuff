import { App } from "./control/App";

const app = new App(document, '#canvas');

app.preload().then(() => {
    console.log('preload complete');
    app.manager.start();
}).catch((e) => {
    console.error('failed to start app', e);
});