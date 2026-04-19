import { useState } from 'react'
import QuizCard from './QuizCard'

export default function ResultPage({ result, onNavigate }) {
    
    const [showQuiz, setQuiz] = useState(false)

    return (
        <div style={style.page}>
            <div style={style.content}>

                <div style={style.metHeader}>
                     {result.metabolizerType}
                </div>

                <div style={style.summaryBlock}>
                    <div style={style.summaryRow}>
                        <div style={style.col}>
                            <span style={style.colHeader}>Gene</span>
                            <span style={style.colValue}>{result.gene}</span>
                        </div> 

                        <div style={style.col}>
                            <span style={style.colHeader}>Variant</span>
                            <span style={style.colValue}>{result.variant}</span>
                        </div>

                        <div style={style.col}>
                            <span style={style.colHeader}>Allele</span>
                            <span style={style.colValue}>{result.allele}</span>
                        </div>
                    </div>

                    <div>
                        <span style={style.colHeader}>Medication</span>
                        <span style={style.medValue}>{result.medication}</span>
                    </div>
                </div>

                <div style={style.actions}>
                    <button style={style.resultBtn} onClick={() => onNavigate('detail')}>
                        See result
                    </button>

                    <button style={style.quizBtn} onClick={() => setQuiz(prev => !prev)}>
                        {showQuiz ? 'Hide Quiz' : 'Quiz'}
                    </button>
                </div>
                
                {showQuiz && result.quiz && (
                    <QuizCard quiz={result.quiz} />
                )}
            </div>
        </div>
    )
}

const style = {
    page: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg-color)",
    },

    content: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 20,
        padding: "32px 32px 40px",
        width: "40%",
        position: "relative",
        zIndex: 10,
    },

    metHeader: {
        background: "var(--navy)",
        borderRadius: 10,
        padding: "14px 50px",
        animation: "fadein 0.5s ease",
        fontFamily: "var(--font-mono)",
        fontSize: 30,
        fontWeight: "bold",
        letterSpacing: 2,
        color: "var(--text-color)",
        textAlign: "center",
        width: "100%",
    },

    summaryBlock: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        animation: "fadein 0.4s ease 0.05s both",
        width: "100%",
    },

    summaryRow: {
        display: "flex",
        gap: 32,
    },

    col: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "flex-start",
    },

    colHeader: {
        fontFamily: "var(--font-mono)",
        fontSize: 25,
        fontWeight: 700,
        color: "var(--text-color)",
        letterSpacing: 1,
    },

    colValue: {
        fontSize: 25,
        color: "var(--text-color)",
        fontFamily: "var(--font-mono)",
        fontWeight: 100,
    },

    medValue: {
        marginLeft: 25,
        fontSize: 25,
        color: "var(--text-color)",
        fontFamily: "var(--font-mono)",
        fontWeight: 100,
    },

    actions: {
        display: "flex",
        gap: 12,
        animation: "fadein 0.4s ease 0.1s both",
        width: "100%"
    },

    resultBtn: {
        background: "var(--cyan)",
        color: "var(--text-color)",
        border: "1px solid var(--cyan)",
        borderRadius: 35,
        fontFamily: "var(--font-mono)",
        fontSize: 26,
        fontWeight: "bold",
        padding: "10px 28px",
        cursor: "pointer",
        width: "50%",
    },

    quizBtn: {
        background: "transparent",
        color: "var(--cyan)",
        border: "1px solid var(--cyan)",
        borderRadius: 35,
        fontFamily: "var(--font-mono)",
        fontSize: 26,
        padding: "10px 28px",
        cursor: "pointer",
        width: "50%",
    },
}