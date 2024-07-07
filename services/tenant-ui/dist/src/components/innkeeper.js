"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservation = exports.login = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("config"));
const TRACURL = config_1.default.get("server.tractionUrl");
const INN_USER = config_1.default.get("server.innkeeper.user");
const INN_PW = config_1.default.get("server.innkeeper.key");
/**
 * @function login
 * Use the configured Inkeeper Admin key to get the token
 * @returns {string} The inkeeper token
 */
const login = () => __awaiter(void 0, void 0, void 0, function* () {
    const loginUrl = `${TRACURL}/multitenancy/tenant/${INN_USER}/token`;
    const payload = { wallet_key: INN_PW };
    const res = yield (0, axios_1.default)({
        method: "post",
        url: loginUrl,
        data: payload,
    });
    return res.data;
});
exports.login = login;
/**
 * @function createReservation
 * Create a reservation in Traction
 * @returns {object} the reservation object
 */
const createReservation = (req, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = `Bearer ${token}`;
        const reservationUrl = `${TRACURL}/innkeeper/reservations`;
        const payload = req.body;
        const res = yield (0, axios_1.default)({
            method: "post",
            url: reservationUrl,
            data: payload,
            headers: {
                Authorization: auth,
            },
        });
        return res.data;
    }
    catch (error) {
        return error;
    }
});
exports.createReservation = createReservation;
