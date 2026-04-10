import React, { useState } from "react";
import style from "./reachOutTeam.module.scss";
import useContactUsServices from "@/libs/services/contactusServervices";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function ReachOutTeam({ data }) {
  const { submitContactForm } = useContactUsServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Get social media links from API data
  const getSocialLinks = () => {
    if (
      data?.acf?.som_social_links &&
      Array.isArray(data.acf.som_social_links) &&
      data.acf.som_social_links.length > 0
    ) {
      return data.acf.som_social_links.map((item) => ({
        url: item.link || "#",
        icon: item.icon?.url || item.icon || "",
        alt: item.icon?.alt || "Social Icon"
      }));
    }
    return [];
  };

  const socialLinks = getSocialLinks();

  // Helper to render multiple contact links split by break tags
  const renderContactLinks = (rawString, type) => {
    if (!rawString) return "";
    const text = extractTextFromObject(rawString);
    // Split by <br>, <br/>, <br /> or newline
    const parts = String(text).split(/<br\s*\/?>|\n/gi).map(s => s.trim()).filter(s => s);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {parts.map((part, index) => {
          // For phone, strip everything except numbers and + for the href
          const href = type === 'phone' 
            ? `tel:${part.replace(/[^0-9+]/g, '')}` 
            : `mailto:${part}`;
            
          return (
            <a key={index} href={href}>
              {part}
            </a>
          );
        })}
      </div>
    );
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});

    // Client-side validation (all fields are required)
    // Required fields: name, company, email, phone, message
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Please enter your name";
    }
    if (!formData.company.trim()) {
      errors.company = "Please enter your company name";
    }
    if (!formData.email.trim()) {
      errors.email = "Please enter your email";
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    if (!formData.phone.trim()) {
      errors.phone = "Please enter your phone number";
    }
    if (!formData.message.trim()) {
      errors.message = "Please enter your message";
    }

    // If there are client-side validation errors, display them and return
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // toast.error("Please fix the errors below");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get form ID from ACF field (cu_ad_contactform)
      // Relationship field returns array of IDs or Objects
      let formId = undefined;
      const contactFormField = data?.acf?.cu_ad_contactform;
      
      if (contactFormField) {
        const val = Array.isArray(contactFormField) ? contactFormField[0] : contactFormField;
        formId = (typeof val === 'object' && val?.ID) ? val.ID : val;
      } 

      // Submit form to Contact Form 7 API
      // If formId is undefined, the service will use the default constant
      const result = await submitContactForm(formData, formId);

      if (result.isSuccess) {
        toast.success(result.message || "Message sent successfully! We'll get back to you soon.");
        // Clear form on success
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          message: "",
        });
        setFieldErrors({});
      } else {
        // Show validation errors from server
        if (Object.keys(result.validationError).length > 0) {
          // Map CF7 field names to form field names
          const mappedErrors = {};
          const fieldNameMap = {
            'your-name': 'name',
            'your-email': 'email',
            'your-phone': 'phone',
            'your-company': 'company',
            'your-message': 'message',
          };
      <ToastContainer/>

          for (const [cf7Field, errorMsg] of Object.entries(result.validationError)) {
            const fieldName = fieldNameMap[cf7Field] || cf7Field;
            mappedErrors[fieldName] = errorMsg;
          }

          setFieldErrors(mappedErrors);
          // toast.error("Please fix the validation errors below");
        } else {
          toast.error(result.message || "Failed to send message. Please try again.");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`pb_80 pt_80 ${style.reach_ort_section}`}> 
      <div className="container">
        <div className={style.reach_ort_grid}>
          {/* Left Section - Contact Information */}
          <div className={style.contact_info}>
            <h2 className={`main_title ${style.reach_title}`}>{data?.acf?.cu_ad_title ? parse(extractTextFromObject(data.acf.cu_ad_title)) : ""}</h2>
            <p className={style.section_description}>
              {data?.acf?.cu_ad_short_description
                ? parse(extractTextFromObject(data.acf.cu_ad_short_description))
                : ""}
            </p>

            <div className={style.contact_details}>
              <h3 className={style.address_title}>{data?.acf?.address_title ? parse(extractTextFromObject(data.acf.address_title)) : "Address"}</h3>
              <div className={style.contact_item}>
                <img
                  src="/images/icons/location.svg"
                  alt="Location icon"
                  className={style.contact_icon}
                />
                <span className={style.contact_address}>{data?.acf?.cu_ad_address ? parse(extractTextFromObject(data.acf.cu_ad_address)) : ""}</span>
              </div>
              <div className={style.contact_item}>
                <img
                  src="/images/icons/call.svg"
                  alt="Phone icon"
                  className={style.contact_icon}
                />
                {renderContactLinks(data?.acf?.cu_ad_phone_number, 'phone')}
              </div>
              <div className={style.contact_item}>
                <img
                  src="/images/icons/mail.svg"
                  alt="Email icon"
                  className={style.contact_icon}
                />
                {renderContactLinks(data?.acf?.cu_ad_email, 'email')}
              </div>
            </div>
          </div>

          {/* Right Section - Contact Form */}
          <div className={style.contact_form}>
            <form className={style.form} onSubmit={handleSubmit} noValidate>
              <div className={style.form_group}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name*"
                  className={`${style.form_input} ${fieldErrors.name ? style.input_error : ""}`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.name && (
                  <span className={style.error_message}>{fieldErrors.name}</span>
                )}
              </div>
              <div className={style.form_group}>
                <input
                  type="text"
                  name="company"
                  placeholder="Company*"
                  className={`${style.form_input} ${fieldErrors.company ? style.input_error : ""}`}
                  value={formData.company}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.company && (
                  <span className={style.error_message}>{fieldErrors.company}</span>
                )}
              </div>
              <div className={style.form_group}>
                <input
                  type="text"
                  name="email"
                  placeholder="Email*"
                  className={`${style.form_input} ${fieldErrors.email ? style.input_error : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.email && (
                  <span className={style.error_message}>{fieldErrors.email}</span>
                )}
              </div>
              <div className={style.form_group}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone*"
                  className={`${style.form_input} ${fieldErrors.phone ? style.input_error : ""}`}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.phone && (
                  <span className={style.error_message}>{fieldErrors.phone}</span>
                )}
              </div>
              <div className={style.form_group}>
                <textarea
                  name="message"
                  placeholder="Your message...*"
                  className={`${style.form_textarea} ${fieldErrors.message ? style.input_error : ""}`}
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                ></textarea>
                {fieldErrors.message && (
                  <span className={style.error_message}>{fieldErrors.message}</span>
                )}
              </div>
              <div className={style.button_social_container}>
                <button
                  type="submit"
                  className="view_all_btn text_lift_up_second"
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </button>
                {/* Dynamic Social Media Links from WordPress API */}
                {socialLinks.length > 0 && (
                  <div className={style.social_media}>
                    {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={style.social_link}
                    aria-label={link.alt}
                  >
                    <img
                      src={link.icon}
                      alt={link.alt}
                      className={style.social_icon}
                    />
                  </a>
                ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReachOutTeam;
