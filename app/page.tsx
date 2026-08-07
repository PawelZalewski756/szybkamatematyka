"use client";

import { HomeDashboard } from "@/components/home/HomeDashboard";
import { HomeGamingFooter } from "@/components/home/HomeGamingFooter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeDashboard />
      <div className="page-container pb-10 pt-4">
        <HomeGamingFooter />
      </div>
    </div>
  );
}
