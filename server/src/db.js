import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Shared default database of the wurb-dashboards project. This app only ever
// touches the tv_* collections; everything else in there belongs to WURB.
if (!getApps().length) initializeApp();

export const db = getFirestore();

export const profiles = db.collection("tv_profiles");
export const picks = db.collection("tv_picks");
export const entries = db.collection("tv_entries");
