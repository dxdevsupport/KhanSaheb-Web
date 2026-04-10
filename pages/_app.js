import "@/styles/globals.css";
import "@/styles/base.scss";
import Layout from "@/component/Layout";
import { useEffect } from "react";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
	const router = useRouter();

	// Disable browser scroll restoration and ensure scroll to top on page load/refresh
	useEffect(() => {
		// Disable browser's automatic scroll restoration
		if (
			typeof window !== "undefined" &&
			"scrollRestoration" in window.history
		) {
			window.history.scrollRestoration = "manual";
		}

		// Ensure page starts at top on initial load
		if (typeof window !== "undefined") {
			// Scroll to top immediately
			window.scrollTo(0, 0);

			// Also scroll to top after a short delay to handle any async content loading
			const scrollToTop = () => {
				window.scrollTo(0, 0);
				document.documentElement.scrollTop = 0;
				document.body.scrollTop = 0;
			};

			// Run immediately and after DOM is ready
			scrollToTop();
			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", scrollToTop);
			}

			// Also run after a small delay to catch any late-loading content
			setTimeout(scrollToTop, 100);
		}
	}, []);

	// Scroll to top on route change (but not on initial load)
	useEffect(() => {
		const handleRouteChange = () => {
			if (typeof window !== "undefined") {
				window.scrollTo(0, 0);
				document.documentElement.scrollTop = 0;
				document.body.scrollTop = 0;
			}
		};

		router.events.on("routeChangeComplete", handleRouteChange);

		return () => {
			router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, [router]);

	return (
		<Layout pageProps={pageProps} is404={Component.is404 === true}>
			<Component {...pageProps} />
		</Layout>
	);
}

export default MyApp;
