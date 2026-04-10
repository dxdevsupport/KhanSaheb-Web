import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import style from "./otherProject.module.scss";
import Image from "next/image";
import OptimizedImage from "../OptimizedImage";
import Link from "next/link";
import otherProjectsData from "@/data/otherProjects.json";
import useProjectsServices from "@/libs/services/projectsServices";
import useSectorsServices from "@/libs/services/sectorsServices";
import parse from "html-react-parser";
import { getProjectImage, getProjectTags } from "@/libs/utils/helpers";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

function OtherProjects({ currentProjectId, relatedProjects, title }) {

	//console.log("relatedProjects Project ID:", relatedProjects); // Debug log
	const swiperRef = useRef(null);
	const sectionRef = useRef(null);
	const [projects, setProjects] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { getAllProjects, getProjectsByIds, getProjectCategories } = useProjectsServices();
	const { getSectors } = useSectorsServices();

	useEffect(() => {
		const fetchProjects = async () => {
			setIsLoading(true);
			try {
				// Fetch sectors and categories
				const [fetchedSectors, fetchedCategories] = await Promise.all([
					getSectors(),
					getProjectCategories(),
				]);

				const sectorMap = fetchedSectors ? fetchedSectors.reduce((acc, sec) => {
					acc[sec.id] = sec.name;
					return acc;
				}, {}) : {};

				const categoryMap = fetchedCategories ? fetchedCategories.reduce((acc, cat) => {
					acc[cat.id] = cat.name;
					return acc;
				}, {}) : {};

				let projectsToDisplay = [];
				let isUsingRelatedProjects = false;

				// If relatedProjects are provided, fetch those specific projects
				if (relatedProjects && relatedProjects.length > 0) {
					isUsingRelatedProjects = true;
					// Extract IDs from the related projects array
					// WordPress ACF returns objects like: { ID: 123, post_title: "Project Name" }
					const projectIds = relatedProjects.map((p) => {
						// Handle both object format { ID: 123 } and direct ID format
						return typeof p === "object" && p.ID ? p.ID : p;
					});

					// Use getProjectsByIds for more efficient batch fetching
					const fetchedProjects = await getProjectsByIds(projectIds);
					// console.log("Fetched related projects raw:", fetchedProjects); // Debug log
					projectsToDisplay = fetchedProjects;
				} else {
					// Otherwise, fetch recent projects and exclude the current one
					// Fetching 20 to ensure we have enough valid projects after filtering
					const allProjects = await getAllProjects(20);
					if (allProjects && allProjects.length > 0) {
						projectsToDisplay = allProjects
							.filter((project) => project.id !== currentProjectId)
							.slice(0, 6); // Limit to 6 projects
					}
				}

				// console.log("Projects before filtering:", projectsToDisplay); // Debug log

				// Map projects to the format expected by the component
				const mappedProjects = projectsToDisplay
					.filter((project) => {
						// Filter out projects with no ACF data or missing title
						// Also strictly check for image existence to avoid displaying broken/fallback cards
						// UNLESS it's a related project, in which case we show it even with fallback image
						const hasImage = getProjectImage(project) !== "/images/ourProjects/project-1.png";
						
						// Ensure it is actually a project type if the field exists
						// Also check link structure to ensure it's not a service (services usually have /services/ in URL)
						if (project.type && project.type !== 'project') {
							return false;
						}

						// Additional check: If the link contains 'services' or 'service', exclude it
						if (project.link && (project.link.includes('/services/') || project.link.includes('/service/'))) {
							return false;
						}

						// If using related projects, be more lenient
						if (isUsingRelatedProjects) {
							return project && project.title && project.acf;
						}
						
						return project && project.title && project.acf && hasImage;
					})
					.map((project) => {
						// Get the main image from ACF fields
						const mainImage = getProjectImage(project);

						// Get sectors/tags
						const tags = getProjectTags(project, {}, categoryMap);

						// Validate slug exists and try to recover if missing
						let finalSlug = project.slug;
						
						if (!finalSlug) {
							console.warn(`Project ${project.id} is missing slug property.`, project);
							
							// Try to extract from link
							if (project.link) {
								try {
									// link is like "https://.../project/slug/"
									const parts = project.link.split('/').filter(Boolean);
									const lastPart = parts[parts.length - 1];
									if (lastPart && lastPart !== 'project') {
										finalSlug = lastPart;
										console.log(`Recovered slug from link: ${finalSlug}`);
									}
								} catch (e) {
									console.warn("Failed to extract slug from link:", e);
								}
							}
							
							// Fallback to ID if still missing
							if (!finalSlug) {
								finalSlug = `project-${project.id}`;
								console.warn(`Using fallback ID-based slug: ${finalSlug}`);
							}
						}

						return {
							id: project.id,
							title: project.title?.rendered
								? parse(String(project.title.rendered))
								: "",
							image: mainImage,
							tags: tags,
							slug: finalSlug, 
						};
					});

				//console.log("Mapped projects for Other Projects:", mappedProjects); // Debug log

				// If no valid projects found (e.g. all filtered out), use static data
				if (mappedProjects.length === 0) {
					console.warn("No valid projects found, using static fallback.");
					setProjects(otherProjectsData);
				} else {
					setProjects(mappedProjects);
				}
			} catch (error) {
				console.error("Error fetching projects:", error);
				// Fallback to static data on error
				setProjects(otherProjectsData);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProjects();
	}, [currentProjectId, relatedProjects]);

	const handlePrev = () => {
		if (swiperRef.current && swiperRef.current.swiper) {
			swiperRef.current.swiper.slidePrev();
		}
	};

	const handleNext = () => {
		if (swiperRef.current && swiperRef.current.swiper) {
			swiperRef.current.swiper.slideNext();
		}
	};

	// Use fetched projects if available, otherwise fallback to static data
	// BUT if relatedProjects were requested (even if empty result), do not fallback to static data
	const finalDisplayProjects = (relatedProjects && relatedProjects.length > 0)
		? projects
		: (projects.length > 0 ? projects : otherProjectsData);

	// console.log("Display Projects:", finalDisplayProjects); // Debug log

	return (
		<div ref={sectionRef} className={`${style.header_container}`}>
			<div className="container">
				<div className={style.header}>
					<h2 className={style.title}>{title || "Other Projects"}</h2>
					<div className={style.navigation}>
						<button
							className={style.navButton}
							onClick={handlePrev}
							aria-label="Previous project"
						>
							<OptimizedImage
								src={"/images/icons/prev.svg"}
								alt="prev"
								width={12}
								height={6}
							/>
						</button>
						<button
							className={style.navButton}
							onClick={handleNext}
							aria-label="Next project"
						>
							<OptimizedImage
								src={"/images/icons/next.svg"}
								alt="next"
								width={12}
								height={6}
							/>
						</button>
					</div>
				</div>

				{/* Projects Slider */}
				<div className={style.projectsSlider}>
					<Swiper
						ref={swiperRef}
						modules={[Navigation]}
						spaceBetween={30}
						slidesPerView={1}
						breakpoints={{
							768: {
								slidesPerView: 2,
								spaceBetween: 30,
							},
							1024: {
								slidesPerView: 3,
								spaceBetween: 30,
							},
						}}
						className={style.swiper}
					>
						{finalDisplayProjects.map((project) => (
							<SwiperSlide key={project.id} className={style.swiperSlide}>
								<Link
									href={project.slug ? `/ourprojects/${project.slug}` : '#'}
									scroll={false}
									className={style.projectCard}
								>
									<div className={style.projectImage}>
										<OptimizedImage
											src={project.image}
											alt={
												typeof project.title === "string"
													? project.title
													: "Project"
											}
											width={400}
											height={300}
											className={style.image}
										/>
										<div className={style.imageOverlay}></div>
										<div className={style.projectTags}>
											{project.tags &&
												project.tags.map((tag, index) => (
													<span key={index} className={`${style.tag} green_fill_tag`}>
														{typeof tag === "string" &&
														(tag.includes("<") || tag.includes("&"))
															? parse(String(tag))
															: tag}
													</span>
												))}
										</div>
									</div>
									<h3 className={style.projectTitle}>{project.title}</h3>
								</Link>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</div>
	);
}

export default OtherProjects;
