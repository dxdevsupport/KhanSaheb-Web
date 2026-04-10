import Head from "next/head";
import Link from "next/link";
import styles from "./404.module.scss";

function Custom404() {
	return (
		<>
			<Head>
				<title>404 - Page Not Found | Khansaheb</title>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<div className={styles.wrapper}>
				<div className={styles.content}>
					<span className={styles.code}>404</span>
					<h1 className={styles.title}>Page Not Found</h1>
					<p className={styles.description}>
						The page you&apos;re looking for doesn&apos;t exist or has been moved.
						Let&apos;s get you back on track.
					</p>
					<Link href="/" className={styles.cta}>
						Back to Home
					</Link>
				</div>
			</div>
		</>
	);
}

Custom404.is404 = true;
export default Custom404;
