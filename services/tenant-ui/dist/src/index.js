"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const router_1 = require("./routes/router");
const PORT = parseInt(config_1.default.get("server.port"), 10);
const APIROOT = config_1.default.get("server.apiPath");
const STATIC_FILES_PATH = config_1.default.get("server.staticFiles");
var history = require('connect-history-api-fallback');
const app = (0, express_1.default)();
app.use(history());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Host the static frontend assets
app.use("/favicon.ico", (_, res) => {
    res.redirect("/favicon.ico");
});
app.use("/", express_1.default.static(path_1.default.join(__dirname, STATIC_FILES_PATH)));
// Since the server config can have important secret values in, you must opt-in
// for server values (or other non FE config) that should return from /config
function _setupConfig() {
    return {
        frontend: config_1.default.get("frontend"),
        image: config_1.default.get("image"),
        server: {
            tractionUrl: config_1.default.get("server.tractionUrl"),
        },
    };
}
// Frontend configuration endpoint, return config section at /config so UI can get it
app.use("/config", (_, res, next) => {
    try {
        res.status(200).json(_setupConfig());
    }
    catch (err) {
        next(err);
    }
});
app.get('/hello-world', (req, res) => {
    res.send('Hello World!');
});
// This service's api endpoints
app.use(APIROOT, router_1.router);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on port ${PORT}`);
});
