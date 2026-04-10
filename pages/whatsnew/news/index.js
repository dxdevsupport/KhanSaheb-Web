import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import InnerBanner from "@/component/InnerBanner";
import { useMobileView } from "@/hooks/useMobileView";import Breadcrumb from "@/component/Breadcrumb";
import AOS from "aos";
import "aos/dist/aos.css";
import NewsCard from "@/component/NewsCard";

import Select from "react-select";
import styles from "../shared.module.scss";
import parse from "html-react-parser";
import { axiosServer } from "@/libs/axios/axios";
import constants from "@/common/constants";

import { getGlobalScripts } from "@/libs/services/headerAndFooterServices";

const News = ({ pageData, newsPosts, pageScripts, globalScripts, awardsHasContent }) => {
  const isMobileView = useMobileView();
	const router = useRouter();
	const [visibleNews, setVisibleNews] = useState(6);
	const [isLoading, setIsLoading] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [selectedSort, setSelectedSort] = useState({
		value: "newest",
		label: "NEWEST FIRST",
	});
	const [sortedNews, setSortedNews] = useState(newsPosts || []);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1024);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const sortOptions = [
		{ value: "newest", label: "NEWEST FIRST" },
		{ value: "oldest", label: "OLDEST FIRST" },
		{ value: "title", label: "BY TITLE" },
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
		{ label: "News", href: null },
	];

	// Sort news posts based on selected option
	useEffect(() => {
		let sorted = [...(newsPosts || [])];

		switch (selectedSort.value) {
			case "newest":
				sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
				break;
			case "oldest":
				sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
				break;
			case "title":
				sorted.sort((a, b) => a.title.localeCompare(b.title));
				break;
			default:
				break;
		}

		setSortedNews(sorted);
	}, [selectedSort, newsPosts]);

	const handleLoadMore = () => {
		setIsLoading(true);
		setTimeout(() => {
			setVisibleNews((prev) => Math.min(prev + 6, sortedNews.length));
			setIsLoading(false);
		}, 300);
	};

	const handleNewsClick = (slug) => {
		router.push(`/whatsnew/news/${slug}`);
	};

	return (
		<>
			<InnerBanner
        title={
					pageData?.title?.rendered
						? parse(String(pageData.title.rendered))
						: "News"
				}
        backgroundImage={
          isMobileView && pageData?.acf?.pcm_banner_image_mob?.url
            ? pageData?.acf?.pcm_banner_image_mob.url
            : isMobileView && pageData?.acf?.pcm_banner_image_mob?.url
            ? pageData?.acf?.pcm_banner_image_mob.url
            : pageData?.acf?.pcm_banner_image?.url || "/images/news_banner.jpg"
				
        
        }
      />

			<Breadcrumb items={breadcrumbItems} />

			<section className={`${styles.newsSection} pt_50`}>
				<div className="container">
					<div className={styles.newsHeader}>
						<div className={styles.newsTitle}>
							<h2 className={`${styles.main_title} main_title`}>
								{pageData?.acf?.nw_title
									? parse(String(pageData.acf.nw_title))
									: "Latest News"}
							</h2>
							<p>
								{pageData?.acf?.nw_short_description
									? parse(String(pageData.acf.nw_short_description))
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

			<section className={`${styles.newsGridSection}`}>
				<div className="container">
					<div className={styles.newsGrid}>
						{sortedNews.slice(0, visibleNews).map((news, index) => (
							<div
								key={news.id}
								data-aos="fade-up"
								data-aos-delay={index * 300}
							>
								<NewsCard
									image={news.image}
									title={news.title}
									date={news.formattedDate}
									onClick={() => handleNewsClick(news.slug)}
								/>
							</div>
						))}
					</div>
					{visibleNews < sortedNews.length && (
						<div className={styles.loadMoreSection}>
							<button
								className={`${styles.loadMoreButton} common_btn text_lift_up_second`}
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
	try {
		// Fetch page data for banner and header content
		const pageResponse = await axiosServer.get(
			`/pages?slug=${constants.NEWS}&acf_format=standard`
		);
		const pageData =
			Array.isArray(pageResponse.data) && pageResponse.data.length > 0
				? pageResponse.data[0]
				: null;

		// Fetch all news posts
		const postsResponse = await axiosServer.get(
			`/posts?acf_format=standard&per_page=100&_embed`
		);
		const posts = postsResponse.data || [];

		// Process posts to extract necessary data
		const newsPosts = posts.map((post) => {
			// Get featured image from _embedded data
			let featuredImage = "/images/news_pic_1.jpg"; // Default fallback
			if (
				post._embedded &&
				post._embedded["wp:featuredmedia"] &&
				post._embedded["wp:featuredmedia"][0]
			) {
				featuredImage =
					post._embedded["wp:featuredmedia"][0].source_url || featuredImage;
			}

			// Format date
			const formattedDate = post.date
				? new Date(post.date).toLocaleDateString("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
				})
				: "";

			return {
				id: post.id,
				slug: post.slug,
				title: post.title?.rendered
					? String(post.title.rendered).replace(/<[^>]*>/g, "")
					: "",
				excerpt: post.excerpt?.rendered || "",
				content: post.content?.rendered || "",
				date: post.date,
				formattedDate: formattedDate,
				image: featuredImage,
				categories: post.categories || [],
				tags: post.tags || [],
			};
		});

		// Extract Page Specific Scripts
		const pageScripts = {
			header_scripts: pageData.meta?._hfs_header_scripts || "",
			body_scripts: pageData.meta?._hfs_body_scripts || "",
			footer_scripts: pageData.meta?._hfs_footer_scripts || "",
		};

		// Fetch Global Scripts
		const globalScripts = await getGlobalScripts();

		// Check if Awards page has content (for breadcrumb link)
		let awardsHasContent = false;
		try {
			const awardsPageResponse = await axiosServer.get(
				`/pages?slug=awards&acf_format=standard`
			);
			const awardsPageData =
				Array.isArray(awardsPageResponse.data) && awardsPageResponse.data.length > 0
					? awardsPageResponse.data[0]
					: null;
			
			awardsHasContent =
				awardsPageData?.acf?.flexible_components &&
				awardsPageData.acf.flexible_components.length > 0;
		} catch (e) {
			console.warn("Failed to check awards content:", e);
		}

		return {
			props: {
				pageData,
				newsPosts,
				pageScripts,
				globalScripts,
				awardsHasContent,
			},
		};
	} catch (error) {
		console.error("Error fetching News data (SSR):", error);
		return {
			props: {
				pageData: null,
				newsPosts: [],
			},
		};
	}
}

export default News;
