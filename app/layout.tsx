import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptReel - AI 视频提示词生成器",
  description: "上传商品图片，一键生成专业级 AI 视频提示词，支持 Runway、Pika、Sora 等主流 AI 视频工具",
  keywords: ["AI视频", "提示词", "带货视频", "Runway", "Pika", "Sora", "商品视频"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
