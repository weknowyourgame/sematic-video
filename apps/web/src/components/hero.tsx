"use client";

import { useMemo, useState } from "react";

import People from "./people";
import { Logo } from "./svgs";
import Form from "./form";
import Demo from "./demo";

export default function Hero() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center justify-center gap-6 mb-6">
        <Logo />
        <div className="flex items-center gap-4 rounded-full border border-border px-4 py-1 relative">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400" />
          </span>
          <p className="uppercase text-sm font-medium">
            Try for free
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 max-w-2xl">
        <h2 className="text-4xl font-bold text-foreground">
        Sematic Video
        </h2>
        <p className="text-base text-muted-foreground text-center max-w-md">
        turns video into a searchable and structured data.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 w-full max-w-md">
        {/* <Form onSuccessChange={setIsSuccess} /> */}
        <Demo videoSrc="/demo.mp4" thumbnailSrc="/demo.png" className="w-full h-full"/>
      </div>
      <div className="flex items-center justify-center gap-2">
        <People />
      </div>
    </div>
  );
}
