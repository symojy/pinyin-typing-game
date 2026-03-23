import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Nunito, Noto_Sans_SC, ZCOOL_KuaiLe } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
});

/** 漢字カード専用（丸みのある簡体字）。英数字 UI は Nunito のまま */
const zcoolKuaiLe = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zcool-kuaile",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main
      className={`${nunito.variable} ${notoSansSC.variable} ${zcoolKuaiLe.variable} font-semibold`}
      style={{
        // font-family を inline で強制して、iOS などのフォールバック挙動に左右されにくくする
        fontFamily: `${nunito.style.fontFamily}, ${notoSansSC.style.fontFamily}, sans-serif`,
      }}
    >
      <Component {...pageProps} />
      <Analytics />
    </main>
  );
}
