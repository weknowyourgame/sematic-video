"use client";

import { useRef, Suspense } from "react";
import { useSession } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import Faq from "~/components/faq";
import Footer from "~/components/footer";
import Hero from "~/components/hero";
import Powered from "~/components/powered";
import { Confetti, type ConfettiRef } from "~/components/magicui/confetti";
import HomeContent from "./HomeContent";

export default function Home() {
  const confettiRef = useRef<ConfettiRef>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <main className="mx-auto max-w-screen-2xl w-full h-full flex-1 flex flex-col relative">
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 z-50 pointer-events-none"
        manualstart={true}
      />
      <Hero />
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
      <Powered />
      <Faq />
      <Footer />
    </main>
  );
}
