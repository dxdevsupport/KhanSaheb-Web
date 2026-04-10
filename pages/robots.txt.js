export const getServerSideProps = ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://khansaheb.ae";

  const robots = `User-agent: *
disallow: /
Sitemap: ${baseUrl}/sitemap.xml`;

  res.setHeader("Content-Type", "text/plain");
  res.write(robots);
  res.end();

  return {
    props: {},
  };
};

export default function Robots() {}
