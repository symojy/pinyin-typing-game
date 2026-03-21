import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Nunito, Noto_Sans_SC } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main
      className={`${nunito.variable} ${notoSansSC.variable}`}
      style={{
        // font-family を inline で強制して、iOS などのフォールバック挙動に左右されにくくする
        fontFamily: `${nunito.style.fontFamily}, ${notoSansSC.style.fontFamily}, sans-serif`,
      }}
    >
      <Component {...pageProps} />
    </main>
  );
}