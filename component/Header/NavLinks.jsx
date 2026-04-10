import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Style from "./Header.module.scss";
import Image from "next/image";
import parse from "html-react-parser";

const NavLinks = ({ data: propData, mobileMenuOpen, closeMobileMenu }) => {
	const [data, setData] = useState(propData);
	const [navShow, setNavShow] = useState(false);
	const [activeSubmenu, setActiveSubmenu] = useState(null);
	const route = useRouter();

	// Update data from props or session storage
	useEffect(() => {
		if (propData) {
			setData(propData);
		} else {
			// Fallback to session storage
			try {
				const cached = sessionStorage.getItem("headerData");
				if (cached) {
					const parsed = JSON.parse(cached);
					if (parsed?.header_menus) {
						setData(parsed.header_menus);
					}
				}
			} catch (error) {
				console.error("Error loading header data from session storage:", error);
			}
		}
	}, [propData]);

	// Sync with parent mobile menu state
	useEffect(() => {
		if (mobileMenuOpen !== undefined) {
			setNavShow(mobileMenuOpen);
			if (mobileMenuOpen) {
				document.body.classList.add("show-menu");
				document.documentElement.classList.add("show-menu");
				const header = document.querySelector("header");
				if (header) {
					header.classList.add(Style.menu_open);
				}
			} else {
				document.body.classList.remove("show-menu");
				document.documentElement.classList.remove("show-menu");
				const header = document.querySelector("header");
				if (header) {
					header.classList.remove(Style.menu_open);
				}
			}
		}
	}, [mobileMenuOpen]);

	const onToggleNav = () => {
		setNavShow((status) => {
			if (status) {
				document.body.classList.remove("show-menu");
				document.documentElement.classList.remove("show-menu");
				document.querySelector("header").classList.remove(Style.menu_open);
			} else {
				document.body.classList.add("show-menu");
				document.documentElement.classList.add("show-menu");
				document.querySelector("header").classList.add(Style.menu_open);
			}
			return !status;
		});
	};

	const toggleSubmenu = (index) => {
		setActiveSubmenu(activeSubmenu === index ? null : index);
	};

	// Add scrolled class to header when submenu is active
	useEffect(() => {
		const header = document.querySelector("header");
		if (activeSubmenu !== null) {
			header?.classList.add(Style.Scrolled);
		} else {
			// Only remove Scrolled class if page is not actually scrolled
			// Check scroll position before removing to avoid conflicts with Header's scroll logic
			const isPageScrolled = window.scrollY > window.innerHeight * 0.2;
			if (!isPageScrolled) {
				header?.classList.remove(Style.Scrolled);
			}
		}
	}, [activeSubmenu]);

	// Close submenu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (activeSubmenu !== null) {
				const submenu = document.querySelector(
					`.${Style.submenu}.${Style.submenuActive}`
				);
				const submenuArrow = document.querySelector(
					`.${Style.submenuArrow}.${Style.active}`
				);

				if (
					submenu &&
					submenuArrow &&
					!submenu.contains(event.target) &&
					!submenuArrow.contains(event.target)
				) {
					setActiveSubmenu(null);
				}
			}
		};

		if (activeSubmenu !== null) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [activeSubmenu]);

	const [scrolled, setScrolled] = useState(false);
	const activeSubmenuRef = useRef(null);

	// Keep ref in sync with activeSubmenu state
	useEffect(() => {
		activeSubmenuRef.current = activeSubmenu;
	}, [activeSubmenu]);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 0);
		};

		// Run once on mount in case page is already scrolled
		handleScroll();

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Close submenu when user scrolls
	useEffect(() => {
		const handleScrollCloseSubmenu = () => {
			if (activeSubmenuRef.current !== null) {
				setActiveSubmenu(null);
			}
		};

		window.addEventListener("scroll", handleScrollCloseSubmenu);

		return () => {
			window.removeEventListener("scroll", handleScrollCloseSubmenu);
		};
	}, []);

	// Default navigation items with submenu (fallback)
	const defaultNavigationItems = [];

	// Helper function to normalize URLs from API to match application routes
	const normalizeUrl = (url) => {
		if (!url || url === "#") return url;

		// Strip domain (protocol + hostname)
		let normalized = url.replace(/^https?:\/\/[^\/]+/, "");

		// Handle root URL case (if normalized became empty)
		if (!normalized) normalized = "/";

		// Remove trailing slash (only if not root "/")
		if (normalized.length > 1 && normalized.endsWith("/")) {
			normalized = normalized.slice(0, -1);
		}

		// Decode HTML entities (e.g., &amp; -> &) - SSR-safe version
		normalized = normalized
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'");

		return normalized;
	};

	// Helper function to check if current route matches any submenu item
	const isMenuActive = (item) => {
		// Check if main href matches
		if (route.asPath === item.href) return true;

		// Check if any submenu item matches
		if (item.hasSubmenu && item.submenuItems) {
			return item.submenuItems.some((subItem) => route.asPath === subItem.href);
		}

		return false;
	};

	// Helper function to transform API data to navigation items format
	const getNavigationItems = () => {
		if (!data || !Array.isArray(data) || data.length === 0) {
			return [];
		} 
		return data.map((menuItem) => {
			const parentPage = menuItem.pp_parent_page;
			const subPages = menuItem.pp_sub_pages;

			// Check if this menu item has subpages
			const hasSubmenu =
				subPages && Array.isArray(subPages) && subPages.length > 0;

			// Get the first submenu item's URL as the main href, or use parent URL
			const rawMainHref =
				hasSubmenu && subPages[0]?.pp_sub_page?.url
					? subPages[0].pp_sub_page.url
					: parentPage?.url || "#";

			const mainHref = normalizeUrl(rawMainHref);

			return {
				label: parentPage?.title || "",
				href: mainHref,
				subLabel: menuItem.pp_parent_page_description || "",
				hasSubmenu: hasSubmenu,
				description: menuItem.pp_short_description || "",
				submenuItems: hasSubmenu
					? subPages.map((subPage) => ({
							label: subPage.pp_sub_page?.title || "",
							href: normalizeUrl(subPage.pp_sub_page?.url) || "#",
					  }))
					: [],
			};
		});
	};

	const navigationItems = getNavigationItems();

	return (
		<>
			{/* Old hamburger button - hidden as we're using the one in Header */}
			<button
				aria-label="Toggle Menu"
				onClick={onToggleNav}
				className={`${Style.mobMenuBtn} ${
					scrolled == true && Style.min_mobmenubtn
				} mobMenuBtn`}
				style={{ display: "none" }}
			>
				<span></span>
				<span></span>
				<span></span>
			</button>

			<div
				className={`${Style.main_nav}  ${navShow ? Style.showNav : ""}   ${
					scrolled == true && Style.min_nav_height
				}`}
			>
				<ul>
					{navigationItems.map((item, index) => (
						<li key={index} className={Style.navItem}>
							<div className={Style.navItemContent}>
								{item.hasSubmenu ? (
									// Parent menu item with submenu - prevent navigation, toggle dropdown instead
									<a
										href="#"
										className={`${isMenuActive(item) && Style.active}`}
										onClick={(e) => {
											e.preventDefault();
											toggleSubmenu(index);
										}}
									>
										{item?.label ? parse(String(item.label)) : ""}
									</a>
								) : (
									// Regular menu item without submenu - allow navigation
									<Link
										href={item.href}
										className={`${isMenuActive(item) && Style.active}`}
										onClick={() => {
											setNavShow(false);
											setActiveSubmenu(null);
											if (closeMobileMenu) {
												closeMobileMenu();
											}
										}}
									>
										{item?.label ? parse(String(item.label)) : ""}
									</Link>
								)}
								{item.hasSubmenu && (
									<button
										className={`${Style.submenuArrow} ${
											activeSubmenu === index ? Style.active : ""
										} ${isMenuActive(item) && Style.open}`}
										onClick={() => toggleSubmenu(index)}
										aria-label="Toggle submenu"
									>
										<svg
											width="8"
											height="6"
											viewBox="0 0 8 6"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M4 6L0 0H8L4 6Z" fill="currentColor" />
										</svg>
									</button>
								)}
							</div>
							{item.hasSubmenu && (
								<div
									className={`${Style.submenu} ${
										activeSubmenu === index ? Style.submenuActive : ""
									}`}
								>
									<ul>
										{item.submenuItems
											.filter(
												(subItem) =>
													subItem.href &&
													subItem.href !== "#" &&
													!subItem.href.endsWith("#") &&
													subItem.label &&
													subItem.label.trim() !== ""
											)
											.map((subItem, subIndex) => (
												<li key={subIndex} className={Style.submenuItem}>
													<Link
														href={subItem.href}
														className={`${Style.submenuLink} ${
															route.asPath === subItem.href && Style.active
														}`}
														onClick={() => {
															setNavShow(false);
															setActiveSubmenu(null);
															if (closeMobileMenu) {
																closeMobileMenu();
															}
														}}
													>
														<span>
															{subItem?.label
																? parse(String(subItem.label))
																: ""}
														</span>
													</Link>
												</li>
											))}
									</ul>
									<div className={Style.submenuTitle}>
										<div className={Style.label_head}>
											<h3>{item.label}</h3>
											<span>{item.subLabel}</span>
										</div>
										<p>{item.description}</p>
									</div>
								</div>
							)}
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default NavLinks;
