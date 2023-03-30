"use client"

import { SupabaseClient, User } from "@supabase/supabase-js";
import { AuthSessionResp } from "./authenticate";
import { SbFunction, WorkerSessionCreateBody, WorkerSessionDeactivateBody } from "./functions";
import { FetchResponse, Hardware } from "./hardware";
import { MediaDevice, MediaDevices } from "./media";
import {Schema, WorkerProfile, WorkerSession} from "./type"
import { createBrowserClient } from "./supabase-browser";

export default class SbCore {
	private supabase: SupabaseClient;
	constructor() {
		// this.supabase = createClient(
		// 	process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
		// 	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
		// );
		this.supabase = createBrowserClient()

	}

	public async LoginWithGoogle() {
		const redirectTo = localStorage.getItem("redirectTo")
		await this.supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				queryParams: {
					access_type: "offline",
					prompt: "consent",
				},
				redirectTo :  redirectTo
			},
		});
	}

	public async Logout() : Promise<void> {
		await this.supabase.auth.signOut();
	}
	public async Authenticated(): Promise<boolean> {
		return (await this.supabase.auth.getSession()).data.session != null
	}

	public async getUserInfor(): Promise< User | Error > {
		const resp = await this.supabase.auth.getUser();
		return resp.error == null ? resp.data.user : resp.error;
	}


	public async AuthenticateSession(ref : string): Promise<{
		token: string
		SignalingURL : string
		WebRTCConfig : RTCConfiguration
		PingCallback : () => (void)
	} | Error> {
		const session = await this.supabase.auth.getSession()
		if (session.error != null) 
			return new Error(session.error.message)

		const body = JSON.stringify({ reference: ref })
		const {data,error} = await this.supabase.functions.invoke<AuthSessionResp>("session_authenticate" as SbFunction,{
			headers: { "access_token": session.data.session.access_token },
			body: body,
			method: 'POST',
		})

		if(error != null)
			return new Error(error)

		return  {
			token : data.token,
			SignalingURL : data.signaling.WebsocketURL,
			WebRTCConfig : data.webrtc,
			PingCallback: ()=>{
				const user_session_id = data.id
			}
		}
	}

	public async FetchAuthorizedWorkers(): Promise<FetchResponse | Error> {
		const session = await this.supabase.auth.getSession()
		if (session.error != null) 
			return new Error(session.error.message)

		const body = JSON.stringify({})
		const {data,error} = await this.supabase.functions.invoke<FetchResponse>("worker_profile_fetch" as SbFunction,{
			headers: { "access_token": session.data.session.access_token },
			body: body,
			method: 'POST',
		})

		return error == null ?  data : new Error(error +":"+ data)
	}


	public async DeactivateWorkerSession(worker_session_id: number): Promise<string | Error> {
		const session = await this.supabase.auth.getSession()
		if (session.error != null) 
			return new Error(session.error.message)

		const body = JSON.stringify({
			worker_session_id: worker_session_id
		} as WorkerSessionDeactivateBody)

		const {data,error} = await this.supabase.functions.invoke<string>("worker_session_deactivate" as SbFunction,{
			headers: { "access_token": session.data.session.access_token },
			body: body,
			method: 'POST',
		})


		return error == null ? data : new Error(error +":"+ data)
	}

	public async CreateWorkerSession(worker_profile_id: number, media: MediaDevice): Promise<string | Error> {
		const session = await this.supabase.auth.getSession()
		if (session.error != null) 
			return new Error(session.error.message)

		const body = JSON.stringify({
			worker_id: worker_profile_id,
			soudcard_name: media.soundcard.Name,
			monitor_name: media.monitor.MonitorName
		} as WorkerSessionCreateBody)

		const {data,error} = await this.supabase.functions.invoke<string>("worker_session_create" as SbFunction,{
			headers: { "access_token": session.data.session.access_token },
			body: body,
			method: 'POST',
		})


		return error == null ? data : new Error(error +":"+ data)
	}
}

