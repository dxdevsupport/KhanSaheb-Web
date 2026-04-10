import constants from "@/common/constants";
import useAxiosPublic from "@/libs/hooks/useAxiosPublic";

/**
 * Default Contact Form 7 configuration
 * This configuration is used for rendering the contact form dynamically
 *
 * To update this configuration:
 * 1. Log into WordPress admin
 * 2. Go to Contact > Contact Forms
 * 3. Edit the form and note the field names and requirements
 * 4. Update this object accordingly
 */
const DEFAULT_FORM_CONFIG = {
  formId: constants.CONTACT_FORM_ID,
  fields: [
    {
      name: 'name',
      cf7Name: 'your-name',
      type: 'text',
      placeholder: 'Name',
      required: true,
      validation: {
        required: 'Please enter your name',
      },
    },
    {
      name: 'company',
      cf7Name: 'your-company',
      type: 'text',
      placeholder: 'Company',
      required: false,
    },
    {
      name: 'email',
      cf7Name: 'your-email',
      type: 'email',
      placeholder: 'Email',
      required: true,
      validation: {
        required: 'Please enter your email',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Please enter a valid email address',
        },
      },
    },
    {
      name: 'phone',
      cf7Name: 'your-phone',
      type: 'tel',
      placeholder: 'Phone',
      required: false,
    },
    {
      name: 'message',
      cf7Name: 'your-message',
      type: 'textarea',
      placeholder: 'Your message',
      required: true,
      rows: 4,
      validation: {
        required: 'Please enter your message',
      },
    },
  ],
};

const useContactUsServices = () => {
  const axios = useAxiosPublic();

  const getContactUs = async () => {
    try {
      const response = await axios.get(`/pages?slug=${constants.CONTACT_US}&acf_format=standard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching contact us:", error);
      return null;
    }
  }

  /**
   * Get Contact Form 7 configuration
   *
   * Returns the default form configuration without making any API calls.
   * This avoids unnecessary network requests and console errors.
   *
   * Note: Contact Form 7 REST API endpoints for getting form configuration require authentication.
   * Since we don't need dynamic configuration, we use the hardcoded DEFAULT_FORM_CONFIG instead.
   *
   * If you need to update the form configuration in the future:
   * 1. Update the DEFAULT_FORM_CONFIG object above
   * 2. The changes will be reflected immediately without any API calls
   *
   * @returns {Promise<Object>} Form configuration object with formId and fields array
   */
  const getContactFormConfig = async () => {
    // Return default configuration immediately without making API calls
    // This prevents 404 errors in the console and improves performance
    return Promise.resolve(DEFAULT_FORM_CONFIG);
  };

  /**
   * Submit contact form to Contact Form 7 API
   * @param {Object} formData - Form data object with name, company, email, phone, message
   * @param {string} formId - Contact Form 7 form ID (default: from constants.CONTACT_FORM_ID)
   * @returns {Promise<Object>} Response object with isSuccess, message, and validationError
   */
  const submitContactForm = async (formData, formId = constants.CONTACT_FORM_ID) => {
    try {
      // Create FormData object (CF7 expects multipart/form-data)
      const data = new FormData();

      // Add form fields
      data.append('your-name', formData.name || '');
      data.append('your-company', formData.company || '');
      data.append('your-email', formData.email || '');
      data.append('your-phone', formData.phone || '');
      data.append('your-message', formData.message || '');

      // Add required CF7 hidden fields
      // _wpcf7_unit_tag is a unique identifier for the form instance
      // Format: wpcf7-f{formId}-p{postId}-o{instance}
      // For API submissions, we use a simplified format
      data.append('_wpcf7', formId);
      data.append('_wpcf7_version', '5.9.8'); // CF7 version
      data.append('_wpcf7_locale', 'en_US');
      data.append('_wpcf7_unit_tag', `wpcf7-f${formId}-o1`);
      data.append('_wpcf7_container_post', '0');
      data.append('_wpcf7_posted_data_hash', '');

      // Submit to Contact Form 7 API
      const response = await fetch(
        `https://api01-khansaheb.e8demo.com/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
        {
          method: 'POST',
          body: data,
        }
      );

      const result = await response.json();

      // Normalize CF7 response to a consistent format
      const isSuccess = result.status === 'mail_sent';
      const message = result.message || '';
      const validationError = isSuccess
        ? {}
        : result.invalid_fields
        ? Object.fromEntries(
            result.invalid_fields.map((error) => {
              // Extract field name from the "into" property
              const key = /wpcf7-form-control-wrap\s+(.*)/.exec(error.into)?.[1] || error.into;
              return [key, error.message];
            })
          )
        : {};

      return {
        isSuccess,
        message,
        validationError,
        rawResponse: result, // Include raw response for debugging
      };
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return {
        isSuccess: false,
        message: "An error occurred while submitting the form. Please try again.",
        validationError: {},
      };
    }
  };

  return {
    getContactUs,
    getContactFormConfig,
    submitContactForm,
  };
};

export default useContactUsServices;
