export default function Navbar({action}) {
    return (
        <nav style = {style.title}>
            <div>PHARMAGENE</div>

            {action && 
                (<div style={style.action}>
                    {action}
                </div>)}

            <div style={style.borderline} />
        </nav>
    )
}

const style = {
    title: {
        display: 'flex',
        alignItems: "center",
        padding: "20px 20px",
        flexShrink: 0,
        position: "relative",
        zIndex: 100,
        backgroundColor: "var(--bg-color)",
        fontFamily: "var(--font-mono)",
        fontSize: 30,
        fontWeight: 600,
        color: "var(--text-color)",
        textShadow: "0px 2px 0px var(--cyan)"
    },

    action: {
        marginLeft: "auto"
    }, 

    borderline: {
        position: "absolute", 
        bottom: 0, 
        left: 0, 
        right: 0,
        height: 1,
        opacity: 0.5,
        pointerEvents: "none",
        backgroundColor: "white"
    }
}