"use client";

import { useRef } from "react";
import Faq from "~/components/faq";
import Footer from "~/components/footer";
import Hero from "~/components/hero";
import Demo from "~/components/demo";
import Powered from "~/components/powered";
import { Confetti, type ConfettiRef } from "~/components/magicui/confetti";

export default function Home() {
  const confettiRef = useRef<ConfettiRef>(null);

  return (
    <main className="mx-auto max-w-screen-2xl w-full h-full flex-1 flex flex-col relative">
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 z-50 pointer-events-none"
        manualstart={true}
      />
      <Hero />
      {/* <Demo videoSrc="/demo.mp4" thumbnailSrc="/demo.png" /> */}
      <Powered />
      <Faq />
      <Footer />
    </main>
  );
}
