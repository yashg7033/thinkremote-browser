import * as React from 'react';
import SettingProvider from '../context/settingProvider';
import StyledComponentsRegistry from '../lib/registry';
import "../styles/globals.css"
import GoogleAnalytics  from './googleAnalytics';

async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html>
			<head>
				<title>WebRTC remote viewer</title>
				<meta
					name="description"
					content="Generated by create next app"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
				></meta>
				<link rel="icon" href="/favicon.ico" />
				<meta http-equiv="Cache-control" content="no-cache"></meta>
			</head>
			<body>

				<GoogleAnalytics trackPageViews></GoogleAnalytics>
				<StyledComponentsRegistry>
					<SettingProvider>
						{children}
					</SettingProvider>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}

export default RootLayout;