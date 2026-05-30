import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptReel - 带货视频提示词工作台",
  description: "面向带货团队的 AI 视频提示词工作台，上传商品图即可生成可执行的视频脚本与镜头提示词。",
  keywords: ["AI视频", "提示词", "带货视频", "Runway", "Pika", "Sora", "商品视频"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f7f8fb] text-gray-950">
        {children}
      </body>
    </html>
  );
}
