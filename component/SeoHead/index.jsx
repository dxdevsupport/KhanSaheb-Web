import React from "react";
import Head from "next/head";
import { safeParse, safeParseDeep } from "../../libs/utils/helpers";
import { stripHtmlTags } from "../../libs/utils/textUtils";

const SITE_URL =  process.env.NEXT_PUBLIC_SITE_URL || "https://khansaheb.com";
const BACKEND_URL = process.env.BACKEND_URL || "https://api01-khansaheb.e8demo.com";

/**
 * SeoHead Component
 *
 * A reusable component for handling Yoast SEO meta tags across all pages.
 * Provides comprehensive SEO metadata including Open Graph, Twitter Cards, and JSON-LD schema.
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - WordPress page/post data containing yoast_head_json
 * @param {string} props.defaultTitle - Fallback title if Yoast data is not available
 * @param {string} props.defaultDescription - Fallback description if Yoast data is not available
 *
 * @example
 * <SeoHead
 *   data={pageData}
 *   defaultTitle="Our Services - Khansaheb"
 *   defaultDescription="Discover our comprehensive construction services"
 * />
 */
const SeoHead = ({
  data,
  defaultTitle = "Khansaheb Civil Engineering",
  defaultDescription = "Khansaheb Civil Engineering - Building excellence in the UAE for over 90 years.",
  path = "",
  locale = "",
}) => {
  // Helper to clean text (decode entities + strip tags)
  const clean = (text) => {
    if (!text) return "";
    // Replace straight quotes with curly quotes to avoid React escaping to &#x27;
    return stripHtmlTags(safeParse(text)).trim().replace(/'/g, "’");
  };

  // Helper to deep clean schema (decode entities only, preserve tags if any, or strip?)
  // Generally schema values shouldn't have HTML tags unless specified.
  // We'll use safeParseDeep which decodes entities.
  const cleanSchema = (value) => {
    return safeParseDeep(value);
  };

  // Extract Yoast SEO data
  const yoast = data?.yoast_head_json;

  // Determine title with fallback chain
  const title = clean(yoast?.title || data?.title?.rendered || defaultTitle);

  // Determine description with fallback chain
  const description = clean(
    yoast?.description ||
    data?.excerpt?.rendered ||
    defaultDescription
  );

  // Robots meta tag
  const robots = yoast?.robots
    ? Object.values(yoast.robots).join(", ")
    : "index, follow";

  // Canonical URL
  let canonical = yoast?.canonical || data?.link;
  
  // If path is provided, construct canonical URL to ensure it matches frontend domain
  if (path) {
    let cleanPath = path.startsWith("/") ? path : `/${path}`;

    if (locale === "en" && !cleanPath.startsWith("/en") && !cleanPath.startsWith("/ar")) {
      cleanPath = `/en${cleanPath === "/" ? "" : cleanPath}`;
    }

    const baseUrl = SITE_URL.replace(/\/$/, "");
    const normalizedPath =
      cleanPath === "/"
        ? "/"
        : cleanPath.replace(/\/?$/, "/");

    canonical = `${baseUrl}${normalizedPath}`;
  } else if (canonical && canonical.includes(BACKEND_URL)) {
      // Fallback: replace CMS domain if path not provided but canonical exists from CMS
      canonical = canonical.replace(BACKEND_URL, SITE_URL);
  }

  // Open Graph data
  const ogTitle = clean(yoast?.og_title) || title;
  const ogDescription = clean(yoast?.og_description) || description;
  const ogUrl = yoast?.og_url || canonical || data?.link;
  const ogType = yoast?.og_type || "website";
  const ogLocale = yoast?.og_locale || "en_US";
  const ogSiteName = clean(yoast?.og_site_name) || "Khansaheb Civil Engineering";
  
  // Handle multiple OG Images
  const ogImages = yoast?.og_image || [];

  // Twitter Card data
  const twitterCard = yoast?.twitter_card || "summary_large_image";
  const twitterTitle = clean(yoast?.twitter_title) || ogTitle;
  const twitterDescription = clean(yoast?.twitter_description) || ogDescription;
  const twitterImage = yoast?.twitter_image || ogImages?.[0]?.url;
  const twitterSite = clean(yoast?.twitter_site);
  const twitterCreator = clean(yoast?.twitter_creator);

  // Article meta
  const publishedTime = yoast?.article_published_time || data?.date;
  const modifiedTime = yoast?.article_modified_time || data?.modified;
  const articlePublisher = clean(yoast?.article_publisher);
  const articleAuthor = clean(yoast?.article_author);
  const articleSection = clean(yoast?.article_section);
  const articleTags = (yoast?.article_tag || []).map(tag => clean(tag));

  // JSON-LD Schema
  const schema = cleanSchema(yoast?.schema);

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      <meta name="robots" content={robots} key="robots" />
      {canonical && <link rel="canonical" href={canonical} key="canonical" />}

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={ogTitle} key="og:title" />
      <meta property="og:description" content={ogDescription} key="og:description" />
      {ogUrl && <meta property="og:url" content={ogUrl} key="og:url" />}
      <meta property="og:type" content={ogType} key="og:type" />
      <meta property="og:locale" content={ogLocale} key="og:locale" />
      <meta property="og:site_name" content={ogSiteName} key="og:site_name" />
      
      {ogImages.map((img, index) => (
        <React.Fragment key={`og:image:${index}`}>
          <meta property="og:image" content={img.url} />
          {img.width && <meta property="og:image:width" content={img.width.toString()} />}
          {img.height && <meta property="og:image:height" content={img.height.toString()} />}
          {img.type && <meta property="og:image:type" content={img.type} />}
        </React.Fragment>
      ))}

      {/* Article Specific Meta */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} key="article:published_time" />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} key="article:modified_time" />}
      {articlePublisher && <meta property="article:publisher" content={articlePublisher} key="article:publisher" />}
      {articleAuthor && <meta property="article:author" content={articleAuthor} key="article:author" />}
      {articleSection && <meta property="article:section" content={articleSection} key="article:section" />}
      {articleTags.map((tag, index) => (
        <meta property="article:tag" content={tag} key={`article:tag:${index}`} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} key="twitter:card" />
      <meta name="twitter:title" content={twitterTitle} key="twitter:title" />
      <meta name="twitter:description" content={twitterDescription} key="twitter:description" />
      {twitterImage && <meta name="twitter:image" content={twitterImage} key="twitter:image" />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} key="twitter:site" />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} key="twitter:creator" />}

      {/* JSON-LD Structured Data */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key="json-ld-schema"
        />
      )}
    </Head>
  );
};

export default SeoHead;
