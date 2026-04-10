import { axiosServer } from "@/libs/axios/axios";

const SITEMAP_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://khansahebcivilengineering.com";

const LOCALES = ["en"];

function generateSiteMap(pages, services, projects, sectors, news) {
  // Create a map of pages for easy parent lookup
  const pageMap = {};
  pages.forEach((page) => {
    pageMap[page.id] = page;
  });

  // Helper to get full path
  const getPagePath = (page) => {
    let pathSegments = [page.slug];
    let current = page;

    // Traverse up the parent chain
    while (current.parent && current.parent !== 0 && pageMap[current.parent]) {
      current = pageMap[current.parent];
      pathSegments.unshift(current.slug);
    }

    return pathSegments.join("/");
  };

  const generateLocalizedUrls = (path) => {
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    const base = SITEMAP_BASE_URL.replace(/\/$/, "");

    return LOCALES.map((locale) => {
      const urlPath = cleanPath ? `${locale}/${cleanPath}` : locale;
      return `
     <url>
     <loc>${base}/${urlPath}/</loc>
     </url>`;
    }).join("");
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static Pages -->
     ${generateLocalizedUrls("")}
     ${generateLocalizedUrls("whatsnew/news")}
     ${generateLocalizedUrls("whatsnew/awards")}
     ${generateLocalizedUrls("whatsnew/insights")}
     
     <!-- Dynamic Pages -->
     ${pages
       .map((page) => {
         // Exclude home page if slug is 'home' or 'index' or 'home-page'
         if (
           page.slug === "home" ||
           page.slug === "index" ||
           page.slug === "home-page"
         )
           return "";

         // Exclude pages with empty ACF data or empty flexible_components
         if (
           !page.acf ||
           !page.acf.flexible_components ||
           page.acf.flexible_components.length === 0
         )
           return "";

         const fullPath = getPagePath(page);

         return generateLocalizedUrls(fullPath);
       })
       .join("")}

     <!-- Services -->
     ${services
       .map((service) => {
         return generateLocalizedUrls(`services/${service.slug}`);
       })
       .join("")}

     <!-- Projects -->
     ${projects
       .map((project) => {
         return generateLocalizedUrls(`ourprojects/${project.slug}`);
       })
       .join("")}
       
      <!-- Sectors -->
     ${sectors
       .map((sector) => {
         return generateLocalizedUrls(`our-sector/${sector.slug}`);
       })
       .join("")}

      <!-- News -->
     ${news
       .map((item) => {
         return generateLocalizedUrls(`whatsnew/news/${item.slug}`);
       })
       .join("")}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  // Fetch data
  try {
    const [pagesRes, servicesRes, projectsRes, sectorsRes, newsRes] =
      await Promise.all([
        axiosServer
          .get("/pages?per_page=100&acf_format=standard")
          .catch(() => ({ data: [] })),
        axiosServer
          .get("/service?per_page=100&acf_format=standard")
          .catch(() => ({ data: [] })),
        axiosServer
          .get("/project?per_page=100&acf_format=standard")
          .catch(() => ({ data: [] })),
        axiosServer
          .get("/sector?per_page=100&acf_format=standard")
          .catch(() => ({ data: [] })),
        axiosServer
          .get("/posts?per_page=100&acf_format=standard")
          .catch(() => ({ data: [] })),
      ]);

    const pages = pagesRes.data || [];
    const services = servicesRes.data || [];
    const projects = projectsRes.data || [];
    const sectors = sectorsRes.data || [];
    const news = newsRes.data || [];

    const sitemap = generateSiteMap(pages, services, projects, sectors, news);

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.statusCode = 500;
    res.end();
  }

  return {
    props: {},
  };
}

export default function SiteMap() {}
