"use client";

import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { HomeGamingFooter } from "@/components/home/HomeGamingFooter";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <HomeBackdrop />
      <HomeDashboard />
      <div className="page-container pb-8">
        <HomeGamingFooter />
      </div>
    </div>
  );
}
