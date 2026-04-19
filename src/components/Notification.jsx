import { useEffect } from "react"

export default function Notification({msg, type = "info", onClose}) {

    useEffect(() => {
        if (!msg || type !== "info") return 

        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [msg, type, onClose]);

    if (!msg) return null;

    const style = {
        noti: {
            position: "fixed",
            bottom: 20,
            right: 24,
            background: type === 'error' ? 'var(--danger-light)' : 'var(--purple)',
            border: `1px solid ${type === 'error' ? 'var(--danger)' : 'var(--magenta)'}`,
            borderRadius: 10,

            color: "var(--text-color)",
            padding: "12px 20px",
            fontSize: 14,
            zIndex: 1000,
            animation: "fadein 1s ease-out",
            fontFamily: "var(--font-mono)",
            maxWidth: "60%",
        }
    };

    return (
        <div style={style.noti}>
            {msg}
        </div>
    );
}

