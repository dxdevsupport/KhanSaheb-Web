import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import InnerBanner from "@/component/InnerBanner";
import { useMobileView } from "@/hooks/useMobileView";
import Breadcrumb from "@/component/Breadcrumb";
import ProgressSection from "@/component/ProgressSection";
import AOS from "aos";
import "aos/dist/aos.css";
import LeadershipIntro from "@/component/LeadershipIntro";
import NewsCard from "@/component/NewsCard";

import Select from "react-select";
import styles from "../shared.module.scss";
import useWhatsNewServices from "@/libs/services/whatsNewServices";
import parse from "html-react-parser";
import { axiosServer } from "@/libs/axios/axios";
import constants from "@/common/constants";

import { getGlobalScripts } from "@/libs/services/headerAndFooterServices";

const Insights = ({ globalScripts, awardsHasContent, insightsHasContent }) => {
  const isMobileView = useMobileView();
	const router = useRouter();
	const [visibleInsights, setVisibleInsights] = useState(6);
	const [isLoading, setIsLoading] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [selectedSort, setSelectedSort] = useState({
		value: "All years",
		label: "All years",
	});

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1024);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const sortOptions = [
		{ value: "All years", label: "All years" },
		{ value: "oldest", label: "OLDEST" },
		{ value: "newest", label: "newest" },
	];

	useEffect(() => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			offset: 100,
		});
	}, []);

	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{ label: "What's New", href: awardsHasContent ? "/whatsnew/awards" : null },
		{ label: "Insights", href: null },
	];

	const insightsData = [
		{
			id: 1,
			image: "/images/news_pic_1.jpg",
			title: "Khansaheb Managing Director Named Among Top Industry Leaders",
			date: "May 14, 2025",
		},
		{
			id: 2,
			image: "/images/news_pic_2.jpg",
			title:
				"Khansaheb is named the main contractor for flagship project 'Serenia Living' on Palm Jumeirah",
			date: "May 14, 2025",
		},
		{
			id: 3,
			image: "/images/news_pic_3.jpg",
			title: "Khansaheb wins at the Excellence and Creative Engineering Awards",
			date: "May 14, 2025",
		},
		{
			id: 4,
			image: "/images/news_pic_4.jpg",
			title:
				"Khansaheb Showcases Summer Worker Welfare Measures During Ministerial Visit",
			date: "May 14, 2025",
		},
		{
			id: 5,
			image: "/images/news_pic_5.jpg",
			title:
				"Khansaheb Civil Engineering recognised as Digital Construction Innovator of the Year",
			date: "May 14, 2025",
		},
		{
			id: 6,
			image: "/images/news_pic_6.jpg",
			title:
				"Khansaheb Interiors Wins Fit-Out Project of the Year at Design Middle East Awards 2024",
			date: "May 14, 2025",
		},
		{
			id: 7,
			image: "/images/news_pic_1.jpg",
			title:
				"Khansaheb Launches New Sustainability Initiative for Green Construction",
			date: "May 10, 2025",
		},
		{
			id: 8,
			image: "/images/news_pic_2.jpg",
			title: "Major Infrastructure Project Completed Ahead of Schedule",
			date: "May 8, 2025",
		},
		{
			id: 9,
			image: "/images/news_pic_3.jpg",
			title:
				"Khansaheb Partners with Leading Technology Companies for Smart Building Solutions",
			date: "May 5, 2025",
		},
		{
			id: 10,
			image: "/images/news_pic_4.jpg",
			title: "New Training Center Opens to Support Local Workforce Development",
			date: "May 3, 2025",
		},
		{
			id: 11,
			image: "/images/news_pic_5.jpg",
			title:
				"Khansaheb Receives International Recognition for Safety Excellence",
			date: "May 1, 2025",
		},
		{
			id: 12,
			image: "/images/news_pic_6.jpg",
			title: "Expansion of Operations to Support Growing Market Demand",
			date: "April 28, 2025",
		},
	];

	const handleLoadMore = () => {
		setIsLoading(true);
		setTimeout(() => {
			setVisibleInsights((prev) => Math.min(prev + 6, insightsData.length));
			setIsLoading(false);
		}, 300);
	};

	const handleInsightClick = (id) => {
		router.push(`/whatsnew/insights/${id}`);
	};

	const { getInsights } = useWhatsNewServices();
	const [data, setData] = useState(null);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await getInsights();
				setData(response[0]);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	return (
		<>

			<InnerBanner
				title={data?.title?.rendered ? parse(String(data.title.rendered)) : ""}
				backgroundImage={
					isMobileView && data?.acf?.pcm_banner_image_mob?.url
						? data?.acf?.pcm_banner_image_mob.url
						: data?.acf?.pcm_banner_image?.url || "/images/insight_banner.jpg"
				}
			/>

			<Breadcrumb items={breadcrumbItems} />

			<section className={`${styles.newsSection}`}>
				<div className="container">
					<div className={styles.newsHeader}>
						<div className={styles.newsTitle}>
							<h2 className={`${styles.main_title} main_title`}>
								{data?.acf?.ins_title ? parse(String(data.acf.ins_title)) : ""}
							</h2>
							<p>
								{/* Across our key business sectors we provide a range of integrated services, working in a collaborative manner to deliver solutions for our customers. */}
								{data?.acf?.ins_short_description
									? parse(String(data.acf.ins_short_description))
									: ""}
							</p>
						</div>
						<div className={styles.sortDropdown}>
							<Select
								value={selectedSort}
								onChange={setSelectedSort}
								options={sortOptions}
								className={styles.reactSelect}
								classNamePrefix="react-select"
								isSearchable={false}
								menuPortalTarget={
									typeof document !== "undefined" ? document.body : null
								}
								menuPosition="fixed"
								styles={{
									control: (base) => ({
										...base,
										textAlign: "left",
									}),
									singleValue: (base) => ({
										...base,
										textAlign: "left",
									}),
									menuPortal: (base) => ({
										...base,
										zIndex: 50,
									}),
									menu: (base) => ({
										...base,
										border: "1px solid #e40032",
										borderRadius: 0,
										boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
										marginTop: 2,
										backgroundColor: "#ffffff",
									}),
									menuList: (base) => ({
										...base,
										padding: 0,
									}),
									option: (base, state) => ({
										...base,
										fontSize: isMobile ? "9px" : "14px",
										fontWeight: state.isSelected ? 600 : 400,
										textTransform: "uppercase",
										fontFamily: '"Madani Arabic Light"',
										padding: isMobile ? "8px 12px" : "12px 16px",
										textAlign: "center",
										backgroundColor: state.isSelected
											? "#e40032"
											: state.isFocused
											? "#ff4d4d"
											: "#ffffff",
										cursor: "pointer",
										color: state.isSelected
											? "#fff"
											: state.isFocused
											? "#fff"
											: "#e40032",
										":hover": {
											backgroundColor: "#ff4d4d",
											color: "#fff",
										},
									}),
								}}
							/>
						</div>
					</div>
				</div>
			</section>

			<section className={`${styles.newsGridSection} pb_120`}>
				<div className="container">
					<div className={styles.newsGrid}>
						{insightsData.slice(0, visibleInsights).map((insight, index) => (
							<div key={index} data-aos="fade-up" data-aos-delay={index * 300}>
								<NewsCard
									image={insight.image}
									title={insight.title}
									date={insight.date}
									onClick={() => handleInsightClick(insight.id)}
								/>
							</div>
						))}
					</div>
					{visibleInsights < insightsData.length && (
						<div className={styles.loadMoreSection}>
							<button
								className={`${styles.loadMoreButton} common_btn`}
								onClick={handleLoadMore}
								disabled={isLoading}
							>
								{isLoading ? "Loading..." : "Load More"}
							</button>
						</div>
					)}
				</div>
			</section>
		</>
	);
};

export async function getServerSideProps() {
  const globalScripts = await getGlobalScripts();

  let awardsHasContent = true;
  try {
    const awardsRes = await axiosServer.get(
      `/pages?slug=${constants.AWARDS.replace("/", "")}&_fields=id,acf&acf_format=standard`
    );
    if (awardsRes.data && awardsRes.data.length > 0) {
      const awardsPage = awardsRes.data[0];
      awardsHasContent =
        awardsPage.acf?.flexible_components &&
        awardsPage.acf.flexible_components.length > 0;
    } else {
      awardsHasContent = false;
    }
  } catch (e) {
    console.error("Error fetching Awards page:", e);
    awardsHasContent = false;
  }

  return {
    props: {
      globalScripts,
      awardsHasContent,
    },
  };
}

export default Insights;
