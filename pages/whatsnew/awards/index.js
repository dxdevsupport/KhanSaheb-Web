import React, { useEffect, useState } from "react";
import InnerBanner from "@/component/InnerBanner";
import Breadcrumb from "@/component/Breadcrumb";
import { useMobileView } from "@/hooks/useMobileView";
import AOS from "aos";
import "aos/dist/aos.css";
import AwardCard from "@/component/AwardCard";

import Select from "react-select";
import styles from "../shared.module.scss";
import parse from "html-react-parser";
import { axiosServer } from "@/libs/axios/axios";
import constants from "@/common/constants";

import { getGlobalScripts } from "@/libs/services/headerAndFooterServices";

const Awards = ({ pageData, awards, sortOptions: initialSortOptions, pageScripts, globalScripts, awardsHasContent }) => {
  const isMobileView = useMobileView();
	const [visibleAwards, setVisibleAwards] = useState(6);
	const [isLoading, setIsLoading] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [selectedSort, setSelectedSort] = useState({
		value: "All years",
		label: "All years",
	});
	const [filteredAwards, setFilteredAwards] = useState(awards || []);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1024);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);
	const sortOptions = initialSortOptions || [
		{ value: "All years", label: "All years" },
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
		{ label: "Awards", href: null },
	];

	const handleLoadMore = () => {
		setIsLoading(true);
		setTimeout(() => {
			setVisibleAwards((prev) => Math.min(prev + 6, filteredAwards.length));
			setIsLoading(false);
		}, 300);
	};

	// Filter awards based on selected year
	useEffect(() => {
		if (selectedSort.value === "All years") {
			setFilteredAwards(awards);
		} else {
			const filtered = awards.filter(
				(award) => award.year === selectedSort.value
			);
			setFilteredAwards(filtered);
		}
		// Reset visible awards when filter changes
		setVisibleAwards(6);
	}, [selectedSort, awards]);

	return (
		<>

			<InnerBanner
				title={
					pageData?.acf?.pcm_banner_title
						? parse(String(pageData.acf.pcm_banner_title))
						: pageData?.title?.rendered
						? parse(String(pageData.title.rendered))
						: ""
				}
				backgroundImage={
					isMobileView && pageData?.acf?.pcm_banner_image_mob?.url
						? pageData?.acf?.pcm_banner_image_mob.url
						: pageData?.acf?.pcm_banner_image?.url || "/images/awards_banner.jpg"
				}
			/>

			<Breadcrumb items={breadcrumbItems} />

			<section className={`${styles.newsSection} pt_50`}>
				<div className="container">
					<div className={styles.newsHeader}>
						<div className={styles.newsTitle}>
							<h2 className={`${styles.main_title} main_title`}>
								{pageData?.acf?.aws_title
									? parse(String(pageData.acf.aws_title))
									: ""}
							</h2>
							<p>
								{pageData?.acf?.aws_short_description
									? parse(String(pageData.acf.aws_short_description))
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
					<div className={styles.awardGrid}>
						{filteredAwards.slice(0, visibleAwards).map((award, index) => (
							<div
								key={award.id || index}
								data-aos="fade-up"
								data-aos-delay={index * 100}
							>
								<AwardCard
									image={award.image}
									imageAlt={award.imageAlt}
									title={award.title}
									date={award.date}
									description={award.description}
									galleryImages={award.galleryImages}
									galleryImageAlts={award.galleryImageAlts}
								/>
							</div>
						))}
					</div>

					{/* Show "No awards found" message if filtered results are empty */}
					{filteredAwards.length === 0 && awards.length > 0 && (
						<div className={styles.noResultsMessage}>
							<p>No awards found for {selectedSort.label}.</p>
						</div>
					)}

					{visibleAwards < filteredAwards.length && (
						<div className={styles.loadMoreSection}>
							<button
								className={`${styles.loadMoreButton} common_btn text_lift_up_second`}
								onClick={handleLoadMore}
								disabled={isLoading}
							>
								{isLoading ? "Loading..." : "LOAD MORE"}
							</button>
						</div>
					)}
				</div>
			</section>
		</>
	);
};

// Helper function to extract year from award data
// Priority: 1. ACF field (aw_year), 2. Content parsing, 3. Date field
const extractYearFromAward = (award) => {
	// First priority: Check if ACF year field exists
	if (award.acf && award.acf.aw_year) {
		return award.acf.aw_year.toString();
	}

	// Second priority: Extract from content
	const content = award.content?.rendered || "";
	if (content) {
		// Convert to string if needed
		const contentString =
			typeof content === "string" ? content : content.toString();

		// Try to find year in format "In 2023" or "2023" or "at the 2023"
		const yearMatches = contentString.match(/\b(20\d{2})\b/g);

		if (yearMatches && yearMatches.length > 0) {
			// Return the first year found (most likely the award year)
			return yearMatches[0];
		}
	}

	// Third priority: Fallback to date field year
	if (award.date) {
		return new Date(award.date).getFullYear().toString();
	}

	return null;
};

export async function getServerSideProps() {
	try {
		// Fetch awards page data
		const pageResponse = await axiosServer.get(
			`/pages?slug=${constants.AWARDS}&acf_format=standard`
		);
		const pageData =
			Array.isArray(pageResponse.data) && pageResponse.data.length > 0
				? pageResponse.data[0]
				: null;

		const awardsHasContent =
			pageData?.acf?.flexible_components &&
			pageData.acf.flexible_components.length > 0;

		// Fetch all award posts with _embed to get featured images
		const awardsResponse = await axiosServer.get(
			`/award?acf_format=standard&per_page=100&_embed`
		);
		const awardsData = awardsResponse.data || [];

		// Fetch media for each award and process data
		const awards = await Promise.all(
			awardsData.map(async (award) => {
				// Parse title with HTML entities
				const title = award.title?.rendered
					? String(award.title.rendered).replace(/<[^>]*>/g, "")
					: "";

				// Get description from content
				const description = award.content?.rendered || "";

				// Extract year using helper function (prioritizes ACF field)
				const year = extractYearFromAward(award);

				// Get images from ACF field first, then fallback to _embedded media
				let mainImage = "/images/award_1.jpg";
				let mainImageAlt = title;
				let galleryImages = [mainImage];
				let galleryImageAlts = [mainImageAlt];

				// First priority: Check ACF award_images field
				if (
					award.acf &&
					award.acf.award_images &&
					award.acf.award_images.length > 0
				) {
					const images = award.acf.award_images;
					const firstImage = images[0] || {};
					mainImage =
						firstImage.url ||
						firstImage.sizes?.["1536x1536"] ||
						"/images/award_1.jpg";
					mainImageAlt = firstImage.alt || title;

					galleryImages = images
						.map((img) => img.url || img.sizes?.["1536x1536"] || null)
						.filter(Boolean);

					galleryImageAlts = images.map((img) => img.alt || title);

					if (galleryImages.length === 0) {
						galleryImages = [mainImage];
						galleryImageAlts = [mainImageAlt];
					}
				} else if (
					award._embedded &&
					award._embedded["wp:featuredmedia"] &&
					award._embedded["wp:featuredmedia"][0]
				) {
					const media = award._embedded["wp:featuredmedia"][0];
					mainImage = media.source_url || "/images/award_1.jpg";
					mainImageAlt = media.alt_text || title;
					galleryImages = [mainImage];
					galleryImageAlts = [mainImageAlt];
				}

				// Format date
				const formattedDate = award.date
					? new Date(award.date).toLocaleDateString("en-US", {
							month: "long",
							year: "numeric",
					})
					: "";

				return {
					id: award.id,
					slug: award.slug,
					image: mainImage,
					imageAlt: mainImageAlt,
					title: title,
					date: formattedDate,
					year: year,
					description: description,
					galleryImages: galleryImages,
					galleryImageAlts: galleryImageAlts,
				};
			})
		);

		// Extract unique years and generate sort options
		const years = awards
			.map((award) => award.year)
			.filter((year) => year !== null && year !== undefined);

		const uniqueYears = [...new Set(years)].sort((a, b) => b - a); // Sort descending (newest first)

		const sortOptions = [
			{ value: "All years", label: "All years" },
			...uniqueYears.map((year) => ({ value: year, label: year })),
		];

		// Extract Page Specific Scripts
		const pageScripts = {
			header_scripts: pageData.meta?._hfs_header_scripts || "",
			body_scripts: pageData.meta?._hfs_body_scripts || "",
			footer_scripts: pageData.meta?._hfs_footer_scripts || "",
		};

		// Fetch Global Scripts
		const globalScripts = await getGlobalScripts();

		return {
			props: {
				pageData,
				awards,
				sortOptions,
				pageScripts,
				globalScripts,
			},
		};
	} catch (error) {
		console.error("Error fetching Awards data (SSR):", error);
		return {
			props: {
				pageData: null,
				awards: [],
				sortOptions: [{ value: "All years", label: "All years" }],
			},
		};
	}
}

export default Awards;
