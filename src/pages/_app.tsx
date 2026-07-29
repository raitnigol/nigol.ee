import "@fontsource/inter/800.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/700.css";

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
			</Head>
			<Layout>
				<Component {...pageProps} />
			</Layout>
			<SpeedInsights />
		</>
	);
}

export default MyApp;
