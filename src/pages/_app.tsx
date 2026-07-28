import "../styles/index.scss";

import type { AppProps } from "next/app";
import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Layout from "../components/Layout";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta
					name="viewport"
					content="initial-scale=1.0, width=device-width"
				/>
				<meta name="theme-color" content="#000000" />

				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@800&family=Outfit:wght@500;700&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<Layout>
				<Component {...pageProps} />
			</Layout>
			<SpeedInsights />
		</>
	);
}

export default MyApp;
