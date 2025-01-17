"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetUrl = exports.isMobileViewport = exports.translate = exports.showEmptyRings = exports.getItemPageNames = exports.rings = exports.quadrants = exports.radarNameShort = exports.radarName = void 0;
exports.radarName = process.env.REACT_APP_RADAR_NAME || "Technology Radar";
exports.radarNameShort = exports.radarName;
exports.quadrants = [
    "elt",
    "storage-and-compute",
    "quality-and-discovery",
    "orchestration-and-observability"
];
exports.rings = ["all", "adopt", "trial", "assess", "hold"];
var getItemPageNames = function (items) {
    return items.map(function (item) { return item.quadrant + "/" + item.name; });
};
exports.getItemPageNames = getItemPageNames;
exports.showEmptyRings = false;
var messages = {
    "elt": "Extraction, Load & Transform",
    "storage-and-compute": "Storage & Compute",
    "quality-and-discovery": "Quality & Discovery",
    "orchestration-and-observability": "Orchestration & Observability"
};
var translate = function (key) { return messages[key] || "-"; };
exports.translate = translate;
function isMobileViewport() {
    // return false for server side rendering
    if (typeof window == "undefined")
        return false;
    var width = window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
    return width < 1200;
}
exports.isMobileViewport = isMobileViewport;
function assetUrl(file) {
    return process.env.PUBLIC_URL + "/" + file;
}
exports.assetUrl = assetUrl;
