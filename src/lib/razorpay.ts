export function getRazorpayKey() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}

export function isRazorpayConfigured() {
  return Boolean(getRazorpayKey());
}

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export async function openRazorpayCheckout(opts: { amount: number; name: string; description: string; onSuccess: (res: any) => void; onFailure?: () => void }) {
  const ok = await loadRazorpay();
  if (!ok || !isRazorpayConfigured()) {
    // Demo mode: simulate success
    setTimeout(() => opts.onSuccess({ razorpay_payment_id: "pay_demo_" + Date.now(), razorpay_order_id: "order_demo", razorpay_signature: "sig_demo" }), 800);
    return;
  }
  const rzp = new (window as any).Razorpay({
    key: getRazorpayKey(),
    amount: opts.amount * 100,
    currency: "INR",
    name: "INDIA TRIP",
    description: opts.description,
    handler: (res: any) => opts.onSuccess(res),
    modal: { ondismiss: () => opts.onFailure?.() },
  });
  rzp.open();
}
