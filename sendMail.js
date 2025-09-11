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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendMail;
var nodemailer_1 = require("nodemailer");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
// Create reusable transporter
var transporter = nodemailer_1.default.createTransport({
    service: "gmail", // or any SMTP service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
function sendMail(body) {
    return __awaiter(this, void 0, void 0, function () {
        var activeSiteDocking, blindDocking, createdAt, ligandTarget, proteinTarget, userEmail, userId, htmlContent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    activeSiteDocking = body.activeSiteDocking, blindDocking = body.blindDocking, createdAt = body.createdAt, ligandTarget = body.ligandTarget, proteinTarget = body.proteinTarget, userEmail = body.userEmail, userId = body.userId;
                    htmlContent = "\n            <div style=\"font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;\">\n                <div style=\"max-width: 600px; background: white; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);\">\n                    <div style=\"background: linear-gradient(90deg, #4e54c8, #8f94fb); padding: 20px; text-align: center; color: white;\">\n                        <h1 style=\"margin: 0; font-size: 22px;\">Docking Request Details</h1>\n                    </div>\n                    <div style=\"padding: 20px;\">\n                        <p style=\"font-size: 15px; color: #333;\">Hello, here are the details of the docking request:</p>\n                        <table style=\"width: 100%; border-collapse: collapse;\">\n                            <tr style=\"background-color: #f8f9fa;\">\n                                <td style=\"padding: 10px; font-weight: bold;\">Active Site Docking</td>\n                                <td style=\"padding: 10px;\">".concat(activeSiteDocking === "no" ? "No" : "Yes", "</td>\n                            </tr>\n                            <tr>\n                                <td style=\"padding: 10px; font-weight: bold;\">Blind Docking</td>\n                                <td style=\"padding: 10px;\">").concat(blindDocking === "no" ? "No" : "Yes", "</td>\n                            </tr>\n                            <tr style=\"background-color: #f8f9fa;\">\n                                <td style=\"padding: 10px; font-weight: bold;\">Protein Target</td>\n                                <td style=\"padding: 10px;\">").concat(proteinTarget, "</td>\n                            </tr>\n                            <tr>\n                                <td style=\"padding: 10px; font-weight: bold;\">Ligand Target</td>\n                                <td style=\"padding: 10px;\">").concat(ligandTarget, "</td>\n                            </tr>\n                            <tr style=\"background-color: #f8f9fa;\">\n                                <td style=\"padding: 10px; font-weight: bold;\">Created At</td>\n                                <td style=\"padding: 10px;\">").concat(createdAt, "</td>\n                            </tr>\n                            <tr>\n                                <td style=\"padding: 10px; font-weight: bold;\">User Email</td>\n                                <td style=\"padding: 10px;\">").concat(userEmail, "</td>\n                            </tr>\n                            <tr style=\"background-color: #f8f9fa;\">\n                                <td style=\"padding: 10px; font-weight: bold;\">User ID</td>\n                                <td style=\"padding: 10px;\">").concat(userId, "</td>\n                            </tr>\n                        </table>\n                    </div>\n                    <div style=\"background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 13px; color: #777;\">\n                        \u00A9 ").concat(new Date().getFullYear(), " Docking Platform. All rights reserved.\n                    </div>\n                </div>\n            </div>\n        ");
                    // Send email
                    return [4 /*yield*/, transporter.sendMail({
                            from: "\"Docking Platform\" <".concat(process.env.NEXT_EMAIL, ">"),
                            to: "pthreedatabase@gmail.com",
                            subject: "Docking Request Submitted",
                            html: htmlContent,
                        })];
                case 1:
                    // Send email
                    _a.sent();
                    console.log("Email sent successfully to: pthreedatabase@gmail.com");
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to send email:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
