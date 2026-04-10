import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './TeamCard.module.scss';

const TeamCard = ({ 
  name,
  position,
  image,
  imageAlt,
  bio,
  experience,
  education,
  achievements
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePopup();
    }
  };


  // Prevent body scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      // Store current scroll position
      const scrollY = window.scrollY;
      scrollPositionRef.current = scrollY;
      
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    } else {
      // Restore body and html styles first
      
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      // Restore scroll position using the ref
      const scrollPosition = scrollPositionRef.current;
      if (scrollPosition > 0) {
        // Immediate scroll
        window.scrollTo(0, scrollPosition);
        
        // Backup scroll with requestAnimationFrame
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition);
        });
        
        // Final backup scroll with setTimeout
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 100);
      }
    }

    // Cleanup on unmount
    return () => {
   
      
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
    };
  }, [showPopup]);

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPopup) {
        handleClosePopup();
      }
    };

    if (showPopup) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showPopup]);

  return (
    <>
      <div className={styles.teamCard} onClick={handleArrowClick}>
        <div className={styles.cardImage}>
          {image && (
          <Image
            src={image}
            alt={imageAlt || name}
            width={300}
            height={400}
            className={styles.memberImage}
          />
          )}
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.memberInfo}>
            <p>{position}</p>
            <h3 className={styles.memberName}>{name}</h3>
          </div>
          <div className={styles.arrowIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#E40032" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Popup Modal - Rendered as portal to document body */}
      {showPopup && mounted && createPortal(
        <div 
          className={styles.popupOverlay} 
          onClick={handleBackdropClick}
        >
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={handleClosePopup}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className={styles.popupHeader}>
              <div className={styles.popupHeaderLeft}>
              <div className={styles.popupImage}>
                {image && (
                  <Image
                    src={image}
                    alt={imageAlt || name}
                    width={200}
                    height={250}
                    className={styles.popupMemberImage}
                  />
                  )}
                </div>
              <div className={styles.popupInfo}>
                <h2 className={styles.popupName}>{name}</h2>
                <h3 className={styles.popupPosition}>{position}</h3>
              </div>
              </div>
              
               <div className={styles.popupBody}>
                 {bio && (
                   <div className={styles.popupSection}>
                     <p 
                       className={styles.bioContent}
                       dangerouslySetInnerHTML={{ __html: bio }}
                     />
                   </div>
                 )}
                 
               </div>
            </div>
            
            <div className={styles.decorativeTriangle}></div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TeamCard;
