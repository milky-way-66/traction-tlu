"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStatusAutofill = void 0;
/**
 * @function buildStatusAutofill
 * Format the reservation status return url with autofil params
 * @param {String} value The body from the email endpoint
 * @returns {String} The URL (env/check-status?email=X&id=Y)
 */
function buildStatusAutofill(requestBody) {
    if (requestBody && requestBody.serverUrlStatusRoute) {
        return encodeURI(`${requestBody.serverUrlStatusRoute}?email=${requestBody.contactEmail}&id=${requestBody.reservationId}`);
    }
    else {
        return "";
    }
}
exports.buildStatusAutofill = buildStatusAutofill;
