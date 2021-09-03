import { Item } from "./model";

export const radarName =
  process.env.REACT_APP_RADAR_NAME || "Technology Radar";
export const radarNameShort = radarName;

export const quadrants = [
  "elt",
  "storage-and-compute",
  "quality-and-discovery",
  "orchestration-and-observability"
];

export const rings = ["all", "adopt", "trial", "assess", "hold"] as const;

export type Ring = typeof rings[number];

export const getItemPageNames = (items: Item[]) =>
  items.map((item) => `${item.quadrant}/${item.name}`);

export const showEmptyRings = false;

const messages: { [k: string]: string } = {
  "elt": "Extraction, Load & Transform",
  "storage-and-compute": "Storage & Compute",
  "quality-and-discovery": "Quality & Discovery",
  "orchestration-and-observability": "Orchestration & Observability"
};

export const translate = (key: string) => messages[key] || "-";

export function isMobileViewport() {
  // return false for server side rendering
  if (typeof window == "undefined") return false;

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  return width < 1200;
}

export function assetUrl(file: string) {
  return process.env.PUBLIC_URL + "/" + file;
}
