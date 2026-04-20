import { useEffect } from "react"

export default function Notification({msg, type = "info", onClose}) {

    useEffect(() => {
        if (!msg) return
        const duration = type === 'warning' ? 6000 : type === 'info' ? 3000 : null
        if (!duration) return
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [msg, type, onClose]);

    if (!msg) return null;

    const bgColor  = type === 'error'   ? 'var(--danger-light)'        :
                     type === 'warning' ? 'rgba(230, 168, 23, 0.15)'   :
                     'var(--purple)'
    const bdColor  = type === 'error'   ? 'var(--danger)'              :
                     type === 'warning' ? '#e6a817'                    :
                     'var(--magenta)'

    const style = {
        noti: {
            position: "fixed",
            bottom: 20,
            right: 24,
            background: bgColor,
            border: `1px solid ${bdColor}`,
            borderRadius: 10,
            color: type === 'warning' ? '#e6a817' : 'var(--text-color)',
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

