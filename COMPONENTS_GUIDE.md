# Khansaheb Website Component Guide

This guide explains how to use the ACF Flexible Content components for the Khansaheb website. Each component corresponds to a "Layout" in the "Components" field group.

## How to Use
1. Edit a Page in WordPress.
2. Locate the **Components** field (Flexible Content).
3. Click **Add Component** (or "Add Row").
4. Select the desired layout from the popup list.
5. Fill in the fields for that layout.
6. You can drag and drop components to reorder them.

## Available Components

Here is a complete list of the 42 available layouts. Click on any layout to see its details.

1. [Home Banner](#1-home-banner)
2. [Mission & Vision](#2-mission--vision)
3. [Testimonials](#3-testimonials)
4. [Awards List](#4-awards-list)
5. [Award Showcase](#5-award-showcase)
6. [Building Showcase](#6-building-showcase)
7. [Digital Construction](#7-digital-construction)
8. [Capabilities](#8-capabilities)
9. [Location Map](#9-location-map)
10. [Project Banner](#10-project-banner)
11. [Quote Section](#11-quote-section)
12. [Video Section](#12-video-section)
13. [Legacy Section](#13-legacy-section)
14. [Reach Out Team](#14-reach-out-team)
15. [Services List](#15-services-list)
16. [What's New](#16-whats-new)
17. [Timeline Slider](#17-timeline-slider)
18. [Success Stories](#18-success-stories)
19. [Safety System](#19-safety-system)
20. [Quality Safety](#20-quality-safety)
21. [Resource List](#21-resource-list)
22. [Quality Improve](#22-quality-improve)
23. [FAQ](#23-faq)
24. [Team Section](#24-team-section)
25. [Award Winning](#25-award-winning)
26. [Build Your Career](#26-build-your-career)
27. [Business Units](#27-business-units)
28. [Career Section](#28-career-section)
29. [Enquire Box](#29-enquire-box)
30. [Foundation](#30-foundation)
31. [Future Delivery](#31-future-delivery)
32. [Group Value](#32-group-value)
33. [Join Us](#33-join-us)
34. [Joinery Factory](#34-joinery-factory)
35. [Inner Banner](#35-inner-banner)
36. [Leadership Intro](#36-leadership-intro)
37. [Other Projects](#37-other-projects)
38. [Our Sectors](#38-our-sectors)
39. [Progress Section](#39-progress-section)
40. [Projects Showcase](#40-projects-showcase)
41. [Digital Workflows](#41-digital-workflows)
42. [Generic Content](#42-generic-content)

### 1. Home Banner
Used for the main hero section on the homepage.
- **Video**: Upload an MP4 video file.
- **Background Image**: Fallback image if video fails or for mobile.
- **Banner Text**: The main heading text (supports HTML like `<br>`).

### 2. Mission & Vision
Displays the Mission and Vision cards side-by-side.
- **Items** (Repeater): Add 2 rows (one for Mission, one for Vision).
  - **Image**: Icon/Image for the card.
  - **Title**: "Our Mission" or "Our Vision".
  - **Description**: The text content.

### 3. Testimonials
A slider of client testimonials.
- **Title**: Section heading (e.g., "What Our Clients Say").
- **Testimonials** (Repeater):
  - **Quote**: The testimonial text.
  - **Author Image**: Photo of the person.
  - **Author Name**: Name of the person.
  - **Author Title**: Job title.

### 4. Awards List
A complex layout with a featured award on the left and a list on the right.
- **Title**: Section heading.
- **Description**: Intro text.
- **Awards** (Repeater):
  - **Title**: Award name.
  - **Year**: Year of award.
  - **Caption**: Short caption for the featured view.
  - **Caption Text**: Description for the featured view.
  - **Image**: Image for the featured view.

### 5. Award Showcase
A simpler single-award highlight section.
- **Title**: Heading.
- **Description**: Text content.
- **Image**: Featured image.

### 6. Building Showcase
Shows two images (large left, small right) with text in the middle.
- **Title**: Main heading.
- **Description**: Text content.
- **Left Image**: The larger image on the left.
- **Right Image**: The smaller image on the right/bottom.
- **Button**: Link to a page.

### 7. Digital Construction
Section with a background image and text overlay.
- **Main Image**: Desktop background.
- **Mobile Image**: Mobile background.
- **Main Caption**: Big heading.
- **Sub Caption**: Small tag/label above heading.
- **Description**: Text content.
- **Button**: Link to a page.

### 8. Capabilities
Displays a slider of Services.
- **Services** (Relationship): Select "Service" posts to display. The component will pull the title, image, and link from the selected Service posts automatically.

### 9. Location Map
Displays the contact map and info.
- **Latitude/Longitude**: Coordinates for the map pin.
- **Location Name**: Name to show on map.
- **Address**: Text address.
- **Phone/Email**: Contact details.
- **Company Logo**: Image to show on the map card.

### 10. Project Banner
Banner for project detail pages.
- **Main Image**: Desktop banner.
- **Mobile Image**: Mobile banner.
- **Title**: Project name.
- **Short Description**: Intro text.
- **Button**: Optional call to action.

### 11. Quote Section
A full-width section with a large quote and author info.
- **Quote**: The main quote text.
- **Paragraphs**: Additional text below the quote.
- **Author Info**: Name, Title, Image.

### 12. Video Section
Displays a video player with a thumbnail.
- **Video URL/File**: Link to the video file.
- **Thumbnail**: Image to show before play.

### 13. Legacy Section
Text and image layout about history/legacy.
- **Text**: Main content.
- **Image**: Accompanying image.

### 14. Reach Out Team
Contact section with social links.
- **Title/Description**: Heading info.
- **Address/Phone/Email**: Contact info.
- **Social Links** (Repeater): Add icons and links to social media.

### 15. Services List
A grid or list of services.
- **Title**: Section heading.
- **Services** (Repeater): Manually add services if not using the "Capabilities" relationship.
  - **Image**, **Title**, **Link**.

### 16. What's New
Displays latest news posts.
- **Latest News** (Relationship): Select "News" posts to display.
- **Button**: "View All" link.

### 17. Timeline Slider
Horizontal timeline of company history.
- **Timeline Items** (Repeater):
  - **Year**: e.g., "1935".
  - **Title**: Event title.
  - **Description**: Details.
  - **Image**: Photo from that era.

### 18. Success Stories
- **Title**: Heading.
- **Stories** (Repeater): Title, Description, Image.

### 19. Safety System
- **Title**: Heading.
- **Description**: Text.
- **Image**: Desktop and Mobile versions.

### 20. Quality Safety
- **Title/Sub Title**: Headings.
- **Tools** (Repeater): List of tools/points.

### 21. Resource List
Downloadable resources list.
- **Resources** (Repeater): Title and File upload.

### 22. Quality Improve
- **Title**: Heading.
- **Content/Description**: Text.
- **Objectives** (Repeater): List of objectives.
- **Image/Video**: Media to display.

### 23. FAQ
Frequently Asked Questions accordion.
- **Title**: Heading.
- **FAQ Items** (Repeater): Question and Answer pairs.

### 24. Team Section
Grid of team members.
- **Title/Description**: Intro.
- **Team Members** (Repeater): Name, Position, Image.

### 25. Award Winning
- **Title**: Section heading.
- **Description**: Rich text content.
- **Image**: Featured image.

### 26. Build Your Career
- **Title**: Heading.
- **Career Details** (Repeater):
  - **Title**: Detail title.
  - **Description**: Text description.
  - **Icon**: Icon image.

### 27. Business Units
- **Background Image**: Desktop background.
- **Mobile Background**: Mobile background.
- **Bottom Text**: Text at the bottom.
- **Features** (Repeater): Title and Description.

### 28. Career Section
- **Image**: Featured image.
- **Sub Caption**: Small text above main caption.
- **Main Caption**: Large heading.
- **Description**: Text content.
- **Button**: Link to a page.

### 29. Enquire Box
- **Title**: Heading.
- **Description**: Text content.
- **Image**: Featured image.
- **Button**: Call to action link.

### 30. Foundation
- **Short Description**: Intro text.
- **Timeline Sections** (Repeater):
  - **Year**: e.g., "1935".
  - **Title**: Event title.
  - **Description**: Event details.

### 31. Future Delivery
- **Title**: Main heading.
- **Sub Title**: Subheading.
- **Bottom Description**: Rich text at the bottom.
- **Properties** (Repeater): List of text properties.

### 32. Group Value
- **Main Image**: Featured image.
- **Values** (Repeater):
  - **Title**: Value title.
  - **Description**: Value description.

### 33. Join Us
- **Small Caption**: Top small text.
- **Main Caption**: Large heading.
- **Short Description**: Intro text.
- **Image**: Desktop image.
- **Mobile Image**: Mobile image.
- **Button**: Link to a page.

### 34. Joinery Factory
- **Title**: Heading.
- **Description**: Rich text content.
- **Image**: Featured image.

### 35. Inner Banner
Used for internal pages.
- **Title**: Page title.
- **Subtitle**: Page subtitle.
- **Background Image**: Banner image.
- **Background Video**: Optional video background.
- **Show Overlay**: Toggle dark overlay.
- **Full View Height**: Toggle full screen height.

### 36. Leadership Intro
- **Title**: Heading.
- **Subtitle**: Subheading.
- **Paragraphs** (Repeater): Text paragraphs.

### 37. Other Projects
- **Related Projects** (Relationship): Select related projects to display.

### 38. Our Sectors
- **Title**: Heading.
- **Sectors** (Relationship): Select sectors to display.

### 39. Progress Section
- **Title**: Heading.
- **Tag**: Small label.
- **Paragraphs** (Repeater): Text paragraphs.
- **Image**: Featured image.
- **Image Order**: Select "Left" or "Right" alignment.

### 40. Projects Showcase
- **Title**: Heading.
- **Description**: Text content.
- **Projects** (Relationship): Select projects to feature.
- **Button Text**: Label for the button.
- **Button Link**: URL for the button.
- **Background Image**: Background for the section.

### 41. Digital Workflows
- **Title**: Heading.
- **Subtitle**: Subheading.
- **Conclusion**: Closing text.
- **Workflows** (Repeater):
  - **Title**: Workflow title.
  - **Icon**: Workflow icon.

### 42. Generic Content
A flexible layout for general content.
- **Title**: Heading.
- **Subtitle**: Subheading.
- **Content**: Rich text editor.
- **Main Image**: Desktop image.
- **Mobile Image**: Mobile image.
- **Button**: Link to a page.

