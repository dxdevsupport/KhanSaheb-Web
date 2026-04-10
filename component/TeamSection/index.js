import React from 'react';
import Image from 'next/image';
import styles from './TeamSection.module.scss';
import { extractTextFromObject } from '@/libs/utils/helpers';

const TeamSection = ({ 
  title = "Visionaries Guiding Our Path",
  description = "Meet the team steering Khansaheb Civil Engineering forward with expertise, purpose, and strategic foresight.",
  teamMembers = [
    {
      id: 1,
      name: "AMER KHANSAHEB",
      position: "Vice Chairman",
      image: "/images/amer_khansaheb.jpg"
    },
    {
      id: 2,
      name: "STEPHEN FLINT",
      position: "Managing Director",
      image: "/images/stephen_flint.jpg"
    },
    {
      id: 3,
      name: "EIRIAN MORRIS",
      position: "Commercial Director",
      image: "/images/eirian_morris.jpg"
    }
  ]
}) => {
  // Don't render if no content provided
  if (!title || !teamMembers || teamMembers.length === 0) {
    return null;
  }

  return (
    <section className={styles.teamSection}>
      <div className="container">
        <div className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <h2 className='main_title'>{extractTextFromObject(title)}</h2>
          </div>
          <div className={styles.headerRight}>
            <p>{extractTextFromObject(description)}</p>
          </div>
        </div>

        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div key={member.id} className={styles.teamCard}>
              <div className={styles.cardImage}>
                <Image
                  src={member.image}
                  alt={extractTextFromObject(member.imageAlt) || extractTextFromObject(member.name)}
                  width={300}
                  height={400}
                  className={styles.memberImage}
                />
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.memberInfo}>
                  <p className={styles.memberPosition}>{extractTextFromObject(member.position)}</p>
                  <h3 className={styles.memberName}>{extractTextFromObject(member.name)}</h3>
                </div>
                <div className={styles.arrowIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
