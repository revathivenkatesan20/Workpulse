import { useEffect } from "react";
import WOW from "wow.js";

function WOWAnimations() {
    useEffect(() => {
        const wow = new WOW({
            live: false,
        });

        wow.init();

        return () => {
            if (wow.stop) {
                wow.stop();
            }
        };
    }, []);

    return null;
}

export default WOWAnimations;