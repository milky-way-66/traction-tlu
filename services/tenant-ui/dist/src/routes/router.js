"use strict";
// The default router for the Tenant UI backend
// Expand on this (or add other router files) if the TenantUI backend should do much more business actions
// other than serving the static files and proxying to Traction
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("config"));
const emailComponent = __importStar(require("../components/email"));
const innkeeperComponent = __importStar(require("../components/innkeeper"));
const express_oauth_jwt_1 = require("express-oauth-jwt");
const express_validator_1 = require("express-validator");
const jose_1 = require("jose");
const jwksService = (0, jose_1.createRemoteJWKSet)(new URL(config_1.default.get("server.oidc.jwksUri")));
exports.router = express_1.default.Router();
exports.router.use(express_1.default.json());
// Protected reservation endpoint
exports.router.get("/heath-check", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = 'ok';
        res.status(200).send(result);
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
// For the secured innkeepr OIDC login request to verify the token and get a token from Traction
exports.router.get("/innkeeperLogin", (0, express_oauth_jwt_1.secure)(jwksService), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate JWT from OIDC login before moving on
        // The realm access check below is pretty Keycloak specific
        // It's a TODO later to see how this could be a more generic OIDC claim
        console.log(req.claims);
        if (req.claims.realm_access &&
            req.claims.realm_access.roles &&
            req.claims.realm_access.roles.includes(config_1.default.get("server.oidc.roleName"))) {
            const result = yield innkeeperComponent.login();
            res.status(200).send(result);
        }
        else {
            res.status(403).send();
        }
    }
    catch (error) {
        console.error(`Error logging in: ${error}`);
        next(error);
    }
}));
// Protected reservation endpoint
exports.router.post("/innkeeperReservation", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get innkeeper token from login method
        const { token } = yield innkeeperComponent.login();
        const result = yield innkeeperComponent.createReservation(req, token);
        res.status(201).send(result);
    }
    catch (error) {
        next(error);
    }
}));
// Email endpoint
exports.router.post("/email/reservationConfirmation", (0, express_validator_1.body)("contactEmail").isEmail(), (0, express_validator_1.body)("reservationId").not().isEmpty(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const result = yield emailComponent.sendConfirmationEmail(req);
        res.send(result);
    }
    catch (error) {
        next(error);
    }
}));
exports.router.post("/email/reservationStatus", (0, express_validator_1.body)("contactEmail").isEmail(), (0, express_validator_1.body)("reservationId").not().isEmpty(), (0, express_validator_1.body)("state").not().isEmpty(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const result = yield emailComponent.sendStatusEmail(req);
        res.send(result);
    }
    catch (error) {
        next(error);
    }
}));
