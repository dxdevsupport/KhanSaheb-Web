"use client";
import { useEffect, useRef, useState } from "react";

import style from "./Header.module.scss";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";
import comon from "@/styles/comon.module.scss";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import parse from "html-react-parser";

import SeoHead from "@/component/SeoHead";

const MainHeader = ({ headerData, seoData, is404 }) => {
	const [scrolled, setScrolled] = useState(false);
	const inputRef = useRef(null);
	const route = useRouter();

	const inputFieldRef = useRef(null);
	const dropdownRef = useRef(null);

	// Search state
	const [inputShow, setInputShow] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showResults, setShowResults] = useState(false);

	// Mobile menu state
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
	};

	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY;
			const halfPageHeight = window.innerHeight * 0.1;

			if (scrollPosition > halfPageHeight) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		// Run once on mount in case page is already scrolled
		handleScroll();

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const InputShowHandler = () => {

		setInputShow(!inputShow);
		setScrolled(true);
		// Reset search state when closing
		if (inputShow) {
			setSearchQuery("");
			setSearchResults([]);
			setShowResults(false);
		}
	};
	useEffect(() => {
		if (inputShow && inputFieldRef.current) {
			// Delay focus to wait for CSS transition or visibility to apply
			const timeout = setTimeout(() => {
				inputFieldRef.current.focus();
			}, 50); // Adjust delay if needed

			return () => clearTimeout(timeout);
		}
	}, [inputShow]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (inputRef.current && !inputRef.current.contains(event.target)) {
				setInputShow(false);
			}
		};

		document.addEventListener("pointerdown", handleClickOutside);
		return () => {
			document.removeEventListener("pointerdown", handleClickOutside);
		};
	}, []);

	// Handle scroll within dropdown to prevent page scrolling
	useEffect(() => {
		const dropdown = dropdownRef.current;
		if (!dropdown || !showResults) return;

		const handleWheel = (e) => {
			const { scrollTop, scrollHeight, clientHeight } = dropdown;
			const isScrollingDown = e.deltaY > 0;
			const isScrollingUp = e.deltaY < 0;
			const isAtTop = scrollTop <= 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			// If at top and scrolling up, or at bottom and scrolling down, prevent default
			if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
				// Allow page to scroll only at boundaries
				return;
			}

			// Prevent page scroll when scrolling within dropdown
			e.stopPropagation();
		};

		const handleTouchMove = (e) => {
			// Allow touch scrolling within dropdown
			e.stopPropagation();
		};

		dropdown.addEventListener("wheel", handleWheel, { passive: true });
		dropdown.addEventListener("touchmove", handleTouchMove, { passive: true });

		return () => {
			dropdown.removeEventListener("wheel", handleWheel);
			dropdown.removeEventListener("touchmove", handleTouchMove);
		};
	}, [showResults]);

	const { locale } = useRouter();

	const switchLocale = locale === "en" ? "ar" : "en";
	const { asPath } = useRouter();

	// Function to check if current page is the whatsnew news detail page (pages/whatsnew/news/[slug])
	const isDetailPage = () => {
		return route.pathname === "/whatsnew/news/[slug]" || is404 === true;
	};

	const [pageScrolled, setPageScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setPageScrolled(window.scrollY > 0);
		};

		// Run once on mount in case page is already scrolled
		handleScroll();

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Handle search functionality
	const searchContent = async (query) => {
		try {
			if (!query || query.trim().length === 0) {
				return [];
			}

			const WP_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

			// 1. Standard API Search (Fast, covers standard content)
			const standardSearchPromise = fetch(
				`${WP_API_BASE_URL}/search?search=${encodeURIComponent(
					query
				)}&per_page=10`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			).then(res => res.json());

			// 2. Deep Content Search (Slower, covers ACF and hidden fields)
			// Fetch all pages to search locally within their content/ACF
			const deepPageSearchPromise = fetch(
				`${WP_API_BASE_URL}/pages?per_page=100&acf_format=standard`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			).then(res => res.json());

			// Execute both fetches in parallel
			const [standardResults, deepPageResults] = await Promise.all([
				standardSearchPromise,
				deepPageSearchPromise
			]);

			// Recursive function to search for query string in any object/array
			// Recursive function to search for query string in any object/array
			const deepSearch = (obj, queryLower) => {
				if (!obj) return false;

				// Direct string match
				if (typeof obj === 'string') {
					// Ignore strings that look like file paths or massive data blobs (optional heuristic)
					if (obj.length > 5000) return false;
					return obj.toLowerCase().includes(queryLower);
				}
				if (typeof obj === 'number') return obj.toString().includes(queryLower);

				// Array: Search all elements
				if (Array.isArray(obj)) {
					return obj.some(item => deepSearch(item, queryLower));
				}

				// Object: Search values, but ignore specific metadata keys
				if (typeof obj === 'object') {
					const ignoredKeys = [
						'url', 'href', 'src', 'link', 'type', 'subtype', 'id', 'slug',
						'item_group_id', 'key', '_key', 'width', 'height', 'class', 'style',
						'target', 'rel', 'mime_type', 'alt' // 'alt' might be debatable, but usually secondary
					];

					return Object.entries(obj).some(([key, val]) => {
						if (ignoredKeys.includes(key.toLowerCase())) return false;
						return deepSearch(val, queryLower);
					});
				}

				return false;
			};

			const queryLower = query.toLowerCase();

			// Process Deep Search Results
			const deepFoundResults = Array.isArray(deepPageResults)
				? deepPageResults.filter(page => {
					// Check Title
					if (page.title?.rendered?.toLowerCase().includes(queryLower)) return true;
					// Check Content
					if (page.content?.rendered?.toLowerCase().includes(queryLower)) return true;
					// Check ACF Fields (Deep Search)
					return page.acf ? deepSearch(page.acf, queryLower) : false;
				}).map(page => ({
					id: page.id,
					title: page.title?.rendered || "Untitled",
					url: page.link, // WP API returns 'link' for pages
					type: "page",
					excerpt: page.excerpt?.rendered || "",
					slug: page.slug
				}))
				: [];

			// Process Standard Results
			const normalizedStandardResults = Array.isArray(standardResults)
				? standardResults.map((result) => {
					const urlObj = new URL(result.url);
					const pathSegments = urlObj.pathname.split("/").filter(Boolean);
					const slug = pathSegments[pathSegments.length - 1] || "";

					return {
						id: result.id,
						title: result.title,
						url: result.url,
						type: result.subtype || result.type,
						excerpt: result.excerpt || "",
						slug: slug,
					};
				})
				: [];

			// 3. Dynamic Menu Search
			const flattenMenu = (menus) => {
				if (!menus || !Array.isArray(menus)) return [];

				const items = [];

				menus.forEach(menu => {
					// Parent Page
					if (menu.pp_parent_page && menu.pp_parent_page.title) {
						items.push({
							id: `local-${items.length}`,
							title: menu.pp_parent_page.title,
							url: menu.pp_parent_page.url,
							type: "page",
							excerpt: menu.pp_short_description || "",
							slug: menu.pp_parent_page.url.split("/").filter(Boolean).pop() || "",
						});
					}

					// Sub Pages
					if (menu.pp_sub_pages && Array.isArray(menu.pp_sub_pages)) {
						menu.pp_sub_pages.forEach(sub => {
							if (sub.pp_sub_page && sub.pp_sub_page.title) {
								items.push({
									id: `local-${items.length}`,
									title: sub.pp_sub_page.title,
									url: sub.pp_sub_page.url,
									type: "page",
									excerpt: "",
									slug: sub.pp_sub_page.url.split("/").filter(Boolean).pop() || "",
								});
							}
						});
					}
				});

				return items;
			};

			const menuSearchIndex = flattenMenu(headerData?.header_menus);

			const processedMenuResults = menuSearchIndex
				.filter(item => item.title.toLowerCase().includes(queryLower))
				.map(item => ({
					...item,
					url: mapWordPressUrlToNextJs(item.url),
				}));


			// Merge all results and deduplicate by ID or URL
			const allResults = [
				...processedMenuResults,
				...deepFoundResults,
				...normalizedStandardResults
			];

			// Deduplicate based on unique URL (or ID if URL is not reliable per se, but URL is best for frontend)
			const uniqueResults = [];
			const seenUrls = new Set();

			allResults.forEach(item => {
				// Normalize URL for deduplication
				// We need to be careful with WP standard results which might have full domain vs relative
				// Let's try to map all to NextJS format first if possible, or just use the slug/id combination

				// Simple dedupe by ID first (Standard & Deep might share IDs)
				// Menu items have string IDs 'local-X', others have number IDs
				const identifier = item.id.toString();

				// A better deduper might be the final ID
				if (!seenUrls.has(identifier)) {
					seenUrls.add(identifier);
					uniqueResults.push(item);
				}
			});

			return uniqueResults;
		} catch (error) {
			console.error("Error searching content:", error);
			return [];
		}
	};
	const handleSearch = async (query) => {
		if (!query || query.trim().length === 0) {
			setSearchResults([]);
			setShowResults(false);
			return;
		}

		setIsSearching(true);
		setShowResults(true);

		try {
			const results = await searchContent(query);
			setSearchResults(results);
		} catch (error) {
			console.error("Error searching:", error);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	// Handle search input change with debounce
	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			if (searchQuery.trim().length > 0) {
				handleSearch(searchQuery);
			} else {
				setSearchResults([]);
				setShowResults(false);
			}
		}, 500); // 800ms debounce for heavy deep search

		return () => clearTimeout(debounceTimer);
	}, [searchQuery]);

	// Map WordPress URLs to Next.js routes based on actual pages directory structure
	const mapWordPressUrlToNextJs = (wpUrl) => {
		try {
			if (!wpUrl || wpUrl === "#") return "/";

			let path = wpUrl;
			// Only parse as URL if it's absolute
			if (wpUrl.startsWith("http")) {
				const urlObj = new URL(wpUrl);
				path = urlObj.pathname;
			}

			// Remove trailing slash
			path = path.replace(/\/$/, "");

			// ===== PARENT MENU ITEMS (redirect to first child page) =====
			// These are parent menu items that don't have their own pages in Next.js
			// They only serve as dropdown containers in the navigation

			const parentMenuRedirects = {
				"/who-we-are": "/ourhistory", // First child: Our History
				"/what-we-do": "/ourprojects", // First child: Our Projects & Sectors
				"/why-khansaheb": "/why-khansaheb/health-and-safety", // First child: Health & Safety
				"/whats-new": "/whatsnew/awards", // First child: Awards
				"/work-with-us": "/work-with-us/emiratization", // First child: Emiratization
			};

			// Check if this is a parent menu item
			if (parentMenuRedirects[path]) {
				return parentMenuRedirects[path];
			}

			// ===== CUSTOM POST TYPES =====

			// Services: /service/{slug} → /services/{slug}
			// Verified: pages/services/construction, fit-out-interiors, mep-services, pre-construction, roads-infrastructure, specialist-joinery
			if (path.startsWith("/service/")) {
				return path.replace("/service/", "/services/");
			}

			// Sectors: /sector/{slug} → /our-sector/{slug}
			// Verified: pages/our-sector/commercial, education-healthcare, hospitality, infrastructure-government, manufacturing-industrial, residential, retail, sports-leisure
			if (path.startsWith("/sector/")) {
				return path.replace("/sector/", "/our-sector/");
			}

			// Projects: /project/{slug} → /ourprojects/{slug}
			// Note: Next.js has /ourprojects/[id] route that uses slugs
			if (path.startsWith("/project/")) {
				const slug = path.replace("/project/", "");
				return `/ourprojects/${slug}`;
			}

			// Awards: /award/{slug} → /whatsnew/awards (listing page only)
			// Verified: pages/whatsnew/awards/index.js exists, no [id] route
			if (path.startsWith("/award/")) {
				return "/whatsnew/awards";
			}

			// Team members: /our-team/{slug} → /our-leadership (listing page only)
			// Verified: pages/our-leadership/index.js exists, no individual team pages
			if (path.startsWith("/our-team/")) {
				return "/our-leadership";
			}

			// News: /news/{slug} → /whatsnew/news/{slug}
			if (path.startsWith("/news/")) {
				const slug = path.replace("/news/", "");
				return `/whatsnew/news/${slug}`;
			}

			// Insights: /insight/{slug} → /whatsnew/insights/{slug}
			if (path.startsWith("/insight/")) {
				const slug = path.replace("/insight/", "");
				return `/whatsnew/insights/${slug}`;
			}

			// Date-based URLs (Standard Posts): /YYYY/MM/DD/{slug} → /whatsnew/news/{slug}
			// Regex to match /YYYY/MM/DD/ pattern
			const dateRegex = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)/;
			const dateMatch = path.match(dateRegex);
			if (dateMatch) {
				const slug = dateMatch[1];
				return `/whatsnew/news/${slug}`;
			}

			// ===== PAGES WITH SPECIFIC SLUG MAPPINGS =====

			// WordPress slug → Next.js slug mappings (where they differ)
			const slugMappings = {
				"health-safety": "health-and-safety",
				"culture-integrity": "culture-and-integrity",
				"esg-page": "esg",
				"our-leadership-team": "our-leadership",
				// Note: 'our-projects-sectors' is handled as a special case in /what-we-do/ section
			};

			// ===== PAGES WITH PARENT PATH CHANGES =====

			// WordPress uses /who-we-are/ but Next.js doesn't have this parent
			// /who-we-are/our-history → /our-history
			// /who-we-are/our-timeline → /our-timeline
			// /who-we-are/our-legacy → /our-legacy
			// /who-we-are/our-leadership-team → /our-leadership
			if (path.startsWith("/who-we-are/")) {
				const slug = path.replace("/who-we-are/", "");
				const mappedSlug = slugMappings[slug] || slug;
				return `/${mappedSlug}`;
			}

			// WordPress uses parent paths for these sections, Next.js keeps them
			// /why-khansaheb/* → /why-khansaheb/* (keep parent, but fix slug if needed)
			if (path.startsWith("/why-khansaheb/")) {
				const slug = path.replace("/why-khansaheb/", "");
				const mappedSlug = slugMappings[slug] || slug;
				return `/why-khansaheb/${mappedSlug}`;
			}

			// /what-we-do/* → Handle special cases
			if (path.startsWith("/what-we-do/")) {
				const slug = path.replace("/what-we-do/", "");

				// Special cases: These pages exist at root level, not under /what-we-do/
				if (slug === "our-projects-sectors") {
					return "/ourprojects";
				}
				if (slug === "our-services") {
					return "/whatwedo/services";
				}

				// For other pages, keep parent and fix slug if needed
				const mappedSlug = slugMappings[slug] || slug;
				return `/what-we-do/${mappedSlug}`;
			}

			// /whatsnew/* → /whatsnew/* (keep parent)
			if (path.startsWith("/whatsnew/")) {
				return path;
			}

			// /work-with-us/* → /work-with-us/* (keep parent)
			if (path.startsWith("/work-with-us/")) {
				return path;
			}

			// ===== FALLBACK FOR OTHER PAGES =====

			// For any other page, check if slug needs mapping
			const segments = path.split("/").filter(Boolean);
			if (segments.length === 1) {
				const slug = segments[0];
				const mappedSlug = slugMappings[slug] || slug;
				return `/${mappedSlug}`;
			}

			// If nothing matched, return the path as-is
			return path;
		} catch (error) {
			console.error("Error mapping WordPress URL:", error);
			return "/";
		}
	};

	// Handle result click
	const handleResultClick = (url) => {
		// Map WordPress URL to Next.js route
		const path = mapWordPressUrlToNextJs(url);

		// Navigate to the page
		route.push(path);

		// Close search
		setInputShow(false);
		setSearchQuery("");
		setSearchResults([]);
		setShowResults(false);
	};

	return (
		<>

			<header
				className={`${style.MainHeader} ${isDetailPage() ? style.detailPage_header : ""
					} ${scrolled ? style.Scrolled : ""} `}>
				<div className={`${comon.container}`}>
					<div className={style.headerInner}>
						<div
							className={`${style.logo} ${style.header_logo} ${pageScrolled == true && style.header_sticky_logo
								}`}
						>
							<Link href="/">
								<Image
									src={scrolled ? "/images/color_logo.svg" : "/images/logo.svg"}
									width={326}
									height={53}
									alt="Khansaheb company logo"
									unoptimized
								/>
							</Link>
						</div>
						<div className={style.header_right}>
							{/* Desktop Navigation */}
							<div className={style.navLinks}>
								<NavLinks data={headerData?.header_menus} />
							</div>
							<div className={style.head_right_block}>

								<div className={style.searchIcon}>
									<button
										className={style.searchButton}
										onClick={InputShowHandler}
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</button>
								</div>
								{/* Hamburger Menu Button - Visible below 1200px */}
								<button
									className={style.hamburgerButton}
									onClick={toggleMobileMenu}
									aria-label="Toggle Menu"
								>
									{mobileMenuOpen ? (
										// Close Icon
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M18 6L6 18M6 6L18 18"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									) : (
										// Hamburger Icon
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M3 12H21M3 6H21M3 18H21"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									)}
								</button>
							</div>
						</div>
					</div>

					{/* Search Input */}
					{inputShow && (
						<div className={style.searchInputWrapper} ref={inputRef}>
							{!showResults && (
								<button
									className={style.closeSearchButton}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setInputShow(false);
										setSearchQuery("");
										setScrolled(true)
										setSearchResults([]);
										setShowResults(false);
									}}
									aria-label="Close search"
									type="button"
								>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M18 6L6 18M6 6L18 18"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							)}
							<div className={style.searchInputContainer}>
								<input
									ref={inputFieldRef}
									type="text"
									placeholder="Search..."
									className={style.searchInput}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Escape") {
											setInputShow(false);
											setSearchQuery("");
											setSearchResults([]);
											setShowResults(false);
										}
									}}
								/>
								{searchQuery && (
									<button
										className={style.clearButton}
										onClick={() => {
											setSearchQuery("");
											setSearchResults([]);
											setShowResults(false);
											inputFieldRef.current?.focus();
										}}
										aria-label="Clear search"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M18 6L6 18M6 6L18 18"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</button>
								)}
							</div>

							{/* Search Results Dropdown */}
							{showResults && (
								<div className={style.searchResultsDropdown} ref={dropdownRef}>
									{isSearching ? (
										<div className={style.searchLoading}>Searching...</div>
									) : searchResults.length > 0 ? (
										<ul className={style.searchResultsList}>
											{searchResults.map((result, index) => (
												<li key={`${result.id}-${index}`} className={style.searchResultItem}>
													<button
														className={style.searchResultLink}
														onClick={() => handleResultClick(result.url)}
													>
														<span className={style.resultTitle}>
															{parse(result.title)}
														</span>
														{result.type && (
															<span className={style.resultType}>{result.type}</span>
														)}
													</button>
												</li>
											))}
										</ul>
									) : (
										<div className={style.noResults}>No results found</div>
									)}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Mobile Navigation Menu */}
				<MobileNav
					isOpen={mobileMenuOpen}
					onClose={closeMobileMenu}
					menuData={headerData?.header_menus}
				/>
			</header>
		</>
	);
};

export default MainHeader;
