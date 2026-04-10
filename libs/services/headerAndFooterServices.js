const WP_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const BASE_URL = WP_API_BASE_URL ? WP_API_BASE_URL.replace('/wp/v2', '/custom/v1') : "";

export const getHeaderData = async () => {
  try {
    if (!BASE_URL) throw new Error("BASE_URL is missing");
    const response = await fetch(`${BASE_URL}/header?acf_format=standard`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching header:", error);
    return null;
  }
};

export const getFooterData = async () => {
  try {
    if (!BASE_URL) throw new Error("BASE_URL is missing");
    const response = await fetch(`${BASE_URL}/footer?acf_format=standard`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching footer:", error);
    return null;
  }
};

export const getGlobalScripts = async () => {
  try {
    if (!BASE_URL) return null;
    const response = await fetch(`${BASE_URL}/hfs-scripts`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Scripts API returned ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching scripts:", error);
    return null;
  }
};

const useHeaderAndFooterServices = () => {
  const getHeader = getHeaderData;
  const getFooter = getFooterData;
  const getScripts = getGlobalScripts;

  /**
   * Search WordPress pages only (excludes custom post types)
   * @param {string} query - Search query string
   * @returns {Promise<Array>} Array of search results with normalized structure (pages only)
   */
  const searchContent = async (query) => {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      // Use WordPress universal search endpoint with subtype filter for pages only
      const response = await fetch(
        `${WP_API_BASE_URL}/search?search=${encodeURIComponent(query)}&subtype=page&per_page=10`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search API returned ${response.status}`);
      }

      const results = await response.json();

      // Normalize the search results to a consistent format
      // Filter to ensure only pages are included (double-check in case API returns other types)
      const normalizedResults = results
        .filter((result) => {
          // Only include results where subtype is "page"
          // This excludes custom post types like: service, sector, project, award, our-team, news, insight
          return result.subtype === 'page';
        })
        .map((result) => {
          // Extract slug from URL for debugging
          const urlObj = new URL(result.url);
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          const slug = pathSegments[pathSegments.length - 1] || '';

          return {
            id: result.id,
            title: result.title,
            url: result.url,
            type: result.subtype || result.type, // Will always be "page" after filtering
            excerpt: result.excerpt || "",
            slug: slug, // Add slug for easier debugging
          };
        });

      return normalizedResults;
    } catch (error) {
      console.error("Error searching content:", error);
      return [];
    }
  };

  return {
    getHeader,
    getFooter,
    getScripts,
    searchContent,
  };
};

export default useHeaderAndFooterServices;
