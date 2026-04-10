/**
 * Text Utilities
 * 
 * Reusable utility functions for text manipulation and formatting
 */

/**
 * Converts plain text line breaks to HTML
 * 
 * This function handles plain text content from WordPress API that contains
 * line break characters (\r\n or \n) and converts them to proper HTML markup.
 * 
 * - Double line breaks (\r\n\r\n or \n\n) are converted to paragraph breaks (</p><p>)
 * - Single line breaks (\r\n or \n) are converted to <br> tags
 * 
 * @param {string} text - The plain text string containing line breaks
 * @returns {string} HTML string with line breaks converted to HTML tags
 * 
 * @example
 * const text = "First paragraph.\r\n\r\nSecond paragraph.";
 * const html = convertLineBreaksToHtml(text);
 * // Returns: "First paragraph.</p><p>Second paragraph."
 * 
 * @example
 * const text = "Line 1\r\nLine 2";
 * const html = convertLineBreaksToHtml(text);
 * // Returns: "Line 1<br>Line 2"
 */
export const convertLineBreaksToHtml = (text) => {
  if (!text) return "";
  
  // Replace double line breaks (\r\n\r\n or \n\n) with paragraph breaks
  // Replace single line breaks (\r\n or \n) with <br> tags
  return text
    .replace(/\r\n\r\n/g, '<br><br>')  // Double line breaks -> paragraph breaks
    .replace(/\n\n/g, '<br><br>')       // Double \n -> paragraph breaks
    .replace(/\r\n/g, '<br>')          // Single \r\n -> <br>
    .replace(/\n/g, '<br>');           // Single \n -> <br>
};

/**
 * Strips HTML tags from a string
 * 
 * @param {string} html - The HTML string to strip tags from
 * @returns {string} Plain text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Truncates text to a specified length and adds ellipsis
 * 
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length of the text
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text with suffix
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

