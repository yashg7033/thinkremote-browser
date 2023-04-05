"use client"

import React, { useEffect, useRef, useState } from "react";
import video_desktop from "../public/assets/videos/video_demo_desktop.mp4";
import styled from "styled-components";
import {
    TurnOnStatus,
} from "../components/popup/popup";
import { WebRTCClient } from "../core/src/app";
import { useRouter, useSearchParams  } from "next/navigation";
import {
    AddNotifier,
    EventMessage,
} from "../core/src/utils/log";
import { WebRTCControl } from "../components/control/control";
import {
    getPlatform,
    Platform,
} from "../core/src/utils/platform";
import SbCore from "../supabase";

let client : WebRTCClient = null

export default function Home () {
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const remoteAudio = useRef<HTMLAudioElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter()
    AddNotifier((message: EventMessage) => {
        if(message == 'WebSocketConnected' || 
            message == 'ExchangingSignalingMessage' || 
            message == 'WaitingAvailableDeviceSelection')  {
            return;
        }
        
        TurnOnStatus(message);

        if(message == 'WebRTCConnectionClosed') 
            router.refresh();
    })

    const ref        = searchParams.get('ref') ?? localStorage.getItem("reference"); 
    const platform   = searchParams.get('platform'); 

    const [Platform,setPlatform] = useState<Platform>(null);

    const SetupConnection = async () => {
        localStorage.setItem("reference",ref)
        const core = new SbCore()
        if (!await core.Authenticated()) 
			await core.LoginWithGoogle()
        
        const info = await core.getUserInfor()
        if(info instanceof Error)  {
            TurnOnStatus("invalid reference key")
            return
        }

        TurnOnStatus(`welcome ${info.email.split("@").at(0)}`);
        
        if(ref == null) 
            return

        const result = await core.AuthenticateSession(ref)
        if (result instanceof Error) 
            return

        const {token,SignalingURL,WebRTCConfig,PingCallback} = result
        setInterval(PingCallback,1000)
        client = new WebRTCClient(
            SignalingURL,token, WebRTCConfig,
            remoteVideo.current, 
            remoteAudio.current,  
            Platform)
    }

    
    useEffect(() => {
        SetupConnection()            
        setPlatform(old => { if (old == null) return getPlatform() })
    }, []);




    const toggle_mouse_touch_callback=async function(enable: boolean) { 
        client?.hid?.DisableTouch(!enable);
        client?.hid?.DisableMouse(!enable);
    } 
    const bitrate_callback= async function (bitrate: number) { 
        client?.ChangeBitrate(bitrate);
        client?.ChangeFramerate(55);
    } 
    const GamepadACallback=async function(x: number, y: number, type: "left" | "right"): Promise<void> {
        client?.hid?.VirtualGamepadAxis(x,y,type);
    } 
    const GamepadBCallback=async function(index: number, type: "up" | "down"): Promise<void> {
        client?.hid?.VirtualGamepadButtonSlider(type == 'down',index);
    }  
    const MouseMoveCallback=async function (x: number, y: number): Promise<void> {
        client?.hid?.mouseMoveRel({movementX:x,movementY:y});
    } 
    const MouseButtonCallback=async function (index: number, type: "up" | "down"): Promise<void> {
        type == 'down' ? client?.hid?.MouseButtonDown({button: index}) : client?.hid?.MouseButtonUp({button: index})
    } 
    const keystuckCallback= async function (): Promise<void> {
        client?.hid?.ResetKeyStuck();
    }
    const clipboardSetCallback= async function (val: string): Promise<void> {
        console.log(val)
        client?.hid?.SetClipboard(val)
        client?.hid?.PasteClipboard()
    }

    return (
        <Body>
            <RemoteVideo
                ref={remoteVideo}
                src={platform == 'desktop' ? video_desktop : video_desktop}
                autoPlay
                muted
                playsInline
                loop
            ></RemoteVideo>
            <App
                onContextMenu={(e) => e.preventDefault()}
                onMouseUp={(e: MouseEvent) => {
                    e.preventDefault();
                }}
                onMouseDown={(e: MouseEvent) => {
                    e.preventDefault();
                }}
                onKeyUp={(e: KeyboardEvent) => {
                    e.preventDefault();
                }}
                onKeyDown={(e: KeyboardEvent) => {
                    e.preventDefault();
                }}
            >
                <WebRTCControl platform={Platform} 
                toggle_mouse_touch_callback={toggle_mouse_touch_callback}
                bitrate_callback={bitrate_callback}
                GamepadACallback={GamepadACallback}
                GamepadBCallback={GamepadBCallback}
                MouseMoveCallback={MouseMoveCallback}
                MouseButtonCallback={MouseButtonCallback}
                keystuckCallback={keystuckCallback}
                clipboardSetCallback={clipboardSetCallback}
                ></WebRTCControl>
            </App>
            <audio
                ref={remoteAudio}
                autoPlay
                controls
                style={{ zIndex: -5, opacity: 0 }}
            ></audio>
        </Body>
    );
};

const RemoteVideo = styled.video`
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    margin: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
`;
const Body = styled.div`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    border: 0;
    overflow: hidden;
    background-color: black;
`;
const App = styled.div`
    touch-action: none;
    position: relative;
    width: 100vw;
    height: 100vh;
`;
//export default Home;?
