const { app, BrowserWindow } = require(`electron`);

let window;

app.on(`ready`, () => {
    window = new BrowserWindow({
        title: `Lungers Chat`,
        minWidth: 950,
        minHeight: 575,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    window.setMenu(null);
    window.loadFile(`./public/index.html`);

    window.on(`closed`, () => {
        window = null;
    });
});

app.on(`window-all-closed`, () => {
    if (process.platform !== `darwin`) {
        app.quit();
    }
});
