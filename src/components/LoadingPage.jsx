import { useState, useEffect } from "react";

const MSG = [
    "ANALYZING YOUR DATA.",
    "ANALYZING YOUR DATA..",
    "ANALYZING YOUR DATA..."
]

export default function LoadingPage() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const id = setInterval(() => {
            setIndex(prev => (prev + 1) % MSG.length)
        }, 1000)

        return () => clearInterval(id)
    }, [])

    return (
        <div style={style.page}>
            <div style={style.content}> 
                <div style={style.text}>
                    {MSG[index]}
                </div>
            </div>            
        </div>
    )
}

const style = {
    page: {
        position: "absolute",
        top:0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--bg-color)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
    },

    content: {
        flex: 1,
        display: "flex",
        marginTop: "10%",
        padding: "0 20px"
    },

    text: {
        fontSize: 20,
        color: "var(--cyan)",
        fontFamily: "var(--font-mono)",
        fontWeight: 500
    }
}
