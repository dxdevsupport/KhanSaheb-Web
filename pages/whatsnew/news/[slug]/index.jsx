import React, { useEffect } from "react";
import style from "../../detail.module.scss";
import Breadcrumb from "@/component/Breadcrumb";

import Image from "next/image";
import parse, { domToReact } from "html-react-parser";
import { axiosServer } from "@/libs/axios/axios";
import { useRouter } from "next/router";
import AOS from "aos";
import "aos/dist/aos.css";
import OptimizedImage from "@/component/OptimizedImage";
import constants from "@/common/constants";

import { getGlobalScripts } from "@/libs/services/headerAndFooterServices";

function NewsDetails({ post, relatedPosts, breadcrumbs, awardsHasContent, newsHasContent }) {
  const router = useRouter();

  const breadcrumbItems = breadcrumbs || [
    { label: "Home", href: "/" },
    { label: "What's New", href: awardsHasContent ? "/whatsnew/awards" : null },
    { label: "News", href: newsHasContent ? "/whatsnew/news" : null },
    { label: "News details", href: null },
  ];

  // Get current page URL for sharing
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(post?.title || "");

  // Social share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const socialMedia = [
    {
      name: "Facebook",
      icon: "/images/icons/fb-1.svg",
      path: shareUrls.facebook,
    },
    { name: "X", icon: "/images/icons/x-1.svg", path: shareUrls.twitter },
    {
      name: "Instagram",
      icon: "/images/icons/insta-1.svg",
      path: shareUrls.instagram,
    },
    {
      name: "LinkedIn",
      icon: "/images/icons/in-1.svg",
      path: shareUrls.linkedin,
    },
  ];

  const handleRelatedNewsClick = (slug) => {
    router.push(`/whatsnew/news/${slug}`);
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <>

      <div className={style.header_container}>
        <div className="container">
          <Breadcrumb items={breadcrumbItems} detailpage={true} />
          <div className={`${style.detail_container}`}>
            <div className={style.social_media_containers}>
              <span>Share</span>
              <div className={style.social_media_list}>
                {socialMedia.map((item, index) => (
                  <div
                    key={index}
                    data-aos="fade-up"
                    data-aos-delay={index * 300}
                  >
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={item.icon} alt={item.name || "Social media icon"} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className={style.new_details_container}>
              <h1>{post?.title || "Untitled"}</h1>
              <span>{post?.formattedDate || ""}</span>

              <div className={style.desc_container}>
                {post?.content ? (
                  parse(post.content, {
                    replace: (node) => {
                      // Skip blockquote elements (quote section)
                      if (node?.name === "blockquote" && post?.quoteSection?.text) {
                        return <></>;
                      }
                      
                      // Skip paragraph with quote_author class
                      if (node?.name === "p" && node.attribs?.class?.includes('quote_author') && post?.quoteSection?.author) {
                        return <></>;
                      }
                      
                      // Skip the paragraph with the quote image and description
                      if (node?.name === "p" && post?.quoteSection?.image) {
                        // Check if this paragraph contains an img with the quote image URL
                        const hasQuoteImage = node.children?.some(child => {
                          return child.name === "img" && child.attribs?.src === post.quoteSection.image.url;
                        });
                        if (hasQuoteImage) {
                          return <></>;
                        }
                      }
                      
                      // Handle links
                      if (node?.name === "a" && node.attribs) {
                        const href = node.attribs.href || "#";
                        const cls = node.attribs.class || undefined;
                        return (
                          <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
                            {domToReact(node.children)}
                          </a>
                        );
                      }
                    },
                  })
                ) : (
                  <p>No content available</p>
                )}
              </div>

              {post?.featuredImage && (
                <div className={style.news_img_box}>
                  <Image
                    src={post.featuredImage}
                    alt={post?.featuredImageAlt || post?.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}

              {/* Quote Section - Only render if quote data exists */}
              {post?.quoteSection?.text && (
                <div className={style.quote_section}>
                  <div className={style.quote_box}>
                    <div className={style.quote_icon_top}>
                      <OptimizedImage
                        src="/images/news_quotes.svg"
                        alt="Quote opening icon"
                        width={72}
                        height={51}
                      />
                    </div>
                    <p className={style.quote_text}>
                      {post.quoteSection.text}
                    </p>
                    {post.quoteSection.author && (
                      <p className={style.quote_author}>
                        {post.quoteSection.author}
                      </p>
                    )}
                    <div className={style.quote_icon_bottom}>
                      <OptimizedImage
                        src="/images/news_quotes.svg"
                        alt="Quote closing icon"
                        width={72}
                        height={51}
                      />
                    </div>
                  </div>
                  <div className={style.quote_content_grid}>
                    {post.quoteSection.image && (
                      <div className={style.quote_image_box}>
                        <Image
                          src={post.quoteSection.image.url}
                          alt={post.quoteSection.image.alt}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    )}
                    {post.quoteSection.description && (
                      <div className={style.quote_description}>
                        <p>{parse(post.quoteSection.description)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {relatedPosts && relatedPosts.length > 0 && (
              <div className={style.related_news_container}>
                <h3>Related News</h3>
                <div className={style.related_news_list}>
                  {relatedPosts.map((news, index) => (
                    <div
                      key={news.id}
                      data-aos="fade-up"
                      data-aos-delay={index * 300}
                      className={style.news_item}
                      onClick={() => handleRelatedNewsClick(news.slug)}
                      style={{ cursor: "pointer" }}
                    >
                      <h4>{news.title}</h4>
                      <p>{news.formattedDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  try {
    // Check if "Awards" (What's New) page has content
    let awardsHasContent = true;
    try {
      const awardsRes = await axiosServer.get(
        `/pages?slug=${constants.AWARDS.replace("/", "")}&_fields=id,acf&acf_format=standard`
      );
      if (awardsRes.data && awardsRes.data.length > 0) {
        const awardsPage = awardsRes.data[0];
        awardsHasContent =
          awardsPage.acf?.flexible_components &&
          awardsPage.acf.flexible_components.length > 0;
      } else {
        awardsHasContent = false;
      }
    } catch (e) {
      console.error("Error fetching Awards page:", e);
      awardsHasContent = false;
    }

    // Check if "News" page has content
    let newsHasContent = true;
    try {
      const newsRes = await axiosServer.get(
        `/pages?slug=${constants.NEWS.replace("/", "")}&_fields=id,acf&acf_format=standard`
      );
      if (newsRes.data && newsRes.data.length > 0) {
        const newsPage = newsRes.data[0];
        newsHasContent =
          newsPage.acf?.flexible_components &&
          newsPage.acf.flexible_components.length > 0;
      } else {
        newsHasContent = false;
      }
    } catch (e) {
      console.error("Error fetching News page:", e);
      newsHasContent = false;
    }

    // Fetch the specific post by slug
    const postResponse = await axiosServer.get(
      `/posts?slug=${slug}&acf_format=standard&_embed`
    );
    const postsData = postResponse.data;

    // WordPress API returns an array when querying by slug
    if (!postsData || !Array.isArray(postsData) || postsData.length === 0) {
      return {
        props: {
          post: null,
          relatedPosts: [],
          awardsHasContent,
          newsHasContent,
        },
      };
    }

    const postData = postsData[0];

    // Get featured image from _embedded data
    let featuredImage = null;
    if (
      postData._embedded &&
      postData._embedded["wp:featuredmedia"] &&
      postData._embedded["wp:featuredmedia"][0]
    ) {
      featuredImage = postData._embedded["wp:featuredmedia"][0].source_url;
    }

    // Format date
    const formattedDate = postData.date
      ? new Date(postData.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";

    // Helper function to extract quote section from HTML content
    const extractQuoteSection = (htmlContent) => {
      if (!htmlContent) return null;

      try {
        const cheerio = require('cheerio');
        const $ = cheerio.load(htmlContent, {
          decodeEntities: false,
          _useHtmlParser2: true
        });
        
        // Find blockquote element
        const blockquote = $('blockquote');
        if (blockquote.length === 0) return null;

        const quoteText = blockquote.text().trim();
        
        // Find the author paragraph (next p element after blockquote with class containing 'quote_author')
        let authorText = '';
        const authorParagraph = blockquote.next('p').filter((i, el) => {
          const classes = $(el).attr('class') || '';
          return classes.includes('quote_author');
        });
        
        if (authorParagraph.length > 0) {
          authorText = authorParagraph.text().trim();
        }

        // Find image after the quote (look for img tag after the author)
        let quoteImage = null;
        const imgElement = authorParagraph.next('p').find('img');
        if (imgElement.length > 0) {
          quoteImage = {
            url: imgElement.attr('src'),
            alt: imgElement.attr('alt') || 'Quote image',
            srcset: imgElement.attr('srcset'),
          };
        }

        // Get the description text (text after the image in the same paragraph)
        let descriptionText = '';
        const descParagraph = authorParagraph.next('p');
        if (descParagraph.length > 0) {
          // Clone and remove img to get only text
          const textOnly = descParagraph.clone();
          textOnly.find('img').remove();
          descriptionText = textOnly.text().trim();
        }

        return {
          quoteText,
          authorText,
          quoteImage,
          descriptionText,
        };
      } catch (error) {
        console.error('Error extracting quote section:', error);
        return null;
      }
    };

    const quoteSection = extractQuoteSection(postData.content?.rendered);

    // Process post data
    const post = {
      id: postData.id,
      slug: postData.slug,
      title: postData.title?.rendered
        ? String(postData.title.rendered).replace(/<[^>]*>/g, "")
        : "",
      excerpt: postData.excerpt?.rendered
        ? String(postData.excerpt.rendered).replace(/<[^>]*>/g, "")
        : "",
      content: postData.content?.rendered || "",
      date: postData.date,
      formattedDate: formattedDate,
      featuredImage: featuredImage,
      categories: postData.categories || [],
      tags: postData.tags || [],
      // Quote section data extracted from content
      quoteSection: quoteSection ? {
        text: quoteSection.quoteText,
        author: quoteSection.authorText,
        image: quoteSection.quoteImage,
        description: quoteSection.descriptionText,
      } : null,
    };

    // Fetch related posts (latest 5 posts excluding current one)
    const relatedResponse = await axiosServer.get(
      `/posts?acf_format=standard&per_page=6&exclude=${postData.id}&_embed`
    );
    const relatedData = relatedResponse.data || [];

    const relatedPosts = relatedData.slice(0, 5).map((relatedPost) => {
      const relatedFormattedDate = relatedPost.date
        ? new Date(relatedPost.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "";

      return {
        id: relatedPost.id,
        slug: relatedPost.slug,
        title: relatedPost.title?.rendered
          ? String(relatedPost.title.rendered).replace(/<[^>]*>/g, "")
          : "",
        formattedDate: relatedFormattedDate,
      };
    });

    // Extract Page Specific Scripts
    const pageScripts = {
      header_scripts: postData.meta?._hfs_header_scripts || "",
      body_scripts: postData.meta?._hfs_body_scripts || "",
      footer_scripts: postData.meta?._hfs_footer_scripts || "",
    };

    // Fetch Global Scripts
    const globalScripts = await getGlobalScripts();

    return {
      props: {
        post,
        data: postData,
        relatedPosts,
        awardsHasContent,
        newsHasContent,
        pageScripts,
        globalScripts,
      },
    };
  } catch (error) {
    console.error("Error fetching News post (SSR):", error);
    return {
      props: {
        post: null,
        relatedPosts: [],
      },
    };
  }
}

export default NewsDetails;
