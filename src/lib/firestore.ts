import { db, rtdb } from "@/lib/firebase";
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp, runTransaction, Timestamp,
} from "firebase/firestore";
import { ref, set, onValue, off } from "firebase/database";

export const collections = {
  users: "users",
  drivers: "drivers",
  vehicles: "vehicles",
  bookings: "bookings",
  bookingSecrets: "bookingSecrets",
  payments: "payments",
  ratings: "ratings",
  complaints: "complaints",
  offers: "offers",
  fareSettings: "fareSettings",
  notifications: "notifications",
  adminUsers: "adminUsers",
  driverLocations: "driverLocations",
};

export async function getUserDoc(uid: string) {
  if (!db) return null;
  const snap = await getDoc(doc(db, collections.users, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setUserDoc(uid: string, data: any) {
  if (!db) return;
  await setDoc(doc(db, collections.users, uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getDriverDoc(uid: string) {
  if (!db) return null;
  const snap = await getDoc(doc(db, collections.drivers, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setDriverDoc(uid: string, data: any) {
  if (!db) return;
  await setDoc(doc(db, collections.drivers, uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getFareSettings() {
  if (!db) return null;
  const snap = await getDoc(doc(db, collections.fareSettings, "config"));
  return snap.exists() ? snap.data() : null;
}

export async function saveFareSettings(data: any) {
  if (!db) return;
  await setDoc(doc(db, collections.fareSettings, "config"), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function createBooking(data: any) {
  if (!db) throw new Error("Firebase not configured");
  const ref = await addDoc(collection(db, collections.bookings), {
    ...data,
    status: "searching",
    createdAt: serverTimestamp(),
  });
  // store OTP in separate secrets doc (customer-only readable via rules)
  if (data.otp) {
    await setDoc(doc(db, collections.bookingSecrets, ref.id), {
      otp: data.otp,
      customerId: data.customerId,
      createdAt: serverTimestamp(),
    });
  }
  return ref.id;
}

export function listenBooking(bookingId: string, cb: (b: any) => void) {
  if (!db) return () => {};
  return onSnapshot(doc(db, collections.bookings, bookingId), (snap) => {
    if (snap.exists()) cb({ id: snap.id, ...snap.data() });
  });
}

export function listenSearchingBookings(category: string, cb: (list: any[]) => void) {
  if (!db) return () => {};
  // Only filter by status (avoids composite index requirement); filter by category client-side
  const q = query(collection(db, collections.bookings), where("status", "==", "searching"));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const filtered = category ? all.filter((b: any) => b.category === category) : all;
    cb(filtered);
  }, (err) => {
    console.error("listenSearchingBookings error:", err);
    cb([]);
  });
}

export async function acceptBooking(bookingId: string, driverId: string) {
  if (!db) throw new Error("Firebase not configured");
  const ref = doc(db, collections.bookings, bookingId);
  return runTransaction(db, async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists()) throw new Error("Booking not found");
    const b = snap.data();
    if (b.status !== "searching") throw new Error("Already assigned");
    t.update(ref, { driverId, status: "assigned", assignedAt: serverTimestamp() });
    return true;
  });
}

export async function updateBooking(bookingId: string, patch: any) {
  if (!db) return;
  await updateDoc(doc(db, collections.bookings, bookingId), { ...patch, updatedAt: serverTimestamp() });
}

export function listenDriverLocation(driverId: string, cb: (loc: { lat: number; lng: number } | null) => void) {
  if (!rtdb || !driverId) return () => {};
  const r = ref(rtdb, `driverLocations/${driverId}`);
  const unsub = onValue(r, (snap) => {
    const v = snap.val();
    cb(v ? { lat: v.lat, lng: v.lng } : null);
  });
  return () => off(r);
}

export async function pushDriverLocation(driverId: string, lat: number, lng: number) {
  if (!rtdb) return;
  await set(ref(rtdb, `driverLocations/${driverId}`), { lat, lng, updatedAt: Date.now() });
}

export async function verifyOtpClient(bookingId: string, otp: string, customerId: string) {
  // Client-side verification: read secret doc (customer-only). Driver cannot read → for production use Cloud Function.
  // Fallback: compare against booking doc otp field (readable by assigned driver).
  if (!db) return false;
  const bSnap = await getDoc(doc(db, collections.bookings, bookingId));
  if (!bSnap.exists()) return false;
  const b = bSnap.data();
  if (String(b.otp) === String(otp)) return true;
  // try secrets doc (will fail for driver, ok)
  try {
    const sSnap = await getDoc(doc(db, collections.bookingSecrets, bookingId));
    if (sSnap.exists() && String(sSnap.data().otp) === String(otp)) return true;
  } catch {}
  return false;
}

export async function listCustomers() {
  if (!db) return [];
  const snap = await getDocs(collection(db, collections.users));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listDrivers() {
  if (!db) return [];
  const snap = await getDocs(collection(db, collections.drivers));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listBookings() {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, collections.bookings), orderBy("createdAt", "desc"), limit(100)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function approveDriver(driverId: string, status: "approved" | "rejected" | "suspended") {
  if (!db) return;
  await updateDoc(doc(db, collections.drivers, driverId), { status, updatedAt: serverTimestamp() });
}

export async function listOffers() {
  if (!db) return [];
  const snap = await getDocs(collection(db, collections.offers));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveOffer(offer: any) {
  if (!db) return;
  if (offer.id) await setDoc(doc(db, collections.offers, offer.id), offer, { merge: true });
  else await addDoc(collection(db, collections.offers), offer);
}
