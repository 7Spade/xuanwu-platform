"use client";

import { useEffect, useState } from "react";
import { getFirebaseApp, resolvedFirebaseConfig } from "@/shared-infra/firebase/app";
import { initAppCheck } from "@/shared-infra/firebase/app-check";
import { getFirebaseAnalytics } from "@/shared-infra/firebase/analytics";
import { getFirebaseAuth } from "@/shared-infra/firebase/auth";
import { getFirestoreDb } from "@/shared-infra/firebase/firestore";
import { getFirebaseDatabase } from "@/shared-infra/firebase/database";
import { getFirebaseStorage } from "@/shared-infra/firebase/storage";
import {
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { dbRef, onValue } from "@/shared-infra/firebase/database";
import { ref as storageRef, listAll } from "@/shared-infra/firebase/storage";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServiceStatus = "pending" | "ok" | "error";

interface ServiceResult {
  status: ServiceStatus;
  detail?: string;
}

interface CheckResults {
  app: ServiceResult;
  appCheck: ServiceResult;
  analytics: ServiceResult;
  auth: ServiceResult;
  firestore: ServiceResult;
  database: ServiceResult;
  storage: ServiceResult;
}

// ---------------------------------------------------------------------------
// Status badge component
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ServiceStatus }) {
  const classes: Record<ServiceStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ok: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
  };
  const labels: Record<ServiceStatus, string> = {
    pending: "⏳ 檢查中…",
    ok: "✅ 正常",
    error: "❌ 錯誤",
  };
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${classes[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function ServiceRow({
  name,
  result,
}: {
  name: string;
  result: ServiceResult;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="flex-1">
        <p className="font-medium text-foreground">{name}</p>
        {result.detail && (
          <p
            className={`mt-0.5 text-sm ${result.status === "error" ? "text-red-600" : "text-muted-foreground"}`}
          >
            {result.detail}
          </p>
        )}
      </div>
      <StatusBadge status={result.status} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export function FirebaseCheckClient() {
  const [results, setResults] = useState<CheckResults>({
    app: { status: "pending" },
    appCheck: { status: "pending" },
    analytics: { status: "pending" },
    auth: { status: "pending" },
    firestore: { status: "pending" },
    database: { status: "pending" },
    storage: { status: "pending" },
  });

  function patch(key: keyof CheckResults, value: ServiceResult) {
    setResults((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    async function runChecks() {
      // 1. Firebase App init
      try {
        const app = getFirebaseApp();
        patch("app", {
          status: "ok",
          detail: `Project: ${app.options.projectId}`,
        });
      } catch (e) {
        patch("app", { status: "error", detail: String(e) });
        return; // No point continuing if the app failed
      }

      // 2. App Check
      try {
        const ac = initAppCheck();
        patch("appCheck", {
          status: ac ? "ok" : "error",
          detail: ac ? "reCAPTCHA Enterprise provider initialised" : "initAppCheck() returned null",
        });
      } catch (e) {
        patch("appCheck", { status: "error", detail: String(e) });
      }

      // 3. Analytics
      try {
        const analytics = await getFirebaseAnalytics();
        patch("analytics", {
          status: analytics ? "ok" : "error",
          detail: analytics
            ? `Measurement ID: ${resolvedFirebaseConfig.measurementId}`
            : "Analytics not supported in this environment",
        });
      } catch (e) {
        patch("analytics", { status: "error", detail: String(e) });
      }

      // 4. Auth – anonymous sign-in
      try {
        const auth = getFirebaseAuth();
        const credential = await signInAnonymously(auth);
        patch("auth", {
          status: "ok",
          detail: `Anonymous UID: ${credential.user.uid}`,
        });
      } catch (e) {
        patch("auth", { status: "error", detail: String(e) });
      }

      // 5. Firestore – try reading a test collection (permission-denied = connected)
      try {
        const db = getFirestoreDb();
        const snap = await getDocs(query(collection(db, "_connectivity_test"), limit(1)));
        patch("firestore", {
          status: "ok",
          detail: `Connected — docs: ${snap.size}`,
        });
      } catch (e: unknown) {
        const msg = String(e);
        // "permission-denied" means Firestore is reachable but Security Rules
        // blocked the read — the SDK and connection are working correctly.
        if (msg.includes("permission-denied") || msg.includes("PERMISSION_DENIED")) {
          patch("firestore", {
            status: "ok",
            detail: "Connected (read blocked by Security Rules — expected)",
          });
        } else {
          patch("firestore", { status: "error", detail: msg });
        }
      }

      // 6. Realtime Database – listen to .info/connected (special RTDB path)
      await new Promise<void>((resolve) => {
        try {
          const db = getFirebaseDatabase();
          const connectedRef = dbRef(db, ".info/connected");

          // `done` guards against settle() being called more than once.
          let done = false;
          const finalize = (result: ServiceResult) => {
            if (done) return;
            done = true;
            patch("database", result);
            resolve();
          };

          // `detach` is intentionally NOT called inside the onValue callbacks —
          // only the timeout below calls it. This avoids the temporal dead zone
          // that would occur if onValue fired its callback synchronously before
          // the `const detach = onValue(...)` assignment completed.
          const detach = onValue(
            connectedRef,
            (snap) =>
              finalize({
                status: "ok",
                detail: `Connected: ${snap.val() === true ? "true" : "false (offline mode)"}`,
              }),
            (err) => finalize({ status: "error", detail: String(err) }),
          );

          // Fallback timeout for network-restricted environments (CI sandboxes,
          // firewalled corporate networks) where the RTDB WebSocket is blocked.
          setTimeout(() => {
            detach();
            finalize({
              status: "error",
              detail: "Timeout — Realtime Database WebSocket unreachable (network restriction?)",
            });
          }, 8000);
        } catch (e) {
          patch("database", { status: "error", detail: String(e) });
          resolve();
        }
      });

      // 7. Storage – list root
      try {
        const storage = getFirebaseStorage();
        const rootRef = storageRef(storage, "/");
        await listAll(rootRef);
        patch("storage", { status: "ok", detail: "Root listing succeeded" });
      } catch (e: unknown) {
        const msg = String(e);
        if (msg.includes("storage/unauthorized") || msg.includes("unauthorized")) {
          patch("storage", {
            status: "ok",
            detail: "Connected (listing blocked by Security Rules — expected)",
          });
        } else {
          patch("storage", { status: "error", detail: msg });
        }
      }
    }

    void runChecks();
  }, []);

  const services: { key: keyof CheckResults; label: string }[] = [
    { key: "app", label: "Firebase App 初始化" },
    { key: "appCheck", label: "App Check (reCAPTCHA Enterprise)" },
    { key: "analytics", label: "Google Analytics for Firebase" },
    { key: "auth", label: "Firebase Authentication (匿名登入)" },
    { key: "firestore", label: "Cloud Firestore" },
    { key: "database", label: "Realtime Database" },
    { key: "storage", label: "Firebase Storage" },
  ];

  const allDone = Object.values(results).every((r) => r.status !== "pending");
  const hasErrors = Object.values(results).some((r) => r.status === "error");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Firebase 連線狀態檢查</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Project:{" "}
        <span className="font-mono">{resolvedFirebaseConfig.projectId}</span>
      </p>

      <div className="flex flex-col gap-3">
        {services.map(({ key, label }) => (
          <ServiceRow key={key} name={label} result={results[key]} />
        ))}
      </div>

      {allDone && (
        <div
          className={`mt-6 rounded-lg border p-4 text-sm font-medium ${
            hasErrors
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-green-300 bg-green-50 text-green-700"
          }`}
        >
          {hasErrors
            ? "⚠️ 部分服務連線失敗，請檢查 Firebase 主控台設定及 Security Rules。"
            : "🎉 所有 Firebase 服務連線正常！"}
        </div>
      )}
    </div>
  );
}
