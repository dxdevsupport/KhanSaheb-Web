import React, { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import OptimizedImage from "../OptimizedImage";
import Link from "next/link";
import parse from "html-react-parser";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { getProjectImage, getProjectTags, getCleanLink } from "@/libs/utils/helpers";
import styles from "./LandmarksSlider.module.scss";
import useSectorsServices from "@/libs/services/sectorsServices";
import useProjectsServices from "@/libs/services/projectsServices";

const LandmarksSlider = ({ data }) => { 
	const sliderRef = useRef(null);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const slidesRef = useRef([]);
	const imageSectionsRef = useRef([]);
	const contentSectionsRef = useRef([]);
	const animationTypesRef = useRef({}); // Store animation types per slide
	const animationTimeoutRef = useRef(null); // Store timeout ID to clear it if needed
	const contentRef = useRef(null);
	const sectionRef = useRef(null);
	const swiperRef = useRef(null);
    const [sectors, setSectors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [projectsList, setProjectsList] = useState(data?.acf?.hm_projects_list || []);
    const { getSectors } = useSectorsServices();
    const { getProjectCategories, getProjectsByIds } = useProjectsServices();

    useEffect(() => {
        const hydrateProjects = async () => {
            const rawProjects = data?.acf?.hm_projects_list || [];
 
            if (rawProjects.length === 0) return;

            // Check if projects need hydration (missing project-category, empty, or missing embedded data for names)
            const projectsToFetch = rawProjects.filter(p => {
                const hasCategory = p['project-category'] && Array.isArray(p['project-category']) && p['project-category'].length > 0;
                // Fetch if category is missing OR if we don't have embedded data (to ensure we get names)
                return !hasCategory || !p._embedded;
            });

            if (projectsToFetch.length > 0) {
                const ids = projectsToFetch.map(p => p.ID || p.id).filter(Boolean);
                if (ids.length > 0) {
                    const fetchedProjects = await getProjectsByIds(ids);
					
                    
                    // Map for O(1) lookup
                    const fetchedMap = {};
                    fetchedProjects.forEach(p => {
                        if (p && p.id) fetchedMap[p.id] = p;
                    });

                    const newProjectsList = rawProjects.map(p => {
                        const id = p.ID || p.id;
                        if (fetchedMap[id]) {
                            // Merge fetched data, but preserve existing image/content overrides if any
                            const fetched = fetchedMap[id];
                            const category = fetched['project-category'] || fetched['project_category'];
							
                            const sector = fetched.sector || fetched.sectors;

                            return { 
                                ...fetched, 
                                ...p, 
                                sector: sector, 
                                'project-category': category 
                            }; 
                        }
                        return p;
                    });
                    
                    setProjectsList(newProjectsList);
                }
            } else {
                setProjectsList(rawProjects);
            }
        };
        hydrateProjects();
    }, [data]);

    // Standardize sector mapping logic to match ProjectList
    useEffect(() => {
        const fetchTaxonomies = async () => {
            try {
                // Fetch sectors and categories
                const [fetchedSectors, fetchedCategories] = await Promise.all([
                    getSectors(),
                    getProjectCategories(),
                ]);
                
                if (fetchedSectors) {
                    setSectors(fetchedSectors);
                }
                if (fetchedCategories) {
                    setCategories(fetchedCategories);
                }
            } catch (error) {
                console.error("Error fetching taxonomies in LandmarksSlider:", error);
            }
        };
        fetchTaxonomies();
    }, []);

    const sectorMap = useMemo(() => {
        return sectors.reduce((acc, sec) => {
            acc[sec.id] = sec.name;
            return acc;
        }, {});
    }, [sectors]);

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});
    }, [categories]);

	// Detect mobile view (below 768px where flex-direction becomes column)
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Prevent page scrolling when scrolling within contentRef (for all slides)
	// useEffect(() => {
	// 	const handleWheel = (e) => {
	// 		// Find the content element that contains the target
	// 		// Check all content sections to find which one contains the target
	// 		let contentElement = null;

	// 		for (let i = 0; i < contentSectionsRef.current.length; i++) {
	// 			const contentSection = contentSectionsRef.current[i];
	// 			if (contentSection && contentSection.contains(e.target)) {
	// 				// Find the projectContent child within this content section
	// 				contentElement = contentSection.querySelector(`.${styles.projectContent}`);
	// 				break;
	// 			}
	// 		}

	// 		if (!contentElement) return;

	// 		// Check if content is scrollable
	// 		const isScrollable =
	// 			contentElement.scrollHeight > contentElement.clientHeight;

	// 		if (!isScrollable) return; // Allow page scroll if content isn't scrollable

	// 		// Get scroll boundaries
	// 		const { scrollTop, scrollHeight, clientHeight } = contentElement;
	// 		const isAtTop = scrollTop === 0;
	// 		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // -1 for rounding

	// 		// Determine scroll direction
	// 		const scrollingDown = e.deltaY > 0;
	// 		const scrollingUp = e.deltaY < 0;

	// 		// If scrolling down and at bottom, allow page scroll
	// 		// If scrolling up and at top, allow page scroll
	// 		// Otherwise, prevent page scroll and scroll the content
	// 		if (
	// 			(scrollingDown && isAtBottom) ||
	// 			(scrollingUp && isAtTop)
	// 		) {
	// 			// Allow page to scroll
	// 			return;
	// 		}

	// 		// Prevent page scroll and scroll the content instead
	// 		e.preventDefault();
	// 		e.stopPropagation();

	// 		// Scroll the content element
	// 		contentElement.scrollTop += e.deltaY;
	// 	};

	// 	// Use wheel event on the document to catch all scroll events
	// 	// and check if they're within a content element
	// 	document.addEventListener("wheel", handleWheel, { passive: false });

	// 	return () => {
	// 		document.removeEventListener("wheel", handleWheel);
	// 	};
	// }, []);

	// Default landmarks data (fallback)
	const defaultLandmarksData = [];

	// Map API projects to the expected format
	// Validate that projectsList is an array before mapping
	const apiProjects =
		Array.isArray(projectsList) &&
		projectsList.length > 0
			? projectsList.map((project, index) => {
					// Get project description with priority hierarchy
					let details = [];

					// Priority 1: Use content.rendered from WordPress API
					if (project.content?.rendered && project.content.rendered.trim()) {
						const description = project.content.rendered;
						details = [description];
					} else if (project?.acf?.im_in_hm_image_content) {
						const description = project?.acf?.im_in_hm_image_content;
						details = [description];
					}
					// Priority 2: Use ACF bb_description field
					else if (
						project.acf?.bb_description &&
						project.acf.bb_description.trim()
					) {
						const description = project.acf.bb_description;
						details = [description];
					}
					// Priority 3: Use post_content
					else if (project.post_content && project.post_content.trim()) {
						details = [project.post_content];
					}
					// Priority 4: Use post_excerpt
					else if (project.post_excerpt && project.post_excerpt.trim()) {
						details = [project.post_excerpt];
					}

					// Get project image using helper. Prefer pre-calculated image from server if available.
                    const img = project.image || getProjectImage(project);
                    // If helper returns default fallback, try to use specific landmark placeholder
					const projectImage = img === "/images/ourProjects/project-1.png" 
                        ? `/images/landmark_${index + 1}.jpg` 
                        : img;

					const projectImageAlt = project.title?.rendered || "Project Image";

					// Get sectors/tags using helper
					const tags = getProjectTags(project, {}, categoryMap);

					// Get project title
					const projectTitle =
						project.title?.rendered || project.post_title || "";

					// Validate slug exists
					if (!project.slug) {
						console.warn(
							`Home page project ${project.id} is missing slug:`,
							project
						);
					}

					return {
						id: project.id || project.ID,
						project: {
							tags: tags,
							name: projectTitle,
							details: details,
							projectLink: `/ourprojects/${
								project.slug || `project-${project.id || project.ID}`
							}`,
							projectButtonText: `See ${projectTitle}`,
							image: projectImage,
							imageAlt: projectImageAlt,
							slideNumber: String(index + 1).padStart(2, "0"),
							totalSlides: String(projectsList.length).padStart(2, "0"),
						},
					};
			  })
			: [];

	// Combine API projects with default projects to ensure we have at least 3 slides
	const landmarksData = [
		...apiProjects,
		...defaultLandmarksData.slice(apiProjects.length),
	];

	// // Update total slides count
	// const totalSlides = String(landmarksData.length).padStart(2, "0");
	// landmarksData.forEach((item, index) => {
	// 	item.project.slideNumber = String(index + 1).padStart(2, "0");
	// 	item.project.totalSlides = totalSlides;
	// });

	// Get or assign animation type for images (different animation for each slide)
	const getImageAnimationType = (index) => {
		const key = `image_${index}`;
		if (!animationTypesRef.current[key]) {
			// Assign different animation type for each slide: 0=bottomToTop, 1=fromOppositeSide, 2=fromSameSide, 3=cornerToCenter
			// Slide 0: image uses bottomToTop
			// Slide 1: image uses fromOppositeSide
			// Slide 2: image uses cornerToCenter
			// Slide 3+: cycles through
			if (index === 2) {
				animationTypesRef.current[key] = 3; // Use corner animation for third slide
			} else {
				animationTypesRef.current[key] = index % 4;
			}
		}
		return animationTypesRef.current[key];
	};

	// Get or assign animation type for content (different animation for each slide)
	const getContentAnimationType = (index) => {
		const key = `content_${index}`;
		if (!animationTypesRef.current[key]) {
			// Assign different animation type for each slide
			// Slide 0: content uses fromOppositeSide (different from image)
			// Slide 1: content uses fromSameSide
			// Slide 2: content uses cornerToCenter
			// Slide 3+: cycles through
			if (index === 0) {
				animationTypesRef.current[key] = 1; // First slide content uses fromOppositeSide
			} else if (index === 2) {
				animationTypesRef.current[key] = 3; // Use corner animation for third slide
			} else {
				animationTypesRef.current[key] = (index + 1) % 4;
			}
		}
		return animationTypesRef.current[key];
	};

	// Animation functions with varied patterns
	const animateImageIn = (imageElement, index) => {
		if (!imageElement) return;

		const isImageLeft = index % 2 === 1;
		const isImageRight = index % 2 === 0;
		const animType = getImageAnimationType(index);

		let fromState = {};
		let toState = {
			opacity: 1,
			x: 0,
			y: 0,
			scale: 1,
			duration: 1.8, // Animation duration
			ease: "power3.out",
		};

		// In mobile/column layout, use horizontal (side to side) animations
		if (isMobile) {
			switch (animType) {
				case 0: // From right side
					fromState = {
						opacity: 0,
						x: "150%", // Start from right
						y: 0,
						scale: 0.8,
					};
					break;
				case 1: // From opposite side (Left images from right, Right images from left)
					fromState = {
						opacity: 0,
						x: isImageLeft ? "150%" : "-150%", // Left images come from right, Right images come from left
						y: 0,
						scale: 0.8,
					};
					break;
				case 2: // From same side (Left images from left, Right images from right)
					fromState = {
						opacity: 0,
						x: isImageLeft ? "-150%" : "150%", // Left images come from left, Right images come from right
						y: 0,
						scale: 0.8,
					};
					break;
				case 3: // From side with scaling
					fromState = {
						opacity: 0,
						x: isImageLeft ? "150%" : "-150%", // From opposite side
						y: 0,
						scale: 0.6, // Start smaller
					};
					break;
			}
		} else {
			// Desktop/row layout - original horizontal animations
			switch (animType) {
				case 0: // Bottom to Top
					fromState = {
						opacity: 0,
						x: 0,
						y: "150%", // Start completely below
						scale: 0.8,
					};
					break;
				case 1: // From opposite side (Left images from right, Right images from left)
					fromState = {
						opacity: 0,
						x: isImageLeft ? "150%" : "-150%", // Left images come from right, Right images come from left
						y: 0,
						scale: 0.8,
					};
					break;
				case 2: // From same side (Left images from left, Right images from right)
					fromState = {
						opacity: 0,
						x: isImageLeft ? "-150%" : "150%", // Left images come from left, Right images come from right
						y: 0,
						scale: 0.8,
					};
					break;
				case 3: // Corner to Center with scaling
					if (isImageLeft) {
						fromState = {
							opacity: 0,
							x: "150%", // From right corner
							y: "150%", // From bottom
							scale: 0.6, // Start smaller
						};
					} else {
						fromState = {
							opacity: 0,
							x: "-150%", // From left corner
							y: "150%", // From bottom
							scale: 0.6, // Start smaller
						};
					}
					break;
			}
		}

		gsap.fromTo(imageElement, fromState, toState);
	};

	const animateImageOut = (imageElement, index) => {
		if (!imageElement) return;

		const isImageLeft = index % 2 === 1;
		const isImageRight = index % 2 === 0;
		const animType = getImageAnimationType(index);

		// Ensure opacity starts at 1
		gsap.set(imageElement, { opacity: 1 });

		let toState = {
			opacity: 0,
			duration: 1.8, // Animation duration
			ease: "power2.inOut",
		};

		// In mobile/column layout, use horizontal (side to side) animations
		if (isMobile) {
			switch (animType) {
				case 0: // Exit to left side
					toState = {
						...toState,
						x: "-150%", // Exit to left
						y: 0,
						scale: 0.8,
					};
					break;
				case 1: // To opposite side (reverse)
					toState = {
						...toState,
						x: isImageLeft ? "-150%" : "150%", // Left images exit to left, Right images exit to right
						y: 0,
						scale: 0.8,
					};
					break;
				case 2: // To same side (reverse)
					toState = {
						...toState,
						x: isImageLeft ? "150%" : "-150%", // Left images exit to right, Right images exit to left
						y: 0,
						scale: 0.8,
					};
					break;
				case 3: // Exit to side with scaling
					toState = {
						...toState,
						x: isImageLeft ? "-150%" : "150%", // Exit to opposite side
						y: 0,
						scale: 0.6, // Scale down while exiting
					};
					break;
			}
		} else {
			// Desktop/row layout - original horizontal animations
			switch (animType) {
				case 0: // Top to Bottom (reverse of bottom to top)
					toState = {
						...toState,
						x: 0,
						y: "-150%", // Exit completely above
						scale: 0.8,
					};
					break;
				case 1: // To opposite side (reverse)
					toState = {
						...toState,
						x: isImageLeft ? "-150%" : "150%", // Left images exit to left, Right images exit to right
						y: 0,
						scale: 0.8,
					};
					break;
				case 2: // To same side (reverse)
					toState = {
						...toState,
						x: isImageLeft ? "150%" : "-150%", // Left images exit to right, Right images exit to left
						y: 0,
						scale: 0.8,
					};
					break;
				case 3: // Corner to Corner (reverse) with scaling
					if (isImageLeft) {
						toState = {
							...toState,
							x: "-150%", // Exit to left corner
							y: "-150%", // Exit to top
							scale: 0.6, // Scale down while exiting
						};
					} else {
						toState = {
							...toState,
							x: "150%", // Exit to right corner
							y: "-150%", // Exit to top
							scale: 0.6, // Scale down while exiting
						};
					}
					break;
			}
		}

		gsap.to(imageElement, toState);
	};

	const animateContentIn = (contentElement, index) => {
		if (!contentElement) return;

		const isContentRight = index % 2 === 1;
		const isContentLeft = index % 2 === 0;
		const animType = getContentAnimationType(index);

		let fromState = {};
		let toState = {
			opacity: 1,
			x: 0,
			y: 0,
			scale: 1,
			duration: 1.8, // Animation duration
			ease: "power3.out",
			delay: 0.1,
		};

		// In mobile/column layout, use horizontal (side to side) animations
		if (isMobile) {
			switch (animType) {
				case 0: // From right side
					fromState = {
						opacity: 0,
						x: "150%", // Start from right
						y: 0,
						scale: 0.9,
					};
					break;
				case 1: // From opposite side (Content on left comes from right, Content on right comes from left)
					fromState = {
						opacity: 0,
						x: isContentLeft ? "150%" : "-150%", // Left content comes from right, Right content comes from left
						y: 0,
						scale: 0.9,
					};
					break;
				case 2: // From same side (Content on left comes from left, Content on right comes from right)
					fromState = {
						opacity: 0,
						x: isContentLeft ? "-150%" : "150%", // Left content comes from left, Right content comes from right
						y: 0,
						scale: 0.9,
					};
					break;
				case 3: // From side with scaling
					fromState = {
						opacity: 0,
						x: isContentLeft ? "150%" : "-150%", // From opposite side
						y: 0,
						scale: 0.7, // Start smaller
					};
					break;
			}
		} else {
			// Desktop/row layout - original horizontal animations
			switch (animType) {
				case 0: // Bottom to Top
					fromState = {
						opacity: 0,
						x: 0,
						y: "150%", // Start completely below
						scale: 0.9,
					};
					break;
				case 1: // From opposite side (Content on left comes from right, Content on right comes from left)
					fromState = {
						opacity: 0,
						x: isContentLeft ? "150%" : "-150%", // Left content comes from right, Right content comes from left
						y: 0,
						scale: 0.9,
					};
					break;
				case 2: // From same side (Content on left comes from left, Content on right comes from right)
					fromState = {
						opacity: 0,
						x: isContentLeft ? "-150%" : "150%", // Left content comes from left, Right content comes from right
						y: 0,
						scale: 0.9,
					};
					break;
				case 3: // Corner to Center with scaling
					if (isContentRight) {
						fromState = {
							opacity: 0,
							x: "-150%", // From left corner
							y: "150%", // From bottom
							scale: 0.7, // Start smaller
						};
					} else {
						fromState = {
							opacity: 0,
							x: "150%", // From right corner
							y: "150%", // From bottom
							scale: 0.7, // Start smaller
						};
					}
					break;
			}
		}

		gsap.fromTo(contentElement, fromState, toState);

		// Animate child elements with stagger
		const projectContent = contentElement.children[0] || contentElement;
		if (projectContent) {
			// Find elements by structure
			const projectTags = projectContent.children[0];
			const tagElements = projectTags
				? Array.from(projectTags.querySelectorAll("span"))
				: [];
			const title = projectContent.querySelector("h3");
			const allParagraphs = projectContent.querySelectorAll("p");
			const paragraphs = Array.from(allParagraphs).filter(
				(p) => !p.querySelector("a")
			);
			const button = projectContent.querySelector("a");
			const allDivs = projectContent.querySelectorAll("div");
			const slideNumber = Array.from(allDivs).find((div) => {
				const spans = div.querySelectorAll("span");
				return Array.from(spans).some(
					(span) =>
						span.textContent === "/" ||
						(span.textContent && /^\d+$/.test(span.textContent.trim()))
				);
			});

			if (tagElements.length > 0) {
				gsap.fromTo(
					tagElements,
					{ opacity: 0, y: 20, scale: 0.9 },
					{
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 1.0, // Child animation duration
						ease: "power2.out",
						stagger: 0.1,
						delay: 0.4,
					}
				);
			}

			if (title) {
				gsap.fromTo(
					title,
					{ opacity: 0, y: 30, scale: 0.95 },
					{
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 1.0, // Child animation duration
						ease: "power2.out",
						delay: 0.5,
					}
				);
			}

			if (paragraphs.length > 0) {
				gsap.fromTo(
					paragraphs,
					{ opacity: 0, y: 20, scale: 0.95 },
					{
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 1.0, // Child animation duration
						ease: "power2.out",
						stagger: 0.1,
						delay: 0.6,
					}
				);
			}

			if (button) {
				gsap.fromTo(
					button,
					{ opacity: 0, y: 20, scale: 0.9 },
					{
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 1.0, // Child animation duration
						ease: "power2.out",
						delay: 0.7,
					}
				);
			}

			if (slideNumber) {
				gsap.fromTo(
					slideNumber,
					{ opacity: 0, y: 20, scale: 0.9 },
					{
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 1.0, // Child animation duration
						ease: "power2.out",
						delay: 0.8,
					}
				);
			}
		}
	};

	const animateContentOut = (contentElement, index) => {
		if (!contentElement) return;

		const isContentRight = index % 2 === 1;
		const isContentLeft = index % 2 === 0;
		const animType = getContentAnimationType(index);

		// Ensure opacity starts at 1
		gsap.set(contentElement, { opacity: 1 });

		let toState = {
			opacity: 0,
			duration: 1.8, // Animation duration
			ease: "power2.inOut",
		};

		// In mobile/column layout, use horizontal (side to side) animations and fade out faster
		if (isMobile) {
			// In mobile, make content fade out faster to prevent overlap
			toState.duration = 1.0; // Faster fade out in mobile
			toState.ease = "power2.in";

			switch (animType) {
				case 0: // Exit to left side
					toState = {
						...toState,
						x: "-150%", // Exit to left
						y: 0,
						scale: 0.9,
						opacity: 0,
						duration: 1.0, // Faster in mobile
					};
					break;
				case 1: // To opposite side (reverse)
					toState = {
						...toState,
						x: isContentLeft ? "-150%" : "150%", // Left content exits to left, Right content exits to right
						y: 0,
						scale: 0.9,
						opacity: 0,
						duration: 1.0, // Faster in mobile
					};
					break;
				case 2: // To same side (reverse)
					// For second slide (index 1), exit to right; for others, reverse direction
					if (index === 1) {
						toState = {
							...toState,
							x: "150%", // Second slide content exits to right
							y: 0,
							scale: 0.9,
							opacity: 0,
							duration: 1.0, // Faster in mobile
						};
					} else {
						toState = {
							...toState,
							x: isContentLeft ? "150%" : "-150%", // Left content exits to right, Right content exits to left
							y: 0,
							scale: 0.9,
							opacity: 0,
							duration: 1.0, // Faster in mobile
						};
					}
					break;
				case 3: // Exit to side with scaling
					toState = {
						...toState,
						x: isContentLeft ? "-150%" : "150%", // Exit to opposite side
						y: 0,
						scale: 0.7, // Scale down while exiting
						opacity: 0,
						duration: 1.0, // Faster in mobile
					};
					break;
			}
		} else {
			// Desktop/row layout - original horizontal animations
			switch (animType) {
				case 0: // Top to Bottom (reverse of bottom to top)
					toState = {
						...toState,
						x: 0,
						y: "-150%", // Exit completely above
						scale: 0.9,
					};
					break;
				case 1: // To opposite side (reverse)
					toState = {
						...toState,
						x: isContentLeft ? "-150%" : "150%", // Left content exits to left, Right content exits to right
						y: 0,
						scale: 0.9,
					};
					break;
				case 2: // To same side (reverse)
					// For second slide (index 1), exit to right; for others, reverse direction
					if (index === 1) {
						toState = {
							...toState,
							x: "150%", // Second slide content exits to right
							y: 0,
							scale: 0.9,
						};
					} else {
						toState = {
							...toState,
							x: isContentLeft ? "150%" : "-150%", // Left content exits to right, Right content exits to left
							y: 0,
							scale: 0.9,
						};
					}
					break;
				case 3: // Corner to Corner (reverse) with scaling
					if (isContentRight) {
						toState = {
							...toState,
							x: "150%", // Exit to right corner
							y: "-150%", // Exit to top
							scale: 0.7, // Scale down while exiting
						};
					} else {
						toState = {
							...toState,
							x: "-150%", // Exit to left corner
							y: "-150%", // Exit to top
							scale: 0.7, // Scale down while exiting
						};
					}
					break;
			}
		}

		gsap.to(contentElement, toState);
	};

	const goToSlide = (newIndex) => {
		if (newIndex === currentSlide) return;

		// On mobile, Swiper handles the transitions, so skip custom animations
		if (isMobile) {
			// Swiper will handle the slide change automatically
			if (swiperRef.current) {
				swiperRef.current.slideTo(newIndex);
			}
			setCurrentSlide(newIndex);
			return;
		}

		// Clear any existing animation timeout to prevent hiding wrong slides
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
			animationTimeoutRef.current = null;
		}

		// Capture old index before updating state
		const oldIndex = currentSlide;

		// Update currentSlide immediately so subsequent clicks use the correct value
		setCurrentSlide(newIndex);
		setIsAnimating(true);

		const oldSlide = slidesRef.current[oldIndex];
		const newSlide = slidesRef.current[newIndex];

		// CRITICAL: Make new slide visible FIRST, before anything else
		// This ensures the slide is visible even if animations are interrupted
		if (newSlide) {
			// Remove display: none FIRST - it overrides everything
			newSlide.style.display = "";
			newSlide.style.removeProperty("display");
			newSlide.classList.add(styles.active);
			newSlide.style.visibility = "visible";
			newSlide.style.opacity = "1";
			newSlide.style.zIndex = "2";
			newSlide.style.pointerEvents = "auto";
		}

		// Hide all other slides except old and new (to prevent stale slides from previous rapid clicks)
		landmarksData.forEach((_, index) => {
			if (index !== oldIndex && index !== newIndex) {
				const slide = slidesRef.current[index];
				if (slide) {
					slide.style.display = "none";
					slide.style.visibility = "hidden";
					slide.classList.remove(styles.active);
				}
			}
		});

		// Kill any existing animations
		if (imageSectionsRef.current[oldIndex]) {
			gsap.killTweensOf(imageSectionsRef.current[oldIndex]);
		}
		if (contentSectionsRef.current[oldIndex]) {
			gsap.killTweensOf(contentSectionsRef.current[oldIndex]);
		}
		if (imageSectionsRef.current[newIndex]) {
			gsap.killTweensOf(imageSectionsRef.current[newIndex]);
		}
		if (contentSectionsRef.current[newIndex]) {
			gsap.killTweensOf(contentSectionsRef.current[newIndex]);
		}

		// Keep old slide visible during transition for out animation
		if (oldSlide) {
			// Keep old slide visible but remove active class
			oldSlide.classList.remove(styles.active);
			// Remove display: none if it exists - this is critical!
			oldSlide.style.display = "";
			oldSlide.style.removeProperty("display");
			oldSlide.style.visibility = "visible";
			oldSlide.style.opacity = "1";
			oldSlide.style.zIndex = "1";

			// In mobile, ensure old content section has lower z-index to prevent overlap
			if (isMobile && contentSectionsRef.current[oldIndex]) {
				gsap.set(contentSectionsRef.current[oldIndex], {
					zIndex: 1,
				});
			}
		}

		// In mobile, ensure new content section has higher z-index and is on top
		if (isMobile && contentSectionsRef.current[newIndex]) {
			gsap.set(contentSectionsRef.current[newIndex], {
				zIndex: 2,
			});
			// Also ensure the content section element itself has proper positioning
			if (contentSectionsRef.current[newIndex].style) {
				contentSectionsRef.current[newIndex].style.position = "relative";
				contentSectionsRef.current[newIndex].style.zIndex = "2";
			}
		}

		// In mobile, ensure old content section is behind
		if (isMobile && contentSectionsRef.current[oldIndex]) {
			if (contentSectionsRef.current[oldIndex].style) {
				contentSectionsRef.current[oldIndex].style.position = "relative";
				contentSectionsRef.current[oldIndex].style.zIndex = "1";
			}
		}

		// Set initial states for new slide based on animation type
		const imageAnimType = getImageAnimationType(newIndex);
		const contentAnimType = getContentAnimationType(newIndex);
		const isImageLeft = newIndex % 2 === 1;
		const isImageRight = newIndex % 2 === 0;
		const isContentRight = newIndex % 2 === 1;
		const isContentLeft = newIndex % 2 === 0;

		// Set initial states immediately (synchronously) to prevent blank slides
		// First, ensure elements are reset to visible state after killing animations
		if (imageSectionsRef.current[newIndex]) {
			// Reset element to ensure it's not stuck in an invisible state
			gsap.set(imageSectionsRef.current[newIndex], {
				opacity: 1,
				x: 0,
				y: 0,
				scale: 1,
			});
		}
		if (contentSectionsRef.current[newIndex]) {
			// Reset element to ensure it's not stuck in an invisible state
			gsap.set(contentSectionsRef.current[newIndex], {
				opacity: 1,
				x: 0,
				y: 0,
				scale: 1,
			});
		}

		// Now set initial animation states (mobile-aware)
		if (imageSectionsRef.current[newIndex]) {
			let imageFromState = { opacity: 0 };

			if (isMobile) {
				// Mobile/column layout - use horizontal (side to side) animations
				switch (imageAnimType) {
					case 0: // From right side
						imageFromState = { ...imageFromState, x: "150%", y: 0, scale: 0.8 };
						break;
					case 1: // From opposite side
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.8,
						};
						break;
					case 2: // From same side
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "-150%" : "150%",
							y: 0,
							scale: 0.8,
						};
						break;
					case 3: // From side with scaling
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.6,
						};
						break;
				}
			} else {
				// Desktop/row layout - original horizontal animations
				switch (imageAnimType) {
					case 0: // Bottom to Top
						imageFromState = { ...imageFromState, x: 0, y: "150%", scale: 0.8 };
						break;
					case 1: // From opposite side
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.8,
						};
						break;
					case 2: // From same side
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "-150%" : "150%",
							y: 0,
							scale: 0.8,
						};
						break;
					case 3: // Corner to Center with scaling
						if (isImageLeft) {
							imageFromState = {
								...imageFromState,
								x: "150%",
								y: "150%",
								scale: 0.6,
							};
						} else {
							imageFromState = {
								...imageFromState,
								x: "-150%",
								y: "150%",
								scale: 0.6,
							};
						}
						break;
				}
			}

			gsap.set(imageSectionsRef.current[newIndex], imageFromState);
		}

		if (contentSectionsRef.current[newIndex]) {
			let contentFromState = { opacity: 0 };

			if (isMobile) {
				// Mobile/column layout - use horizontal (side to side) animations
				switch (contentAnimType) {
					case 0: // From right side
						contentFromState = {
							...contentFromState,
							x: "150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 1: // From opposite side
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 2: // From same side
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "-150%" : "150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 3: // From side with scaling
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.7,
						};
						break;
				}
			} else {
				// Desktop/row layout - original horizontal animations
				switch (contentAnimType) {
					case 0: // Bottom to Top
						contentFromState = {
							...contentFromState,
							x: 0,
							y: "150%",
							scale: 0.9,
						};
						break;
					case 1: // From opposite side
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 2: // From same side
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "-150%" : "150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 3: // Corner to Center with scaling
						if (isContentRight) {
							contentFromState = {
								...contentFromState,
								x: "-150%",
								y: "150%",
								scale: 0.7,
							};
						} else {
							contentFromState = {
								...contentFromState,
								x: "150%",
								y: "150%",
								scale: 0.7,
							};
						}
						break;
				}
			}

			gsap.set(contentSectionsRef.current[newIndex], contentFromState);
		}

		// Ensure old slide elements are fully visible before animating out
		if (imageSectionsRef.current[oldIndex]) {
			gsap.set(imageSectionsRef.current[oldIndex], { opacity: 1 });
		}
		if (contentSectionsRef.current[oldIndex]) {
			// In mobile, set lower z-index to keep it behind new content
			if (isMobile) {
				gsap.set(contentSectionsRef.current[oldIndex], {
					opacity: 1, // Keep at 1 for animation start
					zIndex: 1, // Behind new content
				});
			} else {
				gsap.set(contentSectionsRef.current[oldIndex], {
					opacity: 1,
					zIndex: "auto",
				});
			}
		}

		// In mobile, ensure new content section is on top and fully visible
		if (isMobile && contentSectionsRef.current[newIndex]) {
			gsap.set(contentSectionsRef.current[newIndex], {
				zIndex: 2,
				opacity: 1, // Ensure it's fully visible
			});
		}

		// Use requestAnimationFrame to start animations after DOM is ready
		// This ensures initial states are set before animations start
		requestAnimationFrame(() => {
			// Animate out old slide and animate in new slide simultaneously
			// Start both animations at the same time
			if (imageSectionsRef.current[oldIndex]) {
				animateImageOut(imageSectionsRef.current[oldIndex], oldIndex);
			}
			if (contentSectionsRef.current[oldIndex]) {
				animateContentOut(contentSectionsRef.current[oldIndex], oldIndex);
			}

			// Start new slide animations immediately (simultaneously with out animations)
			if (imageSectionsRef.current[newIndex]) {
				animateImageIn(imageSectionsRef.current[newIndex], newIndex);
			}
			if (contentSectionsRef.current[newIndex]) {
				animateContentIn(contentSectionsRef.current[newIndex], newIndex);
			}
		});

		// Complete animation after duration
		// Store oldIndex in closure to verify it's still the old slide when timeout fires
		const timeoutOldIndex = oldIndex;
		animationTimeoutRef.current = setTimeout(() => {
			// Only hide the slide if it's still the old slide (not the current slide)
			// This prevents hiding slides that became active due to rapid navigation
			const currentSlideIndex = currentSlide; // Capture current value
			if (currentSlideIndex !== timeoutOldIndex) {
				const slideToHide = slidesRef.current[timeoutOldIndex];
				// Double-check: only hide if it's not the current slide
				if (
					slideToHide &&
					slideToHide !== slidesRef.current[currentSlideIndex]
				) {
					slideToHide.style.display = "none";
					slideToHide.style.visibility = "hidden";
				}
			}
			setIsAnimating(false);
			animationTimeoutRef.current = null;
		}, 2200); // Max animation duration (1.8s + 0.1s delay + 0.3s buffer)
	};

	const goToNext = () => {
		const nextIndex = (currentSlide + 1) % landmarksData.length;
		goToSlide(nextIndex);
	};

	const goToPrev = () => {
		const prevIndex =
			(currentSlide - 1 + landmarksData.length) % landmarksData.length;
		goToSlide(prevIndex);
	};

	// Initialize first slide on mount
	useEffect(() => {
		const firstSlide = slidesRef.current[0];
		if (firstSlide) {
			firstSlide.classList.add(styles.active);
			firstSlide.style.removeProperty("display");
		}

		// Animate first slide in
		if (imageSectionsRef.current[0] && contentSectionsRef.current[0]) {
			const imageAnimType = getImageAnimationType(0);
			const contentAnimType = getContentAnimationType(0);
			const isImageRight = 0 % 2 === 0;
			const isImageLeft = 0 % 2 === 1;
			const isContentLeft = 0 % 2 === 0;
			const isContentRight = 0 % 2 === 1;

			let imageFromState = { opacity: 0 };
			let contentFromState = { opacity: 0 };

			// Set image initial state (mobile-aware)
			if (isMobile) {
				// Mobile - use horizontal animations
				switch (imageAnimType) {
					case 0: // From right side
						imageFromState = { ...imageFromState, x: "150%", y: 0, scale: 0.8 };
						break;
					case 1: // From opposite side
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.8,
						};
						break;
					case 2: // From same side
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "-150%" : "150%",
							y: 0,
							scale: 0.8,
						};
						break;
					case 3: // From side with scaling
						imageFromState = {
							...imageFromState,
							x: isImageLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.6,
						};
						break;
				}
			} else {
				// Desktop - original animations
				switch (imageAnimType) {
					case 0: // Bottom to Top
						imageFromState = { ...imageFromState, x: 0, y: "150%", scale: 0.8 };
						break;
					case 1: // Right to Left
						imageFromState = { ...imageFromState, x: "200%", y: 0, scale: 0.8 };
						break;
					case 2: // Left to Right
						imageFromState = {
							...imageFromState,
							x: "-200%",
							y: 0,
							scale: 0.8,
						};
						break;
					case 3: // Corner to Center
						imageFromState = {
							...imageFromState,
							x: "-150%",
							y: "150%",
							scale: 0.6,
						};
						break;
				}
			}

			// Set content initial state (mobile-aware)
			if (isMobile) {
				// Mobile - use horizontal animations
				switch (contentAnimType) {
					case 0: // From right side
						contentFromState = {
							...contentFromState,
							x: "150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 1: // From opposite side
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 2: // From same side
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "-150%" : "150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 3: // From side with scaling
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.7,
						};
						break;
				}
			} else {
				// Desktop - original animations
				switch (contentAnimType) {
					case 0: // Bottom to Top
						contentFromState = {
							...contentFromState,
							x: 0,
							y: "150%",
							scale: 0.9,
						};
						break;
					case 1: // Right to Left
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "150%" : "-150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 2: // Left to Right
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "-150%" : "150%",
							y: 0,
							scale: 0.9,
						};
						break;
					case 3: // Corner to Center
						contentFromState = {
							...contentFromState,
							x: isContentLeft ? "-150%" : "150%",
							y: "150%",
							scale: 0.7,
						};
						break;
				}
			}

			gsap.set(imageSectionsRef.current[0], imageFromState);
			gsap.set(contentSectionsRef.current[0], contentFromState);

			// Animate in
			setTimeout(() => {
				animateImageIn(imageSectionsRef.current[0], 0);
				animateContentIn(contentSectionsRef.current[0], 0);
			}, 100);
		}

		// Hide other slides
		for (let index = 1; index < landmarksData.length; index++) {
			const slideElement = slidesRef.current[index];
			if (slideElement) {
				slideElement.style.display = "none";
			}
		}
	}, []);

	return (
		<section className={`${styles.landmarksSection}`} ref={sectionRef}>
			{/* Header Section */}
			<div className="container" data-aos="fade-up">
				<div className={`${styles.headerContent} pb_60`}>
					<div className={styles.headerTitle}>
						<span className="tag">
							{data?.acf?.hm_ps_sub_caption ? parse(String(data.acf.hm_ps_sub_caption)) : ""}
						</span>
						<h2>Landmarks We've Delivered</h2>
					</div>
					<div className={styles.headerDescription}>
						<p>
							{data?.acf?.hm_ps_main_caption ? parse(String(data.acf.hm_ps_main_caption)) : ""}
						</p>
					</div>
					<Link
						href={getCleanLink(data?.acf?.hm_ps_button?.url)}
						className={`${styles.common_btn} common_btn text_lift_up_second`}
					>
						{data?.acf?.hm_ps_button?.title ? parse(String(data.acf.hm_ps_button.title)) : ""}
					</Link>
				</div>
			</div>

			<div className={`${styles.sliderWrapper} container`} ref={sliderRef}>
				{/* Mobile: Use Swiper for smooth animations */}
				{isMobile ? (
					<Swiper
						modules={[Navigation]}
						spaceBetween={100}
						slidesPerView={1}
						speed={600}
						loop={landmarksData.length > 1}
						onSwiper={(swiper) => {
							swiperRef.current = swiper;
						}}
						onSlideChange={(swiper) => {
							setCurrentSlide(swiper.realIndex);
						}}
						className={styles.landmarksSwiper}
					>
						{landmarksData.map((slide, index) => (
							<SwiperSlide key={slide.id} className={styles.swiperSlide}>
								<div className={`${styles.slideContainer}`}>
									<div className={styles.slideContent}>
										{/* Image Section */}
										<div
											className={`${styles.imageSection} ${styles.imageFull}`}
										>
											<div className={styles.projectImage}>
												<OptimizedImage
													src={slide.project.image}
													alt={slide.project.imageAlt || slide.project.name}
													width={1000}
													height={600}
													className={styles.image}
												/>
											</div>
										</div>

										{/* Content Section */}
										<div
											className={`${styles.contentSection} ${styles.contentFull}`}
										>
											<div className={styles.projectContent} ref={contentRef}>
												<div className={styles.projectTags}>
													{slide.project.tags.map((tag, tagIndex) => (
														<span
															key={tagIndex}
															className="green_tag text_lift_up"
														>
															{typeof tag === "string"
																? parse(String(tag))
																: tag}
														</span>
													))}
												</div>
												<h3 className={styles.projectTitle}>
													{typeof slide.project.name === "string"
														? parse(String(slide.project.name))
														: slide.project.name}
												</h3>
												{Array.isArray(slide.project.details) ? (
													slide.project.details.map((paragraph, pIndex) => (
														<div key={pIndex}>
															{typeof paragraph === "string"
																? parse(String(paragraph))
																: paragraph}
														</div>
													))
												) : (
													<div>
														{typeof slide.project.details === "string"
															? parse(String(slide.project.details))
															: slide.project.details}
													</div>
												)}
												<Link
													href={slide.project.projectLink || "#"}
													className={`${styles.common_btn} common_btn`}
												>
													{typeof slide.project.projectButtonText ===
														"string"
														? parse(String(slide.project.projectButtonText))
														: slide.project.projectButtonText}
												</Link>
											</div>
										</div>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				) : (
					/* Desktop: Use custom GSAP animations */
					<div className={styles.landmarksSlider}>
						{landmarksData.map((slide, index) => (
							<div
								key={slide.id}
								className={`${styles.landmarkSlide} ${
									index === currentSlide ? styles.active : ""
								}`}
								ref={(el) => {
									slidesRef.current[index] = el;
								}}
							>
								<div className={`${styles.slideContainer} `}>
									<div
										className={styles.slideContent}
										style={{
											flexDirection: index % 2 === 0 ? "row" : "row-reverse",
										}}
									>
										{/* Image Section */}
										{/* Pattern: index 0=right, 1=left, 2=right, 3=left... */}
										<div
											className={`${styles.imageSection} ${
												index % 2 === 0 ? styles.imageRight : styles.imageLeft
											}`}
											ref={(el) => {
												imageSectionsRef.current[index] = el;
											}}
										>
											<div className={styles.projectImage}>
												<OptimizedImage
													src={slide.project.image}
													alt={slide.project.imageAlt || slide.project.name}
													width={1000}
													height={600}
													className={styles.image}
												/>
											</div>
										</div>

										{/* Content Section */}
										{/* Pattern: index 0=left, 1=right, 2=left, 3=right... */}
										<div
											className={`${styles.contentSection} ${
												index % 2 === 0
													? styles.contentLeft
													: styles.contentRight
											}`}
											ref={(el) => {
												contentSectionsRef.current[index] = el;
											}}
										>
											<div className={styles.projectContent} ref={contentRef}>
												<div className={styles.projectTags}>
													{slide.project.tags.map((tag, tagIndex) => (
														<span
															key={tagIndex}
															className="green_tag text_lift_up"
														>
															{typeof tag === "string"
																? parse(String(tag))
																: tag}
														</span>
													))}
												</div>
												<h3 className={styles.projectTitle}>
													{typeof slide.project.name === "string"
														? parse(String(slide.project.name))
														: slide.project.name}
												</h3>
												{Array.isArray(slide.project.details) ? (
													slide.project.details.map((paragraph, pIndex) => (
														<div key={pIndex}>
															{typeof paragraph === "string"
																? parse(String(paragraph))
																: paragraph}
														</div>
													))
												) : (
													<div>
														{typeof slide.project.details === "string"
															? parse(String(slide.project.details))
															: slide.project.details}
													</div>
												)}
												<Link
													href={slide.project.projectLink || "#"}
													className={`${styles.common_btn} common_btn`}
												>
													{typeof slide.project.projectButtonText ===
														"string"
														? parse(String(slide.project.projectButtonText))
														: slide.project.projectButtonText}
												</Link>
											</div>
											<div className={styles.slideNumber}>
												<span className={styles.current}>
													{slide.project.slideNumber}
												</span>
												<span className={styles.divider}>/</span>
												<span className={styles.total}>
													{slide.project.totalSlides}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Fixed slide number outside slides - only for mobile */}
				{isMobile && landmarksData.length > 0 && (
					<div className={styles.slideNumber}>
						<span className={styles.current}>
							{String(currentSlide + 1).padStart(2, "0")}
						</span>
						<span className={styles.divider}>/</span>
						<span className={styles.total}>
							{String(landmarksData.length).padStart(2, "0")}
						</span>
					</div>
				)}

				{/* Custom Navigation Buttons */}
				{/* <div className={`container ${styles.customNavigation}`}> */}
				<button
					className={styles.navButtonPrev}
					onClick={() => {
						if (isMobile && swiperRef.current) {
							swiperRef.current.slidePrev();
						} else {
							goToPrev();
						}
					}}
					aria-label="Previous slide"
				>
					<svg
						width="8"
						height="14"
						viewBox="0 0 8 14"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M6.62915 12.3672L0.700087 6.53385L6.62915 0.700521"
							stroke="white"
							stroke-width="1.4"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<button
					className={styles.navButtonNext}
					onClick={() => {
						if (isMobile && swiperRef.current) {
							swiperRef.current.slideNext();
						} else {
							goToNext();
						}
					}}
					aria-label="Next slide"
				>
					<svg
						width="8"
						height="14"
						viewBox="0 0 8 14"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M6.62915 12.3672L0.700087 6.53385L6.62915 0.700521"
							stroke="white"
							stroke-width="1.4"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				{/* </div> */}
			</div>
		</section>
	);
};

export default LandmarksSlider;
