import { useState } from "react";

type EmploymentType = "CDI" | "CDD" | "FREELANCE";

interface FormState {
  incomeMonthly: string;
  expensesMonthly: string;
  requestedAmount: string;
  existingDebt: string;
  employmentType: EmploymentType;
  age: string;
}

interface ScoreResult {
  score: number;
  decision: "ACCEPT" | "REVIEW" | "REJECT";
  reasons: string[];
}

const INITIAL_FORM: FormState = {
  incomeMonthly: "",
  expensesMonthly: "",
  requestedAmount: "",
  existingDebt: "",
  employmentType: "CDI",
  age: "",
};

const DECISION_STYLE: Record<ScoreResult["decision"], string> = {
  ACCEPT: "color: #16a34a",
  REVIEW: "color: #d97706",
  REJECT: "color: #dc2626",
};

export default function App() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      incomeMonthly: Number(form.incomeMonthly),
      expensesMonthly: Number(form.expensesMonthly),
      requestedAmount: Number(form.requestedAmount),
      existingDebt: Number(form.existingDebt),
      employmentType: form.employmentType,
      age: Number(form.age),
    };

    try {
      const res = await fetch("http://localhost:3000/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: unknown };
        throw new Error(JSON.stringify(body.error ?? `HTTP ${res.status}`));
      }

      const data = (await res.json()) as ScoreResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{ maxWidth: 520, margin: "48px auto", fontFamily: "sans-serif", padding: "0 16px" }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Credit Scoring</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field
          label="Revenu mensuel (€)"
          name="incomeMonthly"
          value={form.incomeMonthly}
          onChange={handleChange}
        />
        <Field
          label="Dépenses mensuelles (€)"
          name="expensesMonthly"
          value={form.expensesMonthly}
          onChange={handleChange}
        />
        <Field
          label="Montant demandé (€)"
          name="requestedAmount"
          value={form.requestedAmount}
          onChange={handleChange}
        />
        <Field
          label="Dette existante (€)"
          name="existingDebt"
          value={form.existingDebt}
          onChange={handleChange}
        />

        <label style={labelStyle}>
          Type d'emploi
          <select
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="FREELANCE">FREELANCE</option>
          </select>
        </label>

        <Field label="Âge" name="age" value={form.age} onChange={handleChange} />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: "10px 20px",
            background: loading ? "#94a3b8" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
          }}
        >
          {loading ? "Calcul en cours…" : "Calculer le score"}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 24,
            padding: 12,
            background: "#fee2e2",
            borderRadius: 6,
            color: "#991b1b",
          }}
        >
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Score :</strong> {result.score} / 100
          </p>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Décision :</strong>{" "}
            <span style={{ fontWeight: 700, ...parseStyle(DECISION_STYLE[result.decision]) }}>
              {result.decision}
            </span>
          </p>
          {result.reasons.length > 0 && (
            <>
              <strong>Raisons :</strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {result.reasons.map((r, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
          {result.reasons.length === 0 && (
            <p style={{ margin: 0, color: "#64748b" }}>Aucune pénalité appliquée.</p>
          )}
        </div>
      )}
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 14,
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  fontSize: 15,
};

function Field({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        required
        min={0}
        step="any"
        style={inputStyle}
      />
    </label>
  );
}

function parseStyle(styleStr: string): React.CSSProperties {
  const result: Record<string, string> = {};
  for (const part of styleStr.split(";")) {
    const [k, v] = part.split(":").map((s) => s.trim());
    if (k && v) {
      const camel = k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      result[camel] = v;
    }
  }
  return result;
}
