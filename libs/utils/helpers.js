import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { axiosServer } from "@/libs/axios/axios";

// ========== WORDPRESS INTEGRATION ==========

// Client-side hook for React components
export const useAllOptions = () => {
	const [optionItems, setOptionItems] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/wp-json/custom/v1/alloptions`
				);
				if (!response.ok) {
					throw new Error(`Error fetching options: ${response.statusText}`);
				}

				const data = await response.json();
				setOptionItems(data);
			} catch (err) {
				console.error("Error fetching options:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchOptions();
	}, []);

	return { optionItems, error, loading };
};

// Server-side function for getStaticProps
export const getAllOptions = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/wp-json/custom/v1/alloptions`
		);
		if (!response.ok) {
			throw new Error(`Error fetching options: ${response.statusText}`);
		}

		const data = await response.json();
		return { optionItems: data, error: null };
	} catch (err) {
		console.error("Error fetching options:", err);
		return { optionItems: [], error: err.message };
	}
};

export const getMenuItems = async (menuId) => {
	if (!menuId) {
		throw new Error("Menu ID is required");
	}

	const baseUrl = process.env.NEXT_PUBLIC_API_URL;
	if (!baseUrl) {
		return [];
	}

	try {
		const response = await fetch(
			`${baseUrl}/wp-json/custom/v1/menuItems/${menuId}`
		);

		if (!response.ok) {
			return [];
		}

		const menuItemsList = await response.json();
		return Array.isArray(menuItemsList) ? menuItemsList : [];
	} catch (err) {
		return [];
	}
};

export function buildMenuStructure(menuItemsList, router) {
	const menuMap = {};
	const rootMenu = [];

	menuItemsList.forEach((item) => {
		const { title, cleanUrl, isMenuActive, target } = getCleanUrl(item, router);

		menuMap[item.ID] = {
			...item,
			subMenuItems: [],
			menuUrl: cleanUrl,
			isMenuActive,
		};
	});

	menuItemsList.forEach((item) => {
		if (item.menu_item_parent !== "0") {
			if (menuMap[item.menu_item_parent]) {
				menuMap[item.menu_item_parent].subMenuItems.push(menuMap[item.ID]);
			}
		} else {
			rootMenu.push(menuMap[item.ID]);
		}
	});

	return rootMenu;
}

// ========== CONTENT HANDLING ==========

// Minimal HTML handling compatible with React 19 without external parser
const decodeHtmlEntities = (str) => {
	let s = String(str ?? "");
	if (!s) return "";
	try {
		const named = {
			amp: "&",
			lt: "<",
			gt: ">",
			quot: '"',
			apos: "'",
			nbsp: "\u00A0",
			ndash: "–",
			mdash: "—",
			lsquo: "'",
			rsquo: "'",
			ldquo: '"',
			rdquo: '"',
			hellip: "…",
			copy: "©",
			reg: "®",
			trade: "™",
			euro: "€",
			pound: "£",
			yen: "¥",
			bull: "•",
		};
		// Iteratively decode to handle double-encoded entities like &amp;amp;
		for (let i = 0; i < 4; i++) {
			const prev = s;
			s = s
				.replace(/&#(\d+);/g, (_, code) => {
					try {
						return String.fromCharCode(parseInt(code, 10));
					} catch {
						return _;
					}
				})
				.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
					try {
						return String.fromCharCode(parseInt(hex, 16));
					} catch {
						return _;
					}
				})
				.replace(/&([a-zA-Z]+);/g, (m, name) =>
					name in named ? named[name] : m
				);
			if (s === prev) break;
		}
		return s;
	} catch (e) {
		try {
			console.warn("safeParse: decode failed", e);
		} catch {}
		return String(str ?? "");
	}
};

export const safeParse = (content) => {
	try {
		const s = decodeHtmlEntities(content);
		return s;
	} catch (e) {
		try {
			console.warn("safeParse: error", e);
		} catch {}
		return typeof content === "string" ? content : content || "";
	}
};

export const safeParseDeep = (value) => {
  if (typeof value === "string") {
    return safeParse(value);
  }
  if (Array.isArray(value)) return value.map((v) => safeParseDeep(v));
  if (value && typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = safeParseDeep(value[k]);
    }
    return out;
  }
  return value;
};

export const capitalizeFirstLetter = (string) => {
	if (!string) return "";
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const truncate = (str, length = 100) => {
	if (!str) return "";
	return str.length > length ? str.substring(0, length) + "..." : str;
};

/**
 * Limit text to a specific number of words
 * @param {string} text - The text to limit (HTML string)
 * @param {number} wordLimit - Maximum number of words (default: 75)
 * @returns {string} The limited text with "..." if truncated
 */
export const limitWords = (text, wordLimit = 75) => {
	if (!text) return "";

	// Ensure text is a string
	const textStr = String(text);

	// Strip HTML tags if present
	const strippedText = textStr.replace(/<[^>]*>/g, " ");

	// Split by whitespace and filter out empty strings
	const words = strippedText
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0);

	// If word count is within limit, return original text
	if (words.length <= wordLimit) {
		return textStr;
	}

	// Take first N words and add ellipsis
	return words.slice(0, wordLimit).join(" ") + "...";
};

export const slugify = (text) => {
	if (!text) return "";
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
};

// ========== NAVIGATION & ROUTING ==========

export const getCleanUrl = (item, router) => {
	const title = item.title || "";
	const target = item.target || "_self";
	let cleanUrl = "";

	if (item.type === "custom") {
		cleanUrl = item.url;
	} else {
		cleanUrl = item.url.replace(/^.*\/\/[^/]+/, "").replace(/^\/|\/$/g, "");

		if (cleanUrl === "ar/home") {
			cleanUrl = "ar";
		}

		cleanUrl = `/${cleanUrl}`;
	}

	const currentPath = router.asPath;
	const isMenuActive = currentPath === cleanUrl;

	return { title, cleanUrl, isMenuActive, target };
};

export const extractTextFromObject = (val) => {
	if (!val) return "";
	if (typeof val === "string") return val;
	if (typeof val === "object") {
		if (val.rendered) return extractTextFromObject(val.rendered);
		if (val.title) return extractTextFromObject(val.title);
		if (val.url) return val.url;
		const values = Object.values(val);
		for (const v of values) {
			if (typeof v === "string" && v.trim() !== "") return v;
		}
	}
	return String(val);
};

export const getCleanLink = (link) => {
    if (!link || link === "#." || link === "#" || link === "") {
        return "#.";
    }

    // If link is an object (e.g. ACF Link object), try to extract the URL
    if (typeof link === 'object') {
        if (link.url) return getCleanLink(link.url);
        return "#.";
    }

    try {
        const u = new URL(link);
        const p = `${u.pathname}${u.search}${u.hash}`;
        return p || "/";
    } catch {
        if (typeof link === 'string' && link.startsWith("//")) {
            const s = link.replace(/^.*\/\/[^/]+/, "");
            return s || "/";
        }
        return String(link);
    }
};

export const getQueryParams = (url) => {
	if (!url) return {};
	const params = new URLSearchParams(url.split("?")[1]);
	const result = {};
	for (const [key, value] of params.entries()) {
		result[key] = value;
	}
	return result;
};

export const buildQueryString = (params) => {
	if (!params || typeof params !== "object") return "";
	return Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== null)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
		)
		.join("&");
};

// ========== FORM HANDLING ==========

export const validateEmail = (email) => {
	if (!email?.trim()) return "Email is required.";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format.";
	return "";
};

export const validatePhone = (phone) => {
	if (!phone?.trim()) return "Phone number is required.";
	if (!/^\d{6,15}$/.test(phone)) return "Phone number must be 10-15 digits.";
	return "";
};

export const validatePassword = (password) => {
	if (!password?.trim()) return "Password is required.";
	if (password.length < 8) return "Password must be at least 8 characters.";
	if (!/[A-Z]/.test(password))
		return "Password must contain at least one uppercase letter.";
	if (!/[a-z]/.test(password))
		return "Password must contain at least one lowercase letter.";
	if (!/[0-9]/.test(password))
		return "Password must contain at least one number.";
	if (!/[!@#$%^&*]/.test(password))
		return "Password must contain at least one special character.";
	return "";
};

export const validateName = (name, type = "first") => {
	if (!name?.trim())
		return `${type === "first" ? "First" : "Last"} name is required.`;
	if (!/^[a-zA-Z ]+$/.test(name)) return "Only alphabets and spaces allowed.";
	return "";
};

export const validateRequired = (value, fieldName) => {
	if (!value?.trim()) return `${fieldName} is required.`;
	return "";
};

export const validateMinLength = (value, fieldName, minLength) => {
	if (!value?.trim()) return `${fieldName} is required.`;
	if (value.length < minLength)
		return `${fieldName} must be at least ${minLength} characters.`;
	return "";
};

export const validateMaxLength = (value, fieldName, maxLength) => {
	if (!value?.trim()) return `${fieldName} is required.`;
	if (value.length > maxLength)
		return `${fieldName} must not exceed ${maxLength} characters.`;
	return "";
};

export const validateNumeric = (value, fieldName) => {
	if (!value?.trim()) return `${fieldName} is required.`;
	if (!/^\d+$/.test(value)) return `${fieldName} must contain only numbers.`;
	return "";
};

export const validateAlphabetic = (value, fieldName) => {
	if (!value?.trim()) return `${fieldName} is required.`;
	if (!/^[a-zA-Z ]+$/.test(value))
		return `${fieldName} must contain only letters.`;
	return "";
};

export const validateAlphanumeric = (value, fieldName) => {
	if (!value?.trim()) return `${fieldName} is required.`;
	if (!/^[a-zA-Z0-9 ]+$/.test(value))
		return `${fieldName} must contain only letters and numbers.`;
	return "";
};

export const validateUrl = (url) => {
	if (!url?.trim()) return "URL is required.";
	try {
		new URL(url);
		return "";
	} catch {
		return "Invalid URL format.";
	}
};

export const validateDate = (date) => {
	if (!date?.trim()) return "Date is required.";
	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return "Invalid date format.";
	return "";
};

export const formatFormData = (data) => {
	if (!data || typeof data !== "object") return {};
	return Object.entries(data).reduce((acc, [key, value]) => {
		if (value !== undefined && value !== null) {
			acc[key] = typeof value === "string" ? value.trim() : value;
		}
		return acc;
	}, {});
};

// ========== DATA MANIPULATION ==========

export const chunkArray = (array, size) => {
	if (!Array.isArray(array)) return [];
	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
};

export const uniqueArray = (array) => {
	if (!Array.isArray(array)) return [];
	return [...new Set(array)];
};

export const deepClone = (obj) => {
	if (obj === null || typeof obj !== "object") return obj;
	if (obj instanceof Date) return new Date(obj);
	if (obj instanceof Array) return obj.map((item) => deepClone(item));
	if (obj instanceof Object) {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
		);
	}
	return obj;
};

export const removeEmptyValues = (obj) => {
	return Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => {
			if (value === null || value === undefined) return false;
			if (typeof value === "string" && value.trim() === "") return false;
			if (Array.isArray(value) && value.length === 0) return false;
			return true;
		})
	);
};

export const pick = (object, keys) => {
	if (!object || !Array.isArray(keys)) return {};
	return keys.reduce((acc, key) => {
		if (key in object) {
			acc[key] = object[key];
		}
		return acc;
	}, {});
};

export const omit = (object, keys) => {
	if (!object || !Array.isArray(keys)) return object;
	return Object.fromEntries(
		Object.entries(object).filter(([key]) => !keys.includes(key))
	);
};

// ========== FORMATTING & DISPLAY ==========

export const formatDate = (date, format = "DD/MM/YYYY") => {
	if (!date) return "";
	const d = new Date(date);
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();

	return format.replace("DD", day).replace("MM", month).replace("YYYY", year);
};

export const formatNumber = (number, options = {}) => {
	if (number === null || number === undefined) return "";
	const { style = "decimal", currency = "USD", ...rest } = options;
	return new Intl.NumberFormat("en-US", { style, currency, ...rest }).format(
		number
	);
};

export const formatPhoneNumber = (phoneNumber) => {
	if (!phoneNumber) return "";
	const cleaned = phoneNumber.replace(/\D/g, "");
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
	if (match) {
		return `(${match[1]}) ${match[2]}-${match[3]}`;
	}
	return phoneNumber;
};

export const getFileExtension = (filename) => {
	if (!filename) return "";
	return filename
		.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
		.toLowerCase();
};

export const isValidFileType = (file, allowedTypes) => {
	if (!file || !allowedTypes) return false;
	const extension = getFileExtension(file.name);
	return allowedTypes.includes(extension);
};

// ========== BROWSER & STORAGE ==========

export const isBrowser = () => typeof window !== "undefined";

export const getBrowserInfo = () => {
	if (!isBrowser()) return null;

	const ua = navigator.userAgent;
	return {
		isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
		isFirefox: /Firefox/.test(ua),
		isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
		isEdge: /Edge/.test(ua),
		isIE: /MSIE|Trident/.test(ua),
		isMobile:
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(ua),
	};
};

export const setLocalStorage = (key, value) => {
	if (!isBrowser()) return;
	try {
		const serializedValue = JSON.stringify(value);
		localStorage.setItem(key, serializedValue);
	} catch (error) {
		console.error("Error saving to localStorage:", error);
	}
};

export const getLocalStorage = (key, defaultValue = null) => {
	if (!isBrowser()) return defaultValue;
	try {
		const serializedValue = localStorage.getItem(key);
		return serializedValue ? JSON.parse(serializedValue) : defaultValue;
	} catch (error) {
		console.error("Error reading from localStorage:", error);
		return defaultValue;
	}
};

export const removeLocalStorage = (key) => {
	if (!isBrowser()) return;
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.error("Error removing from localStorage:", error);
	}
};

export const clearLocalStorage = () => {
	if (!isBrowser()) return;
	try {
		localStorage.clear();
	} catch (error) {
		console.error("Error clearing localStorage:", error);
	}
};

// ========== PERFORMANCE & ERROR HANDLING ==========

export const debounce = (func, wait) => {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

export const throttle = (func, limit) => {
	let inThrottle;
	return function executedFunction(...args) {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
};

export const handleError = (error, context = "") => {
	console.error(`Error${context ? ` in ${context}` : ""}:`, error);
	// Add any additional error handling logic here
};

export const handleApiError = (error) => {
	const errorInfo = {
		message: "An error occurred",
		status: null,
		data: null,
	};

	if (error.response) {
		errorInfo.status = error.response.status;
		errorInfo.data = error.response.data;
		errorInfo.message = error.response.data?.message || error.message;
	} else if (error.request) {
		errorInfo.message = "No response received from server";
	} else {
		errorInfo.message = error.message;
	}

	console.error("API Error:", errorInfo);
	return errorInfo;
};

export const errorHandler = (error) => {
	if (!error) return { result: "failure", records: [] };

	// Handle axios error
	if (error.response) {
		return {
			...error.response.data,
			status: error.response.status,
			result: "failure",
		};
	}

	// Handle network error
	if (error.request) {
		return {
			result: "failure",
			message: "Network error - no response received",
			records: [],
		};
	}

	// Handle other errors
	return {
		result: "failure",
		message: error.message || "An unexpected error occurred",
		records: [],
	};
};

export const getProjectImage = (project) => {
  if (!project?.acf) return "/images/ourProjects/project-1.png";
  
  const img = project.acf.im_in_hm_image || project.acf.image;
  
  if (!img) return "/images/ourProjects/project-1.png";

  // Handle numeric ID (WP Media ID)
  if (typeof img === 'number' || (typeof img === 'string' && /^\d+$/.test(img))) {
    return img;
  }

  // Handle WP Media Object with ID (for OptimizedImage fetching)
  if (typeof img === 'object' && img.ID && !img.url) {
    return img.ID;
  }
  
  // Handle string URL
  if (typeof img === 'string') return img;
  
  // Handle WP Media Object
  if (img.url) return img.url;
  
  // Handle sizes if available
  if (img.sizes?.large) return img.sizes.large;
  if (img.sizes?.medium) return img.sizes.medium;
  if (img.sizes?.thumbnail) return img.sizes.thumbnail;
  
  return "/images/ourProjects/project-1.png";
};

export const getProjectTags = (project, sectorMap = {}, categoryMap = {}) => {
    if (!project) return ["Project"];
    
    let tags = [];
    
    // 1. Sector Taxonomy
    // if (project.sector && Array.isArray(project.sector)) {
    //     tags.push(...project.sector.map(id => sectorMap[id]).filter(Boolean));
    // }
    
    // 2. Project Category Taxonomy
    const mapToUse = Object.keys(categoryMap).length > 0 ? categoryMap : sectorMap;
    const categories = project['project-category'] || project['project_category'];
    if (categories && Array.isArray(categories)) {
        tags.push(...categories.map(item => {
            if (typeof item === 'object' && item !== null) {
                return item.name || mapToUse[item.id] || mapToUse[item.term_id];
            }
            return mapToUse[item];
        }).filter(Boolean));
    }
    
    // 3. ACF Project Details
    // if (project.acf?.project_details && Array.isArray(project.acf.project_details)) {
    //     const targetLabels = ["services provided", "sectors", "sector", "project tag", "project tags"];
        
    //     project.acf.project_details.forEach(detail => {
    //          if (detail.detail_label && targetLabels.includes(detail.detail_label.toLowerCase())) {
    //              if (detail.detail_value) {
    //                  tags.push(...detail.detail_value.split(",").map(s => s.trim()));
    //              }
    //          }
    //     });
    // }

    // 4. Deduplicate and filter empty
    tags = [...new Set(tags)].filter(Boolean);
    
    return tags.length > 0 ? tags : ["Project"];
};

// ========== API HANDLING ==========

/**
 * Generic function to handle API requests with error handling
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Optional axios request options
 * @returns {Promise<any>} The API response data or error
 */
export const handleApiRequest = async (url, options = {}) => {
	try {
        const response = await axiosServer.get(url); 
        return response.data;
    } catch (error) {
        return errorHandler(error);
    }
};



/**
 * Handle localized API requests based on locale
 * @param {Object} urls - Object containing AR and EN URLs
 * @param {string} locale - The current locale
 * @returns {Promise<any>} The API response data or error
 */
export const handleLocalizedApiRequest = async (urls, locale) => {
	if (!urls?.ar && !urls?.en) {
		throw new Error("Both AR or EN URLs are required");
	}
	const url = locale === "ar" ? urls.ar : urls.en;
	return handleApiRequest(url);
};

function normalizeRankMathHead(resp) {
  const r = resp || {};
  const sanitize = (v) => {
    const s = typeof v === "string" ? v : String(v || "");
    return safeParse(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  };
  let title = sanitize(r?.title || "");
  let description = sanitize(r?.description || "");
  let robots = sanitize(Array.isArray(r?.robots) ? r.robots.join(", ") : r?.robots || "");
  let canonical = sanitize(r?.canonical || "");
  let og = {
    title: sanitize(r?.og?.title || r?.openGraph?.title || title || ""),
    description: sanitize(r?.og?.description || r?.openGraph?.description || description || ""),
    type: sanitize(r?.og?.type || r?.openGraph?.type || ""),
    image: String(r?.og?.image || r?.openGraph?.image || r?.og_image || ""),
  };
  let twitter = {
    card: sanitize(r?.twitter?.card || ""),
    title: sanitize(r?.twitter?.title || title || ""),
    description: sanitize(r?.twitter?.description || description || ""),
    image: String(r?.twitter?.image || ""),
  };

  if (typeof r?.head === "string") {
    const h = r.head;
    const t = h.match(/<title>([^<]*)<\/title>/i);
    const d = h.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const rb = h.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    const c = h.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const ogt = h.match(/(?:property|name)=["']og:title["'][^>]*content=["']([^"']*)["']/i);
    const ogd = h.match(/(?:property|name)=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const ogi = h.match(/(?:property|name)=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    const ogty = h.match(/(?:property|name)=["']og:type["'][^>]*content=["']([^"']*)["']/i);
    const ogu = h.match(/(?:property|name)=["']og:url["'][^>]*content=["']([^"']*)["']/i);
    const twc = h.match(/name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
    const twt = h.match(/name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i);
    const twd = h.match(/name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i);
    const twi = h.match(/name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i);
    title = sanitize(title || (t ? t[1] : ""));
    description = sanitize(description || (d ? d[1] : "") || (ogd ? ogd[1] : ""));
    robots = sanitize(robots || (rb ? rb[1] : "") || "index, follow");
    canonical = sanitize(canonical || (c ? c[1] : "") || (ogu ? ogu[1] : ""));
    og = {
      title: sanitize(og.title || (ogt ? ogt[1] : "") || title),
      description: sanitize(og.description || (ogd ? ogd[1] : "") || description),
      type: sanitize(og.type || (ogty ? ogty[1] : "")),
      image: String(og.image || (ogi ? ogi[1] : "") || twitter.image),
    };
    twitter = {
      card: sanitize(twitter.card || (twc ? twc[1] : "")),
      title: sanitize(twitter.title || (twt ? twt[1] : title)),
      description: sanitize(twitter.description || (twd ? twd[1] : description)),
      image: String(twitter.image || (twi ? twi[1] : "") || og.image),
    };
  }
 
  return { title, description, robots, canonical, og, twitter };
}

function fallbackSeoFromPage(p) {
  const acf = p?.acf || {};
  const pageOverview = acf?.page_overview || {};
  const featured = p?._embedded?.["wp:featuredmedia"]?.[0];
  const image =
    featured?.source_url || featured?.media_details?.sizes?.full?.source_url || "";
  const title = (p?.title?.rendered || p?.title || "").trim();
  const description = limitWords(
    pageOverview?.overview_description || p?.excerpt?.rendered || "",
    30
  );
  const canonical = p?.link || "";
  const robots = "index, follow";
  const ogType = p?.slug === "home" ? "website" : "article";

  return {
    title,
    description,
    robots,
    canonical,
    og: { title, description, type: ogType, image },
    twitter: { card: "summary_large_image", title, description, image },
  };
}

/**
 * Fetch WordPress page by slug
 * @param {string} slug - The page slug
 * @param {string} locale - The locale (default: "en")
 * @returns {Promise<any>} The API response data or error
 */
export const getPageBySlug = async (slug, locale = "en") => {
    if (!slug) {
        throw new Error("Page slug is required");
    }
    const base = await handleApiRequest(`wp-json/wp/v2/pages?slug=${slug}&acf_format=standard&_embed&lang=${locale}`);
    const arr = Array.isArray(base) ? base : [];
    if (!arr.length) return [];
    const first = arr[0];
    const id = first?.id;
    if (!id) return [];
    const single = await handleApiRequest(`wp-json/wp/v2/pages/${id}?acf_format=standard&_embed&lang=${locale}`);
    const item = Array.isArray(single) ? single[0] : single;
    if (!item) return [];
    let seo = null;
    try {
      const linkLang = (() => {
        const l = String(locale || "en").toLowerCase();
        const baseLink = item?.link || first?.link || ""; 
        try {
          const u = new URL(baseLink);
          const path = (u.pathname || "/").replace(/\/+$/g, "");
          const isRoot = !path || path === "/";
          if (isRoot) {
            if (!u.pathname.toLowerCase().includes("/home")) {
              u.pathname = "/home";
            }
          }
          if (l !== "en") {
            u.searchParams.set("lang", l);
          }
 
          return u.toString();
        } catch {
          let out = baseLink || "";
          const looksLikeBase = /^https?:\/\/[^/]+\/?$/i.test(out);
          if (looksLikeBase || out.endsWith("/")) {
            if (!/\/home\/?$/i.test(out)) out = out.replace(/\/?$/, "/home");
          }
          if (l !== "en") {
            out += (out.includes("?") ? "&" : "?") + `lang=${l}`;
          }
          return out;
        }
      })(); 
      const seoUrl = `wp-json/rankmath/v1/getHead?url=${encodeURIComponent(linkLang)}&lang=${locale}`;
      const resp = await axiosServer
        .get(seoUrl, { timeout: 15000, headers: { "Content-Type": "application/json" } })
        .then((r) => r.data)
        .catch(() => null);
      seo = resp ? normalizeRankMathHead(resp) : null;
    } catch {
      seo = null;
    }
    // Do not fallback; only use Rank Math SEO when available
    const enriched = { ...item, seo };
    return [safeParseDeep(enriched)];
};
