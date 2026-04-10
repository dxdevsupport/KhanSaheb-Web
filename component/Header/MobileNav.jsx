import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Style from "./Header.module.scss";
import parse from "html-react-parser";
import Image from "next/image";
import OptimizedImage from "../OptimizedImage";

const MobileNav = ({ menuData, isOpen, onClose }) => {
  const [data, setData] = useState(menuData);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const route = useRouter();

  // Update data from props or session storage
  useEffect(() => {
    if (menuData) {
      setData(menuData);
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
  }, [menuData]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setActiveSubmenu(null); // Close all submenus when menu closes
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleRouteComplete = () => {
      if (isOpen) onClose();
    };

    route.events.on("routeChangeComplete", handleRouteComplete);

    return () => {
      route.events.off("routeChangeComplete", handleRouteComplete);
    };
  }, [isOpen, route.events, onClose]);

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  // Helper function to normalize URLs
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

  // Helper function to check if current route matches
  const isMenuActive = (item) => {
    if (route.asPath === item.href) return true;
    if (item.hasSubmenu && item.submenuItems) {
      return item.submenuItems.some((subItem) => route.asPath === subItem.href);
    }
    return false;
  };

  // Default navigation items (fallback)
  const defaultNavigationItems = [];

  // Transform API data to navigation items
  const getNavigationItems = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return defaultNavigationItems;
    }

    return data.map((menuItem) => {
      const parentPage = menuItem.pp_parent_page;
      const subPages = menuItem.pp_sub_pages;
      const hasSubmenu =
        subPages && Array.isArray(subPages) && subPages.length > 0;

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
    <div
      className={`${Style.mobileNavOverlay} ${
        isOpen ? Style.mobileNavOpen : ""
      }`}
    >
      <Link href={"/"} className={Style.mob_logo} prefetch={true}>
        <div className={Style.mob_logo_container}>
          <OptimizedImage src={"/images/color_logo.svg"} alt="logo" fill />
        </div>
      </Link>
      {/* Close Button */}
      <button
        className={Style.mobileNavClose}
        onClick={onClose}
        aria-label="Close menu"
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

      {/* Navigation Links */}
      <nav className={Style.mobileNav}>
        <ul className={Style.mobileNavList}>
          {navigationItems.map((item, index) => (
            <li key={index} className={Style.mobileNavItem}>
              <div className={Style.mobileNavItemContent}>
                {item.hasSubmenu ? (
                  <button
                    className={`${Style.mobileNavLink} ${
                      isMenuActive(item) ? Style.active : ""
                    }`}
                    onClick={() => toggleSubmenu(index)}
                  >
                    {item?.label ? parse(String(item.label)) : ""}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`${Style.mobileNavLink} ${
                      isMenuActive(item) ? Style.active : ""
                    }`}
                    prefetch={true}
                  >
                    {item?.label ? parse(String(item.label)) : ""}
                  </Link>
                )}

                {item.hasSubmenu && (
                  <button
                    className={`${Style.mobileSubmenuArrow} ${
                      activeSubmenu === index ? Style.active : ""
                    }`}
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

              {/* Submenu */}
              {item.hasSubmenu && (
                <ul
                  className={`${Style.mobileSubmenu} ${
                    activeSubmenu === index ? Style.mobileSubmenuOpen : ""
                  }`}
                >
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
                      <li key={subIndex} className={Style.mobileSubmenuItem}>
                        <Link
                          href={subItem.href}
                          className={`${Style.mobileSubmenuLink} ${
                            route.asPath === subItem.href ? Style.active : ""
                          }`}
                          prefetch={true}
                        >
                          {subItem?.label ? parse(String(subItem.label)) : ""}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default MobileNav;
