import React, { useEffect, useState, useRef } from "react";
import Footer from "@/component/Footer/index";
import { useRouter } from "next/router";
import comon from "@/styles/comon.module.scss";
import MainHeader from "./Header";
import Head from "next/head";
import AOS from "aos";
import "aos/dist/aos.css";
import parse from "html-react-parser";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useHeaderAndFooterServices from "@/libs/services/headerAndFooterServices";

import SeoHead from "@/component/SeoHead";

const Layout = ({ children, pageProps, is404 }) => {
  const lenisRef = useRef(null);
  const [language, setLanguage] = useState("");
  const [headerData, setHeaderData] = useState(null);
  const [footerData, setFooterData] = useState(null);
  const [scripts, setScripts] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { pathname, asPath } = router;
  const targetLocale = router.locale === "en" ? "ar" : "en";
  const currentPath = asPath.split("?")[0];

  // SEO Logic
  const seoData = pageProps?.data || pageProps?.pageData;
  const defaultTitle =
    pageProps?.isShowcase && pageProps?.slug
      ? `Component Showcase: ${pageProps.slug}`
      : "Khansaheb Civil Engineering";
  const defaultDescription = pageProps?.isShowcase
    ? "List of all available components from ACF export."
    : "Khansaheb Civil Engineering - Building excellence in the UAE for over 90 years.";

  // Combine Global and Page-specific scripts
	const pageScripts = pageProps?.pageScripts;
	const globalScriptsFromProps = pageProps?.globalScripts;
	
	const finalScripts = {
		header_scripts: (globalScriptsFromProps?.header_scripts || scripts?.header_scripts || "") + (pageScripts?.header_scripts || ""),
		body_scripts: (globalScriptsFromProps?.body_scripts || scripts?.body_scripts || "") + (pageScripts?.body_scripts || ""),
		footer_scripts: (globalScriptsFromProps?.footer_scripts || scripts?.footer_scripts || "") + (pageScripts?.footer_scripts || ""),
	};

  useEffect(() => {
		// console.log("Layout mounted/updated");
		// console.log("Current scripts state:", scripts);
		// console.log("Current pageProps:", pageProps);
		// console.log("Calculated finalScripts:", finalScripts);
	}, [scripts, pageProps, finalScripts]);

	// Fetch header and footer data once on mount with caching
  useEffect(() => {
    const fetchHeaderFooter = async () => {
      const { getHeader, getFooter, getScripts } = useHeaderAndFooterServices();

      // Check if data is already in memory or sessionStorage
      const cachedHeader = sessionStorage.getItem("headerData");
      const cachedFooter = sessionStorage.getItem("footerData");
      const cachedScripts = sessionStorage.getItem("scriptsData");

      let header = null;
      let footer = null;
      let globalScripts = null;

      try {
        // Header
        if (cachedHeader) {
          header = JSON.parse(cachedHeader);
        } else {
          header = await getHeader();
        }

        // Footer
        if (cachedFooter) {
          footer = JSON.parse(cachedFooter);
        } else {
          footer = await getFooter();
        }

        // Scripts
        if (cachedScripts) {
          //console.log("Found cached scripts in sessionStorage");
          globalScripts = JSON.parse(cachedScripts);
        } else {
          //console.log("Fetching scripts from API");
          globalScripts = await getScripts();
        }

        // Update State and Cache
        if (header) {
          setHeaderData(header);
          sessionStorage.setItem("headerData", JSON.stringify(header));
        }

        if (footer) {
          setFooterData(footer);
          sessionStorage.setItem("footerData", JSON.stringify(footer));
        }

        if (globalScripts) {
          //console.log("Setting scripts state:", globalScripts);
          setScripts(globalScripts);
          sessionStorage.setItem("scriptsData", JSON.stringify(globalScripts));
        } else {
          console.warn("No global scripts found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchHeaderFooter();
  }, []);

  // Initialize Lenis Scroll
  useEffect(() => {
    let lenis = null;
    const initScroll = async () => {
      // Ensure scroll is at top before initializing Lenis
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }

      const Lenis = (await import("@studio-freight/lenis")).default;

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      lenisRef.current = lenis;

      // Ensure Lenis starts at top
      if (lenis && lenis.scrollTo) {
        lenis.scrollTo(0, { immediate: true });
      }

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      // Update scroll on resize
      window.addEventListener("resize", () => {
        if (lenis && lenis.resize) {
          lenis.resize();
        }
      });
    };

    // Initialize after DOM is ready
    const timer = setTimeout(initScroll, 300);

    return () => {
      clearTimeout(timer);
      if (lenis) {
        lenis.destroy();
      }
      window.removeEventListener("resize", () => {
        if (lenis && lenis.resize) {
          lenis.resize();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (router && router.locale == "ar") {
      setLanguage("ar");

      document.body.classList.add("rtl", comon.rtl);
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
    } else {
      setLanguage("en");
      document.body.classList.remove("rtl", comon.rtl);
      document.documentElement.setAttribute("dir", "ltl");
      document.documentElement.setAttribute("lang", "en");
    }
  }, [router]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <>
			{/* Global Header Scripts */}
			{finalScripts.header_scripts && (
				<Head>
					{parse(finalScripts.header_scripts)}
				</Head>
			)}

      <SeoHead
        data={seoData}
        defaultTitle={defaultTitle}
        defaultDescription={defaultDescription}
        path={asPath}
        locale={router.locale}
      />

      <div
        className={`${language === "ar" ? comon.rtl : comon.ltr} ${
          language === "ar" ? "rtl-lang" : "ltr-lang"
        }`}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Global Body Open Scripts */}
        {finalScripts.body_scripts && (
          <div className="body-scripts">
            {parse(finalScripts.body_scripts)}
          </div>
        )}

        <MainHeader headerData={headerData} is404={is404} />
        <main>{children}</main>
        <Footer footerData={footerData} />

        {/* Global Footer Scripts */}
        {finalScripts.footer_scripts && (
          <div className="footer-scripts">
            {parse(finalScripts.footer_scripts)}
          </div>
        )}

        <ToastContainer />
      </div>
    </>
  );
};

export default Layout;
