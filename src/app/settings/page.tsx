"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<any>(null);

  const [form, setForm] = useState({
    q: "",
    naics: "",
    psc: "",
    setaside: "",
    agency: "",
    includeWords: "",
    excludeWords: "",
    muteAgencies: "",
    muteTerms: "",
  });

  async function loadPrefs(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "failed to load preferences");
        setPrefs(null);
      } else {
        setPrefs(data);
        // populate form if search exists
        if (data.search) {
          setForm({
            q: data.search.q || "",
            naics: Array.isArray(data.search.naics) ? data.search.naics.join(",") : String(data.search.naics || ""),
            psc: Array.isArray(data.search.psc) ? data.search.psc.join(",") : String(data.search.psc || ""),
            setaside: Array.isArray(data.search.setaside) ? data.search.setaside.join(",") : String(data.search.setaside || ""),
            agency: data.search.agency || "",
            includeWords: data.search.includeWords || "",
            excludeWords: data.search.excludeWords || "",
            muteAgencies: Array.isArray(data.search.muteAgencies) ? data.search.muteAgencies.join(",") : "",
            muteTerms: Array.isArray(data.search.muteTerms) ? data.search.muteTerms.join(",") : "",
          });
        }
      }
    } catch (err: any) {
      setMessage(String(err?.message || err));
      setPrefs(null);
    } finally {
      setLoading(false);
    }
  }

  async function savePrefs(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);
    if (!prefs || prefs.plan !== "paid") {
      setMessage("Saving preferences requires a paid plan. Visit billing to upgrade.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        email,
        q: form.q,
        naics: form.naics,
        psc: form.psc,
        setaside: form.setaside,
        agency: form.agency,
        includeWords: form.includeWords,
        excludeWords: form.excludeWords,
        muteAgencies: form.muteAgencies.split(",").map((s) => s.trim()).filter(Boolean),
        muteTerms: form.muteTerms.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "failed to save preferences");
      } else {
        setMessage("Preferences saved");
        setPrefs(data);
      }
    } catch (err: any) {
      setMessage(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "32px auto", padding: 16 }}>
      <h1>Manage Preferences</h1>
      <p>Enter your account email to load and (if paid) save alert preferences.</p>

      <form onSubmit={loadPrefs} style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
            required
          />
        </label>
        <div>
          <button type="submit" disabled={loading} style={{ marginRight: 8 }}>
            {loading ? "Loading…" : "Load preferences"}
          </button>
        </div>
      </form>

      {message && <div style={{ marginBottom: 12, color: "#b91c1c" }}>{message}</div>}

      {prefs && (
        <div style={{ border: "1px solid #e5e7eb", padding: 12, borderRadius: 6 }}>
          <p>
            <strong>Plan:</strong> {prefs.plan}
          </p>
          <p>
            <strong>User ID:</strong> {String(prefs.userId)}
          </p>

          <form onSubmit={savePrefs}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Query (q)
              <input
                value={form.q}
                onChange={(e) => setForm({ ...form, q: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              NAICS (comma-separated)
              <input
                value={form.naics}
                onChange={(e) => setForm({ ...form, naics: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              PSC (comma-separated)
              <input
                value={form.psc}
                onChange={(e) => setForm({ ...form, psc: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Setaside (comma-separated)
              <input
                value={form.setaside}
                onChange={(e) => setForm({ ...form, setaside: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Agency
              <input
                value={form.agency}
                onChange={(e) => setForm({ ...form, agency: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Include words
              <input
                value={form.includeWords}
                onChange={(e) => setForm({ ...form, includeWords: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Exclude words
              <input
                value={form.excludeWords}
                onChange={(e) => setForm({ ...form, excludeWords: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Mute agencies (comma-separated)
              <input
                value={form.muteAgencies}
                onChange={(e) => setForm({ ...form, muteAgencies: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Mute terms (comma-separated)
              <input
                value={form.muteTerms}
                onChange={(e) => setForm({ ...form, muteTerms: e.target.value })}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
              />
            </label>

            <div style={{ marginTop: 12 }}>
              <button type="submit" disabled={loading || prefs.plan !== "paid"}>
                {loading ? "Saving…" : "Save preferences"}
              </button>
              {prefs.plan !== "paid" && <span style={{ marginLeft: 12 }}>Upgrade to a paid plan to save settings.</span>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
