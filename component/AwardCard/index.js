import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './AwardCard.module.scss';

const AwardCard = ({
  image,
  imageAlt,
  title,
  date,
  galleryImages = [],
  galleryImageAlts = [],
  description = "",
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const descriptionRef = useRef(null);
  const popupOverlayRef = useRef(null);
  const popupContentRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const openPopup = () => {
    setIsPopupOpen(true);
    setCurrentImageIndex(0);
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    // Restore body scroll when popup is closed
    document.body.style.overflow = 'unset';
  };

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isPopupOpen) {
        closePopup();
      }
    };

    if (isPopupOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);

  // Check if content overflows and handle scrollbar visibility on scroll
  useEffect(() => {
    if (!isPopupOpen || !descriptionRef.current) return;

    const element = descriptionRef.current;

    const checkOverflow = () => {
      if (element) {
        const hasOverflowContent = element.scrollHeight > element.clientHeight;
        setHasOverflow(hasOverflowContent);
      }
    };

    const handleScroll = () => {
      if (!hasOverflow) return;
      
      // Show scrollbar when scrolling
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Hide scrollbar after scrolling stops (1 second delay)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    // Check overflow after a short delay to ensure content is rendered
    const timeoutId = setTimeout(checkOverflow, 100);
    
    // Add scroll event listener
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also check on window resize
    window.addEventListener('resize', checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [isPopupOpen, description, hasOverflow]);

  // Handle scroll prevention for description area and popup containers
  useEffect(() => {
    if (!isPopupOpen) return;

    const handleWheel = (e) => {
      // Find the description element that contains the target
      const descriptionElement = descriptionRef.current;
      
      if (!descriptionElement) return;
      
      // Check if target is within description element
      if (!descriptionElement.contains(e.target)) {
        // If not in description, check if it's in popup overlay or content
        const overlayElement = popupOverlayRef.current;
        const contentElement = popupContentRef.current;
        
        // If target is in overlay or content (but not description), prevent scroll
        if (
          (overlayElement && overlayElement.contains(e.target)) ||
          (contentElement && contentElement.contains(e.target))
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      // Check if content is scrollable
      const isScrollable =
        descriptionElement.scrollHeight > descriptionElement.clientHeight;
      
      if (!isScrollable) return; // Allow page scroll if content isn't scrollable

      // Get scroll boundaries
      const { scrollTop, scrollHeight, clientHeight } = descriptionElement;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // -1 for rounding

      // Determine scroll direction
      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // If scrolling down and at bottom, allow page scroll
      // If scrolling up and at top, allow page scroll
      // Otherwise, prevent page scroll and scroll the content
      if (
        (scrollingDown && isAtBottom) ||
        (scrollingUp && isAtTop)
      ) {
        // Allow page to scroll
        return;
      }

      // Prevent page scroll and scroll the content instead
      e.preventDefault();
      e.stopPropagation();

      // Scroll the content element
      descriptionElement.scrollTop += e.deltaY;
    };

    // Use wheel event on the document to catch all scroll events
    // and check if they're within a content element
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [isPopupOpen]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <div className={styles.awardCard} onClick={openPopup}>
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={imageAlt || title}
            width={400}
            height={300}
            className={styles.awardImage}
          />
          <div className={styles.greenAccent}></div>
        </div>
        <div className={styles.textOverlay}>
          <h3 className={styles.awardTitle} dangerouslySetInnerHTML={{ __html: title }}></h3>
        </div>
      </div>

      {isPopupOpen && createPortal(
        <div className={styles.popupOverlay} ref={popupOverlayRef} onClick={closePopup}>
          <div className={styles.popupContent} ref={popupContentRef} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closePopup} aria-label="Close popup">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
          <div className={styles.mainImageContainer}>
            <Image
              src={galleryImages[currentImageIndex] || image}
              alt={
                galleryImageAlts[currentImageIndex] ||
                imageAlt ||
                title
              }
              width={800}
              height={600}
                className={styles.mainImage}
              />
              <div className={styles.imageTextOverlay}>
                <h2 className={styles.popupTitle} dangerouslySetInnerHTML={{ __html: title }}></h2>
              </div>
            </div>

            {/* Display actual award content from WordPress API */}
            {description && (
              <div 
                className={`${styles.award_content} ${hasOverflow && isScrolling ? styles.is_scrolling : ''}`} 
                ref={descriptionRef}
              >
                <div className={styles.award_description}>
                  {typeof description === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    description
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AwardCard;
