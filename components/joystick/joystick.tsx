import { useEffect, useRef, useState } from "react";

export const JoyStick = (param: {
    moveCallback?: (x: number, y: number) => Promise<void>;
}) => {

    return (
        <Joystickinternal
            moveCallback={param.moveCallback}
        />
    );
};



function Joystickinternal({
    moveCallback
}:{
    moveCallback?: (x: number, y: number) => Promise<void>;
}) {
    const baseRef  = useRef<HTMLDivElement>(null)
    const stickRef = useRef<HTMLButtonElement>(null)
    const baseSize = 100

    useEffect(() => {
        const callback = () => {
            moveCallback(
                baseRef.current.clientLeft + baseSize /2,
                baseRef.current.clientTop + baseSize / 2
            )
        }
        const intv = setInterval(callback,100)
        return () => {clearInterval(intv)}

    },[baseRef])

    return (
        <div 
            ref={baseRef}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',

                height: `${baseSize}px`,
                width: `${baseSize}px`,
                borderRadius: `${baseSize / 2}px`,

                background: "#000",
                opacity: "0.5",

            }}
            >

            <button 
                ref={stickRef}
                style={{
                    background: "hwb(360 51% 76%)",
                    cursor: "move",

                    position: 'absolute',

                    height: `${baseSize / 1.5}px`,
                    width: `${baseSize / 1.5}px`,
                    borderRadius: `${baseSize / 3}px`,

                    border: 'none',
                    flexShrink: 0,
                    touchAction: 'none',
                    opacity: "0.5",
                }}
            />
        </div>
    );
}