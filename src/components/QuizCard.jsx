import { useState } from 'react'

export default function QuizCard({ quiz }) {
    const [selected, setSelected] = useState(null)

    const answered = selected !== null
    const isCorrect = selected === quiz.correctIndex

    function handleAnswer(index) {
        if (answered) return 
        setSelected(index)
    }

    function getButtonState(index) {
        if (!answered) return 'idle'
        if (index === quiz.correctIndex) return 'correct'
        if (index === selected) return 'wrong'
        return 'idle'
    }

    return (
        <div style={style.card}>
    
        {/* ── Question Header ── */}
        <div style={style.header}>
            <div style={style.questionLabel}>Question:</div>
            <div style={style.questionText}>{quiz.question}</div>
        </div>
    
        {/* ── Answer Options ── */}
        <div style={style.optionsList}>
            {quiz.options.map((optionText, i) => {
            const btnState = getButtonState(i)
    
            return (
                <button
                key={i}
                // Style changes based on btnState (idle / correct / wrong)
                style={style.optionButton(btnState)}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                // disabled prevents clicks AND removes cursor:pointer
                >
                {optionText}
                </button>
            )
            })}
        </div>
    
        {/* ── Feedback ── */}
        {/* Only renders after the user has answered */}
        {answered && (
            <div style={style.feedback(isCorrect)}>
            {isCorrect
                ? `✓ Correct! ${quiz.explanation}`
                : `✗ Incorrect. The right answer was: "${quiz.options[quiz.correctIndex]}". ${quiz.explanation}`
            }
            </div>
        )}
    
        </div>
    )
}

const style = {
  card: {
    background: "rgba(99, 100, 134, 0.5)",
    border: '1px solid var(--cyan)',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    animation: 'fadein 0.4s ease',
  },
  header: {
    background: 'rgba(136, 183, 230, 0.37)',
    padding: '14px 20px',
    borderBottom: '1px solid var(--text-color)',
  },
  questionLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-color)',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 14,
    color: 'var(--text-color)',
    marginTop: 6,
    lineHeight: 1.5,
    fontFamily: "var(--font-display)",
  },
  optionsList: {
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
 
  // optionButton is a function — returns different style per state
  optionButton: (state) => ({
    background: state === 'correct'
      ? 'rgba(74, 222, 128, 0.15)'     // green tint for correct
      : state === 'wrong'
      ? 'rgba(255, 79, 106, 0.12)'     // red tint for wrong
      : 'rgba(0, 229, 212, 0.08)',     // subtle cyan for idle
 
    border: `1px solid ${
      state === 'correct' ? 'var(--cyan)'
      : state === 'wrong' ? 'var(--danger)'
      : 'rgba(0, 229, 212, 0.2)'
    }`,
 
    borderRadius: 8,
    padding: '12px 18px',
 
    color: state === 'correct'
      ? 'var(--text-color)'
      : state === 'wrong'
      ? 'var(--danger)'
      : 'var(--text-input-box)',
 
    fontSize: 14,
    textAlign: 'left',
    width: '100%',
    fontFamily: 'var(--font-mono)',
    cursor: state !== 'idle' ? 'default' : 'pointer',
    transition: 'all 0.2s',
  }),
 
  // feedback is a function — color changes based on correct/wrong
  feedback: (correct) => ({
    padding: '10px 20px 16px',
    fontSize: 13,
    lineHeight: 1.5,
    color: correct ? 'var(--cyan)' : 'var(--danger)',
    borderTop: '1px solid var(--cyan)',
    fontFamily: "var(--font-mono)",
  }),
}