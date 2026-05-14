import { useEffect, useState } from "react";
import { getStats } from "./services/api";

type Stats = {
  tourism: {
    visitors: number;
    topDestination: string;
  };
  carbon: {
    co2OffsetKg: number;
    treesPlanted: number;
  };
  energy: {
    renewablePercentage: number;
    hydroPowerDominance: boolean;
  };
  conservation: {
    protectedAreas: number;
    wildlifeSpeciesTracked: number;
  };
};

function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => {
        console.error("Failed to load stats", err);
        setError("Failed to load stats from API");
      });
  }, []);

  return (
    <div
      style={{
        padding: 24,
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background:
          "linear-gradient(135deg, #0f172a 0%, #0b1120 40%, #022c22 100%)",
        color: "#e5e7eb",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Smart Zambia – Green Economy Snapshot
        </h1>
        <p style={{ opacity: 0.8, fontSize: 14 }}>
          Tourism · Carbon · Renewable Energy · Conservation
        </p>
      </header>

      {error && (
        <div
          style={{
            background: "#b91c1c",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {!stats ? (
        <p style={{ opacity: 0.8 }}>Loading ecosystem data…</p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {/* Tourism */}
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(8, 47, 73, 0.95), rgba(30, 64, 175, 0.9))",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Tourism Impact
            </h2>
            <p style={{ fontSize: 28, fontWeight: 800 }}>
              {stats.tourism.visitors.toLocaleString("en-US")}
            </p>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              visitors (period snapshot)
            </p>
            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Top destination:{" "}
              <span style={{ fontWeight: 600 }}>
                {stats.tourism.topDestination}
              </span>
            </p>
          </section>

          {/* Carbon */}
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(22, 163, 74, 0.9))",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Carbon & Forests
            </h2>
            <p style={{ fontSize: 24, fontWeight: 800 }}>
              {(stats.carbon.co2OffsetKg / 1000).toFixed(1)} t CO₂
            </p>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              offset (equivalent)
            </p>
            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Trees protected / planted:{" "}
              <span style={{ fontWeight: 600 }}>
                {stats.carbon.treesPlanted.toLocaleString("en-US")}
              </span>
            </p>
          </section>

          {/* Energy */}
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 64, 175, 0.9))",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Renewable Energy
            </h2>
            <p style={{ fontSize: 28, fontWeight: 800 }}>
              {stats.energy.renewablePercentage}%
            </p>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              of mix powered by renewables
            </p>
            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Hydro dominant:{" "}
              <span style={{ fontWeight: 600 }}>
                {stats.energy.hydroPowerDominance ? "Yes" : "No"}
              </span>
            </p>
          </section>

          {/* Conservation */}
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(20, 83, 45, 0.95), rgba(22, 163, 74, 0.9))",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Conservation
            </h2>
            <p style={{ fontSize: 24, fontWeight: 800 }}>
              {stats.conservation.protectedAreas}
            </p>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              protected areas
            </p>
            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Wildlife species tracked:{" "}
              <span style={{ fontWeight: 600 }}>
                {stats.conservation.wildlifeSpeciesTracked}
              </span>
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
