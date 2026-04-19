export default function ResultDetails({ result, onBack }) {
  return (
    <div style={styles.page}>
      <div style={styles.content}>

        {/* ── Back button ── */}
        <button style={styles.btnBack} onClick={onBack}>
          ← Back
        </button>

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

// ── Styles ────────────────────────────────────
const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: '32px 32px 48px',
    width: '60%',
    maxWidth: 680,
    position: 'relative',
    zIndex: 10,
  },

  // Back button
  btnBack: {
    alignSelf: 'flex-start',   // ← only as wide as its text
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    padding: '6px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    marginBottom: 4,
  },

  // Metabolizer header
  metHeader: {
    background: 'linear-gradient(135deg, #0d2044 0%, #112254 100%)',
    border: '1px solid var(--border-glow)',
    borderRadius: 10,
    padding: '20px 28px',
    animation: 'fadeSlideUp 0.35s ease',
  },
  metTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--cyan)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  metBadge: {
    display: 'inline-block',
    background: 'var(--cyan-dim)',
    border: '1px solid var(--cyan-dark)',
    color: 'var(--cyan)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    padding: '4px 12px',
    borderRadius: 4,
  },

  // Input summary card
  summaryCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '20px 24px',
    animation: 'fadeSlideUp 0.4s ease 0.05s both',
  },
  summaryTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',  // ← 2 columns
    gap: '14px 32px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    color: 'var(--text-primary)',
  },

  // Detail cards (recommendation + mechanism)
  detailCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '20px 24px',
    animation: 'fadeSlideUp 0.4s ease 0.1s both',
  },
  cardLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--cyan)',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  cardText: {
    color: 'var(--text-secondary)',
    fontSize: 15,
    lineHeight: 1.8,
  },
}