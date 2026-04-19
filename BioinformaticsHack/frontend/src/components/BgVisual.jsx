import bgpic from '../assets/bg.png'

export default function BgVisual() {
    const style = {
        bgpic: {
            height: "50%",
            right: 0,
            position: "absolute",
            top: 56,
            width: "50%",
            objectFit: "cover",
            objectPosition:"right-center",
            pointerEvents: "none",
            zIndex: 10
        }
    }

    return (
        <img src={bgpic} alt="" style={style.bgpic} />
    )
}