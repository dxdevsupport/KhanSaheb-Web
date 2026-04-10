import React, { useState, useRef, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Thumbs } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import parse from "html-react-parser";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";
import styles from "./Capabilities.module.scss";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const Capabilities = ({ data }) => {
	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [activeService, setActiveService] = useState(0);
	const mainSwiperRef = useRef(null);
	const thumbSwiperRef = useRef(null);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const sectionRef = useRef(null);
	const mainContentRef = useRef(null);

	// Default fallback services
	const defaultServices = [];

	// Map API services to component format or use default
	const services = useMemo(() => {
		return data?.acf?.hm_oc_our_services?.length > 0
			? data.acf.hm_oc_our_services.map((service, index) => {
					// Get service image from API with fallback chain
					const serviceImage = service.image_details?.source_url
						? service.image_details.source_url
						: service.image_details?.media_details?.sizes?.full?.source_url
						? service.image_details.media_details.sizes.full.source_url
						: service.image_details?.media_details?.sizes?.medium?.source_url
						? service.image_details.media_details.sizes.medium.source_url
						: `/images/cap_${index + 1}.jpg`; // Fallback to default images

					return {
						id: service.ID || service.id,
						title: extractTextFromObject(
							service.title?.rendered ||
							service.post_title ||
							service.acf.pcm_banner_title
						),
						description: extractTextFromObject(
							service.acf?.hm_intro ||
							service.post_content ||
							"Lorem ipsum dolor sit amet consectetur adipiscing eli mattis sit phasellus mollis sit."
						),
						image: serviceImage,
						link: `/services/${service.slug || service.post_name}`,
					};
			  })
			: defaultServices;
	}, [data]);

	// Scroll thumbnail swiper to ensure active slide is visible and centered when possible
	useEffect(() => {
		if (thumbsSwiper && thumbSwiperRef.current) {
			// Use setTimeout to ensure swiper is ready
			setTimeout(() => {
				const swiper = thumbSwiperRef.current;
				if (!swiper || !swiper.params) return;

				const slidesPerView = swiper.params.slidesPerView || 6;
				const totalSlides = swiper.slides.length;
				const currentIndex = activeService;

				// Check if active slide is already visible in current view
				const currentActiveIndex = swiper.activeIndex || 0;
				const visibleStart = currentActiveIndex;
				const visibleEnd = currentActiveIndex + slidesPerView - 1;
				const isActiveSlideVisible =
					currentIndex >= visibleStart && currentIndex <= visibleEnd;

				// If active slide is already visible, don't scroll to prevent unnecessary movement
				if (isActiveSlideVisible) {
					return;
				}

				// Calculate the target index to center the active slide
				// We want the active slide to be as close to center as possible
				const halfView = Math.floor(slidesPerView / 2);
				let targetIndex;

				// If there are fewer slides than can be shown, don't scroll
				if (totalSlides <= slidesPerView) {
					targetIndex = 0;
				}
				// If active slide is near the beginning
				else if (currentIndex <= halfView) {
					targetIndex = 0;
				}
				// If active slide is near the end
				else if (currentIndex >= totalSlides - halfView - 1) {
					targetIndex = Math.max(0, totalSlides - slidesPerView);
				}
				// Otherwise, center the active slide
				else {
					targetIndex = currentIndex - halfView;
				}

				// Only scroll if the target is different from current position
				// Use faster animation (300ms) to reduce visible movement
				if (swiper.activeIndex !== targetIndex) {
					swiper.slideTo(targetIndex, 300);
				}
			}, 150);
		}
	}, [activeService, thumbsSwiper]);

	// Initialize thumbnail position on mount
	useEffect(() => {
		if (thumbsSwiper && thumbSwiperRef.current) {
			setTimeout(() => {
				thumbSwiperRef.current.slideTo(0, 0);
			}, 300);
		}
	}, [thumbsSwiper]);

	// Restore scroll behavior when at boundaries (first or last slide)
	useEffect(() => {
		const isAtFirstSlide = activeService === 0;
		const isAtLastSlide = activeService === services.length - 1;

		if (isAtFirstSlide || isAtLastSlide) {
			// Restore scroll behavior immediately when at boundaries
			document.documentElement.style.scrollBehavior = "";
		}
	}, [activeService, services.length]);

	// Scroll-based navigation for swiper
	useEffect(() => {
		const mainContent = mainContentRef.current;
		if (!mainContent || !mainSwiperRef.current || services.length === 0) return;

		// Check if we're on a smaller screen (mobile/tablet)
		const isSmallScreen = () => window.innerWidth < 1024;

		const wheelTimeoutRef = { current: null };
		const isHandlingWheelRef = { current: false };
		const scrollPositionRef = { current: 0 };

		const handleWheel = (e) => {
			// Check if the event target or any parent is within the component
			let target = e.target;
			let isOverComponent = false;

			// Check if target is within mainContent or its children
			while (target && target !== document.body) {
				if (target === mainContent || mainContent.contains(target)) {
					isOverComponent = true;
					break;
				}
				target = target.parentElement;
			}

			// Also check mouse position as fallback
			if (!isOverComponent) {
				const rect = mainContent.getBoundingClientRect();
				const mouseX = e.clientX || 0;
				const mouseY = e.clientY || 0;

				isOverComponent =
					mouseX >= rect.left &&
					mouseX <= rect.right &&
					mouseY >= rect.top &&
					mouseY <= rect.bottom;
			}

			// If not over component, allow normal scroll
			if (!isOverComponent) {
				return;
			}

			const rect = mainContent.getBoundingClientRect();

			// On smaller screens, allow normal scroll but still enable slide navigation when section is in view
			if (isSmallScreen()) {
				const viewportHeight = window.innerHeight;

				// Check if section is in viewport (at least 50% visible)
				const visibleTop = Math.max(0, rect.top);
				const visibleBottom = Math.min(viewportHeight, rect.bottom);
				const visibleHeight = visibleBottom - visibleTop;
				const sectionHeight = rect.height;
				const visibilityPercentage = (visibleHeight / sectionHeight) * 100;

				// Only handle wheel events if section is significantly in view (50%+)
				if (visibilityPercentage < 50) {
					return; // Allow normal scroll
				}

				// Check if scrolling from above the section
				if (rect.top > viewportHeight * 0.5) {
					return; // Allow normal scroll to reach the section
				}

				// On mobile, use a less aggressive approach - don't prevent default, just trigger slide change
				const deltaY = e.deltaY;
				const currentIndex = activeService;
				const totalSlides = services.length;
				const isAtFirstSlide = currentIndex === 0;
				const isAtLastSlide = currentIndex === totalSlides - 1;

				// Only prevent default if we're actually changing slides
				if (
					deltaY > 50 &&
					!isAtLastSlide &&
					!isHandlingWheelRef.current &&
					!isTransitioning
				) {
					isHandlingWheelRef.current = true;
					if (mainSwiperRef.current) {
						mainSwiperRef.current.slideNext();
					}
					setTimeout(() => {
						isHandlingWheelRef.current = false;
					}, 650);
				} else if (
					deltaY < -50 &&
					!isAtFirstSlide &&
					!isHandlingWheelRef.current &&
					!isTransitioning
				) {
					isHandlingWheelRef.current = true;
					if (mainSwiperRef.current) {
						mainSwiperRef.current.slidePrev();
					}
					setTimeout(() => {
						isHandlingWheelRef.current = false;
					}, 650);
				}
				return; // Allow normal scroll on mobile
			}

			// Desktop behavior (original logic)
			const viewportHeight = window.innerHeight;
			const sectionHeight = rect.height;

			// Calculate visible height of the section
			const visibleTop = Math.max(0, rect.top);
			const visibleBottom = Math.min(viewportHeight, rect.bottom);
			const visibleHeight = visibleBottom - visibleTop;

			// Check if at least 90% of the section is visible
			const visibilityPercentage = (visibleHeight / sectionHeight) * 100;
			const is90PercentVisible = visibilityPercentage >= 90;

			// CRITICAL: Only activate scroll holding when:
			// 1. Section is 90%+ visible in viewport
			// 2. Section top is at or near the top of viewport (user has scrolled to it)
			// 3. User is actually scrolling on top of the component
			// 4. Section is NOT far above viewport (user scrolling before reaching it)
			// 5. Section is NOT far below viewport (user scrolling past it)
			const sectionTopPosition = rect.top;
			const isSectionTooFarAbove = sectionTopPosition > viewportHeight * 0.3; // Section is below 30% of viewport
			const isSectionTooFarBelow = sectionTopPosition < -200; // Section is way above viewport (scrolled past)
			const isSectionInView =
				is90PercentVisible &&
				sectionTopPosition <= viewportHeight * 0.2 &&
				sectionTopPosition >= -100 &&
				!isSectionTooFarAbove &&
				!isSectionTooFarBelow;

			// If section is not properly in view, allow normal scroll - don't interfere
			if (!isSectionInView) {
				// Restore scroll behavior when not in view
				document.documentElement.style.scrollBehavior = "";
				// Clear any active scroll locks
				if (wheelTimeoutRef.current) {
					clearTimeout(wheelTimeoutRef.current);
					wheelTimeoutRef.current = null;
				}
				isHandlingWheelRef.current = false;
				return; // Allow normal scroll - don't interfere
			}

			// Only prevent scroll if section is in view AND user is scrolling on it
			// Prevent multiple rapid scroll events
			if (isHandlingWheelRef.current || isTransitioning) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			const deltaY = e.deltaY;
			const currentIndex = activeService;
			const totalSlides = services.length;

			// Check if we're at boundaries - check early and restore scroll immediately
			const isAtFirstSlide = currentIndex === 0;
			const isAtLastSlide = currentIndex === totalSlides - 1;

			// Scrolling down
			if (deltaY > 10) {
				if (isAtLastSlide) {
					// At last slide - restore scroll behavior and allow normal scroll
					document.documentElement.style.scrollBehavior = "";
					if (wheelTimeoutRef.current) {
						clearTimeout(wheelTimeoutRef.current);
						wheelTimeoutRef.current = null;
					}
					isHandlingWheelRef.current = false;
					return; // Allow normal scroll to next section
				} else {
					// Store current scroll position and prevent default scroll
					scrollPositionRef.current =
						window.pageYOffset || document.documentElement.scrollTop;
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();

					// Lock scroll position smoothly
					const currentScroll = scrollPositionRef.current;
					document.documentElement.style.scrollBehavior = "auto";
					window.scrollTo(0, currentScroll);

					isHandlingWheelRef.current = true;
					if (mainSwiperRef.current) {
						mainSwiperRef.current.slideNext();
					}

					// Reset flag after transition
					if (wheelTimeoutRef.current) {
						clearTimeout(wheelTimeoutRef.current);
					}
					wheelTimeoutRef.current = setTimeout(() => {
						// Restore scroll behavior
						document.documentElement.style.scrollBehavior = "";
						// Ensure scroll position is maintained
						window.scrollTo(0, scrollPositionRef.current);
						isHandlingWheelRef.current = false;
					}, 650);

					return false;
				}
			}
			// Scrolling up
			else if (deltaY < -10) {
				if (isAtFirstSlide) {
					// At first slide - restore scroll behavior and allow normal scroll
					document.documentElement.style.scrollBehavior = "";
					if (wheelTimeoutRef.current) {
						clearTimeout(wheelTimeoutRef.current);
						wheelTimeoutRef.current = null;
					}
					isHandlingWheelRef.current = false;
					return; // Allow normal scroll to previous section
				} else {
					// Store current scroll position and prevent default scroll
					scrollPositionRef.current =
						window.pageYOffset || document.documentElement.scrollTop;
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();

					// Lock scroll position smoothly
					const currentScroll = scrollPositionRef.current;
					document.documentElement.style.scrollBehavior = "auto";
					window.scrollTo(0, currentScroll);

					isHandlingWheelRef.current = true;
					if (mainSwiperRef.current) {
						mainSwiperRef.current.slidePrev();
					}

					// Reset flag after transition
					if (wheelTimeoutRef.current) {
						clearTimeout(wheelTimeoutRef.current);
					}
					wheelTimeoutRef.current = setTimeout(() => {
						// Restore scroll behavior
						document.documentElement.style.scrollBehavior = "";
						// Ensure scroll position is maintained
						window.scrollTo(0, scrollPositionRef.current);
						isHandlingWheelRef.current = false;
					}, 650);

					return false;
				}
			}
		};

		// Use passive: false to allow preventDefault (only needed on desktop)
		// On mobile, use passive: true to allow normal scroll
		const isMobile = window.innerWidth < 1024;
		mainContent.addEventListener("wheel", handleWheel, { passive: isMobile });

		return () => {
			mainContent.removeEventListener("wheel", handleWheel);
			if (wheelTimeoutRef.current) {
				clearTimeout(wheelTimeoutRef.current);
			}
			// Cleanup: restore scroll behavior if component unmounts during transition
			document.documentElement.style.scrollBehavior = "";
		};
	}, [activeService, isTransitioning, services.length]);

	// Scroll snapping: DISABLED - was causing unexpected scroll back behavior
	// Users can now scroll normally and slide navigation only works when scrolling directly on the component
	// useEffect(() => {
	// 	const mainContent = mainContentRef.current;
	// 	if (!mainContent) return;
	// 	// ... scroll snapping logic disabled
	// }, [isTransitioning]);

	return (
		<section className={styles.capabilitiesSection} ref={sectionRef}>
			{/* Header Section */}
			<div className={`${styles.headerSection} pt_80`} data-aos="fade-up">
				<div className="container">
					<div className={`${styles.headerContent} pb_40`}>
						<div className={styles.textContent}>
							<h2 className="main_title hp_space_mb">
								{data?.acf?.hm_oc_title ? parse(extractTextFromObject(data.acf.hm_oc_title)) : ""}
							</h2>
							<div>{data?.acf?.hm_oc_description ? parse(extractTextFromObject(data.acf.hm_oc_description)) : ""}</div>
						</div>
						<div className={styles.headerActions}>
							<Link
								href={getCleanLink(data?.acf?.hm_oc_button?.url)}
								className="common_btn text_lift_up_second"
							>
								{data?.acf?.hm_oc_button?.title ? parse(extractTextFromObject(data.acf.hm_oc_button.title)) : ""}
							</Link>
						</div>
						<div className={styles.decorativeElement}></div>
					</div>
				</div>
			</div>

			{/* Main Content with Vertical Swiper */}
			<div className={styles.mainContent} ref={mainContentRef}>
				<div className={styles.vectorImage}>
					<Image
						src="/images/capability_vector.png"
						alt={data?.acf?.hm_oc_vector_alt || data?.acf?.hm_oc_title || "Capability vector illustration"}
						width={830}
						height={901}
					/>
				</div>
				<div className={styles.swiperContainer}>
					{/* Main Vertical Swiper */}
					<Swiper
						modules={[Thumbs]}
						direction="vertical"
						spaceBetween={0}
						slidesPerView={1}
						speed={600}
						effect="slide"
						allowTouchMove={true}
						thumbs={{ swiper: thumbsSwiper }}
						className={styles.mainSwiper}
						onSwiper={(swiper) => {
							mainSwiperRef.current = swiper;
						}}
						onSlideChangeTransitionStart={() => setIsTransitioning(true)}
						onSlideChangeTransitionEnd={(swiper) => {
							setActiveService(swiper.activeIndex);
							setIsTransitioning(false);
						}}
						onSlideChange={(swiper) => {
							// Only update if not transitioning to avoid conflicts
							if (!isTransitioning) {
								setActiveService(swiper.activeIndex);
							}
						}}
					>
						{services.map((service, index) => (
							<SwiperSlide key={service.id} className={styles.slide}>
								<div className={styles.heroImage}>
									<Image
										src={service.image}
										alt={service.imageAlt || service.title}
										width={1920}
										height={800}
										className={styles.backgroundImage}
									/>
									<div className={styles.imageOverlay}></div>
								</div>

								{/* Left Overlay - Featured Service */}
								<div className={styles.leftOverlay}>
									<div
										className={`${styles.overlayContent} ${
											activeService === index ? styles.activeOverlay : ""
										}`}
										data-aos="fade-up"
										data-aos-delay="800"
									>
										<h3 className={styles.serviceTitle}>{service.title ? parse(service.title) : ""}</h3>
										<p>{service.description ? parse(service.description) : ""}</p>
										<Link
											href={service.link || "#"}
											className="common_white_btn text_lift_up_second pb_space_mt"
										>
											Explore {service.title ? parse(service.title) : ""}
										</Link>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>

					{/* Thumbnail Swiper */}
					<Swiper
						modules={[Thumbs]}
						onSwiper={(swiper) => {
							setThumbsSwiper(swiper);
							thumbSwiperRef.current = swiper;
						}}
						direction="vertical"
						spaceBetween={10}
						slidesPerView={6}
						watchSlidesProgress={true}
						slideToClickedSlide={true}
						className={styles.thumbSwiper}
						breakpoints={{
							320: {
								direction: "horizontal",
								slidesPerView: 2,
								spaceBetween: 5,
							},
							480: {
								direction: "horizontal",
								slidesPerView: 2.5,
								spaceBetween: 8,
							},
							768: {
								direction: "horizontal",
								slidesPerView: 3,
								spaceBetween: 10,
							},
							1024: {
								direction: "vertical",
								slidesPerView: 6,
								spaceBetween: 10,
							},
						}}
					>
						{services.map((service, index) => (
							<SwiperSlide key={service.id} className={styles.thumbSlide}>
								<div
									className={`${styles.thumbnailItem} ${
										activeService === index ? styles.active : ""
									}`}
									onClick={() => {
										if (mainSwiperRef.current) {
											mainSwiperRef.current.slideTo(index);
										}
										setActiveService(index);
									}}
								>
									<div className={styles.thumbnailContent}>
										<span className={styles.thumbnailTitle}>
											{service.title}
										</span>
										<span className={styles.arrowIcon}>
											<Image
												className={styles.topArrow}
												src="/images/slider_arw.png"
												alt="arrow-right"
												width={34}
												height={34}
											/>
											<Image
												className={styles.bottomArrow}
												src="/images/slider_arw.png"
												alt="arrow-right"
												width={34}
												height={34}
											/>
										</span>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</section>
	);
};

export default Capabilities;
