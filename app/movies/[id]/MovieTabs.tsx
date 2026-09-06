"use client";

import { useState } from "react";

type TabId = "details" | "cast" | "reviews";

export default function MovieTabs({
  details,
  cast,
  reviews,
}: {
  details: React.ReactNode;
  cast: React.ReactNode;
  reviews: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("details");

  const tabs: { id: TabId; label: string }[] = [
    { id: "details", label: "รายละเอียด" },
    { id: "cast", label: "นักแสดง/ทีมงาน" },
    { id: "reviews", label: "รีวิว" },
  ];

  return (
    <div>
      <div className="flex gap-6 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`border-b-2 pb-3 text-sm transition-colors ${
              active === tab.id
                ? "border-[#E8A33D] font-medium text-[#E8A33D]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-8">
        {active === "details" && details}
        {active === "cast" && cast}
        {active === "reviews" && reviews}
      </div>
    </div>
  );
}