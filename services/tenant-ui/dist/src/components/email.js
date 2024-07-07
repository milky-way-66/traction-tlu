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
exports.sendStatusEmail = exports.sendConfirmationEmail = exports.stringOrBooleanTruthy = void 0;
const config_1 = __importDefault(require("config"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const eta_1 = require("eta"); // HTML templating engine
const helpers_1 = require("../helpers");
const reservation_approved_tenant_1 = require("./email_templates/reservation_approved_tenant");
const reservation_declined_tenant_1 = require("./email_templates/reservation_declined_tenant");
const reservation_received_innkeeper_1 = require("./email_templates/reservation_received_innkeeper");
const reservation_received_tenant_1 = require("./email_templates/reservation_received_tenant");
const constants_1 = require("../helpers/constants");
const SERVER = config_1.default.get("server.smtp.server");
const PORT = config_1.default.get("server.smtp.port");
const FROM = config_1.default.get("server.smtp.senderAddress");
const SECURE = config_1.default.get("server.smtp.secure");
const USER = config_1.default.get("server.smtp.user");
const PASSWORD = config_1.default.get("server.smtp.password");
const INNKEEPER = config_1.default.get("server.smtp.innkeeperInbox");
const eta = new eta_1.Eta();
/**
 * @function stringOrBooleanTruthy
 * Returns true if the value is a string "true" or a boolean true, returns false otherwise
 * @returns {boolean}
 */
function stringOrBooleanTruthy(value) {
    return value === 'true' || value === true;
}
exports.stringOrBooleanTruthy = stringOrBooleanTruthy;
/**
 * @function sendConfirmationEmail
 * Send the preconfigured emails when a reservation is created
 * @returns {string} The inkeeper token
 */
const sendConfirmationEmail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: SERVER,
            port: PORT,
            secure: stringOrBooleanTruthy(SECURE),
            auth: {
                user: USER,
                pass: PASSWORD,
            },
        });
        req.body.serverUrlStatusRouteAutofill = (0, helpers_1.buildStatusAutofill)(req.body);
        const tenantHtml = eta.renderString(reservation_received_tenant_1.RESERVATION_RECIEVED_TENANT_TEMPLATE, req);
        // Send a confirmation email to the person doing the reservation
        yield transporter.sendMail({
            from: FROM,
            to: req.body.contactEmail,
            subject: "[TRACTION] Reservation Received",
            html: tenantHtml, // html body
        });
        const innkeeperHtml = eta.renderString(reservation_received_innkeeper_1.RESERVATION_RECIEVED_INNKEEPER_TEMPLATE, req);
        // Send a notification email to the Innkeeper team
        yield transporter.sendMail({
            from: FROM,
            to: INNKEEPER,
            subject: `[TRACTION] Reservation Request - ${req.body.contactName}`,
            html: innkeeperHtml, // html body
        });
    }
    catch (error) {
        console.error(`Error sending email: ${error}`);
        throw error;
    }
});
exports.sendConfirmationEmail = sendConfirmationEmail;
/**
 * @function sendStatusEmail
 * Send the preconfigured emails as part of the reservation flow
 * @returns {string} The inkeeper token
 */
const sendStatusEmail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: SERVER,
            port: PORT,
            secure: stringOrBooleanTruthy(SECURE),
            auth: {
                user: USER,
                pass: PASSWORD,
            },
        });
        let template;
        let subject;
        if (req.body.state === constants_1.RESERVATION_STATUSES.APPROVED) {
            template = reservation_approved_tenant_1.RESERVATION_APPROVED_TENANT_TEMPLATE;
            subject = "[TRACTION] Reservation Approved!";
            req.body.serverUrlStatusRouteAutofill = (0, helpers_1.buildStatusAutofill)(req.body);
        }
        else if (req.body.state === constants_1.RESERVATION_STATUSES.DENIED) {
            template = reservation_declined_tenant_1.RESERVATION_DECLINED_TENANT_TEMPLATE;
            subject = "[TRACTION] Reservation Declined!";
        }
        else {
            throw Error(`Unsupported reservation state: ${req.body.state}`);
        }
        const tenantHtml = eta.renderString(template, req);
        // Send a status update email to the applicant
        yield transporter.sendMail({
            from: FROM,
            to: req.body.contactEmail,
            subject,
            html: tenantHtml, // html body
        });
    }
    catch (error) {
        console.error(`Error sending email: ${error}`);
        throw error;
    }
});
exports.sendStatusEmail = sendStatusEmail;
