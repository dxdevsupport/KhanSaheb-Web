import React from "react";
import styles from "./LeadershipIntro.module.scss";
import TeamCard from "@/component/TeamCard";
import { extractTextFromObject } from "@/libs/utils/helpers";

const LeadershipIntro = ({
  teamMembers,
  showTeamMembers,
  meetOurTeamTitle,
  teamOverview,
}) => {
  const displayTeamMembers = teamMembers || [];

  return (
    <> 
      {showTeamMembers && (
        <section
          className={`${styles.visionariesSection} pt_80 pb_80`}
        >
          <div className="container">
            <div
              className={`${styles.headerSection} ${styles.header_bottom_space}`}
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="300"
            >
              <div className={styles.headerLeft}>
                <h2 className="main_title ">{extractTextFromObject(meetOurTeamTitle)}</h2>
              </div>
              <div className={styles.headerRight}>
                <p>{extractTextFromObject(teamOverview)}</p>
              </div>
            </div>

            <div className={styles.teamGrid}>
              {displayTeamMembers.map((member, i) => (
                <div
                  key={member.id || member.ID || i}
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay={100 * (i + 1)}
                >
                  <TeamCard
                    name={
                      extractTextFromObject(
                        member.title?.rendered ||
                        member.post_title ||
                        member.acf?.team_name ||
                        ""
                      )
                    }
                    position={
                      extractTextFromObject(
                        member.acf?.ot_designation ||
                        member.acf?.team_position ||
                        ""
                      )
                    }
                    image={
                      member._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                      member.acf?.team_image?.url ||
                      member.acf?.team_image?.sizes?.large ||
                      member.acf?.team_image?.sizes?.medium ||
                      member.acf?.team_image ||
                      "/images/avatar.png"
                    }
                    bio={
                      extractTextFromObject(
                        member.content?.rendered ||
                        member.post_content ||
                        member.acf?.team_bio ||
                        ""
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.green_triangle}></div>
        </section>
      )}
    </>
  );
};

export default LeadershipIntro;