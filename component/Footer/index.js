import React, { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "../OptimizedImage";
import styles from "./Footer.module.scss";
import { safeParse } from "@/libs/utils/helpers";

const Footer = ({ footerData: propFooterData }) => {
  const [footerData, setFooterData] = useState(propFooterData);

  // Update data from props or session storage
  useEffect(() => {
    if (propFooterData) {
      setFooterData(propFooterData);
    } else {
      // Fallback to session storage
      try {
        const cached = sessionStorage.getItem("footerData");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed) {
            setFooterData(parsed);
          }
        }
      } catch (error) {
        console.error("Error loading footer data from session storage:", error);
      }
    }
  }, [propFooterData]);
 
  // Helper function to process links
  const getLinkProps = (url) => {
    if (!url || url === "#") return { href: "#", target: "_self" };

    // Decode HTML entities
    let href = safeParse(url);

    // Remove trailing slash
    href = href.replace(/\/$/, "");

    // domains to strip to make links relative
    let backendOrigin = "";
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        backendOrigin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
      } catch (e) {
        // ignore invalid url
      }
    }

    const domainsToStrip = [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.BACKEND_URL,
      backendOrigin,
      "https://khansaheb.ae", // Production domain just in case
    ].filter(Boolean);

    let isInternal = false;

    // Check if it matches any internal domain
    for (const domain of domainsToStrip) {
      // Normalize domain by removing trailing slash
      const cleanDomain = domain.replace(/\/$/, "");
      
      if (href.startsWith(cleanDomain)) {
        href = href.replace(cleanDomain, "");
        isInternal = true;
        break;
      }

      // Also check http version if the domain is https
      if (cleanDomain.startsWith("https://")) {
        const httpDomain = cleanDomain.replace("https://", "http://");
        if (href.startsWith(httpDomain)) {
          href = href.replace(httpDomain, "");
          isInternal = true;
          break;
        }
      }
    }

    // If it didn't match specific domains, check if it's already relative
    if (!href.startsWith("http") && !href.startsWith("//")) {
      isInternal = true;
    }

    // Ensure internal links start with / if they are not # or mailto/tel
    if (isInternal && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
        href = `/${href}`;
    }

    return {
      href: href || "#",
      target: isInternal ? "_self" : "_blank",
    };
  };

  // Helper function to get footer menus from API data
  const getFooterMenus = () => {
    if (
      footerData?.fo_footer_menus &&
      Array.isArray(footerData.fo_footer_menus) &&
      footerData.fo_footer_menus.length > 0
    ) {
      return footerData.fo_footer_menus.map((menu) => ({
        title: safeParse(menu.fo_me_title),
        pages:
          menu.fo_me_pages && Array.isArray(menu.fo_me_pages)
            ? menu.fo_me_pages.map((page) => {
                const { href, target } = getLinkProps(page.fo_me_page?.url);
                return {
                  title: safeParse(page.fo_me_page?.title),
                  url: href,
                  target,
                };
              })
            : [],
      }));
    }

    return [];
  };

  // Helper function to get social links from API data
  const getSocialLinks = () => {
    if (
      footerData?.som_social_links &&
      Array.isArray(footerData.som_social_links) &&
      footerData.som_social_links.length > 0
    ) {
      return footerData.som_social_links.map((link) => {
         const { href, target } = getLinkProps(link.social_url);
         return {
            icon: link.som_social_icon || "",
            url: href,
            target
         };
      });
    }

    return [];
  };

  // Helper function to get privacy menus from API data
  const getPrivacyMenus = () => {
    if (
      footerData?.foo_privacy_menus &&
      Array.isArray(footerData.foo_privacy_menus) &&
      footerData.foo_privacy_menus.length > 0
    ) {
      return footerData.foo_privacy_menus.map((menu) => {
        const { href, target } = getLinkProps(menu.foo_privacy_menu?.url);
        return {
          title: safeParse(menu.foo_privacy_menu?.title),
          url: href,
          target,
        };
      });
    }

    return [];
  };

  const footerMenus = getFooterMenus();
  const socialLinks = getSocialLinks();
  const privacyMenus = getPrivacyMenus();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Logo Section */}
          <div className={styles.logoSection}>
            {footerData?.footer_logo?.url && (
              <div className={styles.logo}>
                <Link href="/">
                  <OptimizedImage
                    src={
                      footerData.footer_logo.sizes?.large ||
                      footerData.footer_logo.url
                    }
                    alt="Khansaheb Logo"
                    width={95}
                    height={95}
                    className={styles.logoImage}
                  />
                </Link>
              </div>
            )}
            {footerData?.fo_logo_bottom_text && (
              <p className={styles.hashtag}>{footerData.fo_logo_bottom_text}</p>
            )}
          </div>

          {/* Dynamic Footer Menus */}
          {footerMenus.map((menu, index) => (
            <div key={index} className={`${styles.column} footer_up`}>
              <h3 className={styles.columnTitle}>{menu.title}</h3>
              <ul className={styles.linkList}>
                {menu.pages.map((page, pageIndex) => (
                  <li key={pageIndex}>
                    <Link
                      href={page.url}
                      className={styles.footerLink}
                      target={page.target}
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Media */}
          {footerData?.som_title && socialLinks.length > 0 && (
            <div className={`${styles.column} ${styles.socialColumn} footer_up`}>
              <h3 className={styles.columnTitle}>{footerData.som_title}</h3>
              <div className={styles.socialIcons}>
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    className={styles.socialIcon}
                    target={link.target}
                  >
                    <span className={`icon-${link.icon}`}></span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Company History */}
          {(footerData?.foo_text_in_black ||
            footerData?.foo_text_in_red ||
            footerData?.foo_copyright_text ||
            privacyMenus.length > 0) && (
            <div className={`${styles.column} ${styles.historyColumn}`}>
              {(footerData?.foo_text_in_black ||
                footerData?.foo_text_in_red) && (
                <h5 className="footer_up_2">
                  {footerData?.foo_text_in_black}
                  {footerData?.foo_text_in_red && (
                    <span className={styles.historyText}>
                      {footerData.foo_text_in_red}
                    </span>
                  )}
                </h5>
              )}
              <div className={styles.copyright}>
                {footerData?.foo_copyright_text && (
                  <p className={styles.copyrightText}>
                    {footerData.foo_copyright_text}
                  </p>
                )}
                {privacyMenus.length > 0 && (
                  <ul className={styles.legalLinks}>
                    {privacyMenus.map((menu, index) => (
                      <React.Fragment key={index}>
                        <li>
                          <Link
                            href={menu.url}
                            className={styles.legalLink}
                            target={menu.target}
                          >
                            {menu.title}
                          </Link>
                        </li>
                        {index < privacyMenus.length - 1 && (
                          <li>
                            <span className={styles.separator}> | </span>
                          </li>
                        )}
                      </React.Fragment>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
