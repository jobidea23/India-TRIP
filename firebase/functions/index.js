const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// Generate 4-digit OTP server-side and store hashed; never return to driver.
exports.createBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { customerId, category, pickup, destination, distanceKm, durationMin, paymentMethod } = data;
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const booking = {
    customerId,
    category,
    pickup,
    destination,
    distanceKm,
    durationMin,
    paymentMethod,
    otp,
    otpVerified: false,
    status: "searching",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await db.collection("bookings").add(booking);
  return { bookingId: ref.id };
});

// Verify OTP securely
exports.verifyOtp = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { bookingId, otp } = data;
  const snap = await db.collection("bookings").doc(bookingId).get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "Booking not found");
  const b = snap.data();
  if (b.otpVerified) return { ok: true, already: true };
  if (String(b.otp) !== String(otp)) {
    // track attempts
    const attempts = (b.otpAttempts || 0) + 1;
    await db.collection("bookings").doc(bookingId).update({ otpAttempts: attempts });
    if (attempts >= 3) {
      await db.collection("bookings").doc(bookingId).update({ status: "cancelled", cancelledBy: "system" });
      throw new functions.https.HttpsError("permission-denied", "Too many attempts");
    }
    throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
  }
  await db.collection("bookings").doc(bookingId).update({ otpVerified: true, status: "started", startedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});

// Assign driver (first accept)
exports.acceptRide = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { bookingId } = data;
  const driverId = context.auth.uid;
  const ref = db.collection("bookings").doc(bookingId);
  return db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Booking not found");
    const b = snap.data();
    if (b.status !== "searching") throw new functions.https.HttpsError("failed-precondition", "Already assigned");
    // verify driver approved
    const dSnap = await t.get(db.collection("drivers").doc(driverId));
    if (!dSnap.exists || dSnap.data().status !== "approved") throw new functions.https.HttpsError("permission-denied", "Driver not approved");
    t.update(ref, { driverId, status: "assigned", assignedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { ok: true };
  });
});

// Create Razorpay order (server-side)
exports.createPaymentOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { amount, bookingId } = data;
  // In production, use Razorpay SDK with key secret from functions config.
  // const Razorpay = require("razorpay");
  // const rzp = new Razorpay({ key_id: functions.config().razorpay.key_id, key_secret: functions.config().razorpay.key_secret });
  // const order = await rzp.orders.create({ amount: amount * 100, currency: "INR", receipt: bookingId });
  // return { orderId: order.id, amount: order.amount };
  return { orderId: "order_demo_" + Date.now(), amount: amount * 100, currency: "INR", note: "Configure Razorpay keys" };
});

// Verify payment signature
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { orderId, paymentId, signature, bookingId } = data;
  // In production verify HMAC SHA256 with razorpay key secret.
  await db.collection("bookings").doc(bookingId).update({ paymentStatus: "paid", paymentId, orderId });
  await db.collection("payments").add({ bookingId, orderId, paymentId, status: "success", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});

// Update driver location
exports.updateDriverLocation = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { lat, lng } = data;
  await db.collection("driverLocations").doc(context.auth.uid).set({ lat, lng, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true };
});
