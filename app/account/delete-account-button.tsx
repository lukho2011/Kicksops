"use client";

import { useState } from "react";

import { deleteAccount } from "../../lib/supabase/data";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await deleteAccount("");
      // Session is ended server-side; go to login.
      window.location.href = "/login";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete account.");
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
      <h2 className="text-lg font-semibold text-rose-900">Delete account</h2>
      <p className="mt-1 text-sm text-rose-700">
        This permanently removes your login and profile. This cannot be undone.
      </p>

      {error ? <p className="mt-3 text-sm font-medium text-rose-800">{error}</p> : null}

      {confirming ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Yes, delete my account"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700"
        >
          Delete my account
        </button>
      )}
    </div>
  );
}
