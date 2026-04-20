export default function ResultDetails({ result }) {
  return (
    <div style={styles.page}>
      <div style={styles.content}>

        {/* ── Metabolizer type badge ── */}
        <div style={styles.metHeader}>
          <div style={styles.metTitle}>{result.metabolizerType}</div>
          <div style={styles.metBadge}>
            {result.metabolizerTypeShort} — {result.gene}
          </div>
        </div>

        {/* ── Input summary ── */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryTitle}>Input Summary</div>
          <div style={styles.summaryGrid}>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Gene</span>
              <span style={styles.summaryValue}>{result.gene}</span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Variant</span>
              <span style={{ ...styles.summaryValue, fontFamily: 'var(--font-mono)' }}>
                {result.variant}
              </span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Allele</span>
              <span style={{ ...styles.summaryValue, fontFamily: 'var(--font-mono)' }}>
                {result.allele}
              </span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Medication</span>
              <span style={styles.summaryValue}>{result.medication}</span>
            </div>

          </div>
        </div>

        {/* ── Clinical recommendation ── */}
        <div style={styles.detailCard}>
          <div style={styles.cardLabel}>Clinical Recommendation</div>
          <div style={styles.cardText}>{result.recommendation}</div>
        </div>

        {/* ── Mechanism ── */}
        <div style={styles.detailCard}>
          <div style={styles.cardLabel}>Mechanism</div>
          <div style={styles.cardText}>{result.mechanism}</div>
        </div>

      </div>
    </div>
  )
}

// Styles
const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: "var(--bg-color)",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: '32px 32px 48px',
    width: '50%',
    maxWidth: "680px",
    position: 'relative',
    zIndex: 10,
  },

  // Metabolizer header
  metHeader: {
    background: 'linear-gradient(135deg, #0d2044 0%, #112254 100%)',
    borderRadius: 10,
    padding: '16px 28px',
    animation: 'fadein 0.35s ease',
  },
  metTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-color)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  metBadge: {
    display: 'inline-block',
    color: 'var(--cyan)',
    fontFamily: 'var(--font-mono)',
    fontSize: 20,
    padding: '4px 12px',
  },

  // Input summary card
  summaryCard: {
    padding: '20px 24px',
  },
  summaryTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-color)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',  
    gap: '14px 32px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-color)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    color: 'var(--text-input-box)',
    fontFamily: "var(--font-mono)",
    fontWeight: 100,
  },

  // Detail cards (recommendation + mechanism)
  detailCard: {
    padding: '20px 24px',
    animation: 'fadein 0.4s ease 0.1s both',
  },
  cardLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-color)',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  cardText: {
    color: 'var(--text-color)',
    fontSize: 15,
    lineHeight: 1.8,
    fontFamily: "var(--font-mono)",
  },
}