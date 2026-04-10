import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en" id="font_size">
			<Head>
				{/* Ensure scroll is at top before React loads */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
              (function() {
                if (typeof window !== 'undefined') {
                  // Disable browser scroll restoration
                  if ('scrollRestoration' in window.history) {
                    window.history.scrollRestoration = 'manual';
                  }
                  // Scroll to top immediately
                  window.scrollTo(0, 0);
                  document.documentElement.scrollTop = 0;
                  if (document.body) {
                    document.body.scrollTop = 0;
                  }
                }
              })();
            `,
					}}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
