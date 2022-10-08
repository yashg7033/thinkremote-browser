import Swal from "sweetalert2";
import { Monitor } from "../webrtc/models/devices.model";
import { Soundcard } from "../webrtc/models/devices.model";

export async function TurnOnAlert(error: string): Promise<void> {
  Swal.fire({
    title: "Opps...",
    text: error,
    icon: "error",
    confirmButtonText: "OK",
  });
  await new Promise(r => setTimeout(r, 3000));
  Swal.close();
}

let have_swal = false
export function TurnOnStatus(status: string): void {
  if (have_swal) {
    TurnOffStatus()
  }

  Swal.fire({
    title: `Application status: ${status}`,
    text: "Please wait while the client is getting ready...",
    showConfirmButton: false,
    timer: 3000,
    willOpen: () => Swal.showLoading(),
    willClose: () => Swal.hideLoading(),
  });
  have_swal = true;
}
export function TurnOffStatus(): void {
  Swal.close();
}



export async function AskSelectSoundcard(soundcards: Array<Soundcard>): Promise<string> {
    let swalInput = {};

    soundcards.forEach((x) => {
        if(swalInput[x.Api] == null){
          swalInput[x.Api] = {}
        }
        swalInput[x.Api][x.DeviceID] = x.Name;
    })

    const { value: DeviceID } = await Swal.fire({
    title: 'Select a soundcard device',
    input: 'select',
    inputOptions: swalInput,
    inputPlaceholder: 'Click here',
    showCancelButton: true,
    inputValidator: (value) => {
        for( var x of soundcards) {
          if (x.Name == value) {
            return ''
        }}

    }})



    return DeviceID
}

export async function AskSelectDisplay(monitors: Array<Monitor>): Promise<string> {
    let swalInput = {};

    monitors.forEach((x) => {
        if(swalInput[x.Adapter] == null){
          swalInput[x.Adapter] = {}
        }

        swalInput[x.Adapter][x.MonitorHandle] = x.MonitorName;
    })

    const { value: MonitorHandle } = await Swal.fire({
    title: 'Select monitor',
    input: 'select',
    inputOptions: swalInput,
    inputPlaceholder: 'Select monitor',
    showCancelButton: true,
    inputValidator: (value) => {
        for( var x of monitors) {
          if (x.MonitorName == value) {
            return ''
        }}

    }
  })

 

  return MonitorHandle
}

export async function AskSelectFramerate(): Promise<number> {
    const { value: framerate } = await Swal.fire({
    title: 'Select framerate',
    input: 'select',
    inputOptions: {
      '30': '30fps',
      '60': '60fps'
    },
    inputPlaceholder: 'Select framerate',
    showCancelButton: true,
    inputValidator: (value) => {
        return '';
    }
  })

 

  return Number.parseInt(framerate)
}

export async function AskSelectBitrate(): Promise<number> {
    const { value: bitrate } = await Swal.fire({
    title: 'Select bitrate',
    input: 'select',
    inputOptions: {
      '3000': '3 mbps',
      '6000': '6 mbps',
      '10000': '10 mbps'
    },
    inputPlaceholder: 'Select bitrate',
    showCancelButton: true,
    inputValidator: (value) => {
      return '';
    }
  })

 

  return Number.parseInt(bitrate)
}