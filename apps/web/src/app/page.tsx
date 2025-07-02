"use client";

import { useRef, useEffect } from "react";
import { useSession } from "~/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Faq from "~/components/faq";
import Footer from "~/components/footer";
import Hero from "~/components/hero";
import Demo from "~/components/demo";
import Powered from "~/components/powered";
import { Confetti, type ConfettiRef } from "~/components/magicui/confetti";
import { Button } from "~/components/ui/button";
import { ArrowRight, Video } from "lucide-react";

export default function Home() {
  const confettiRef = useRef<ConfettiRef>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user was redirected here after login
    const redirect = searchParams.get("redirect");
    if (redirect === "dashboard" && status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [searchParams, status, session, router]);

  return (
    <main className="mx-auto max-w-screen-2xl w-full h-full flex-1 flex flex-col relative">
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 z-50 pointer-events-none"
        manualstart={true}
      />
      <Hero />
      
      {/* Video Processing CTA Section */}
      <section className="py-16 bg-gradient-to-br">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e5ff00] rounded-full">
                <Video className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Process Your Videos with AI
              </h2>
              <p className="text-lg text-white max-w-2xl mx-auto">
                Upload your videos and let our AI extract frames, analyze content, and provide insights. 
                Get started with just a few clicks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session?.user ? (
                <Button 
                  size="lg" 
                  onClick={() => router.push("/dashboard")}
                  className="bg-[#e5ff00] hover:bg-[#e5ff00]/80 text-black px-8 py-3"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => router.push("/dashboard")}
                  className="bg-[#e5ff00] hover:bg-[#e5ff00]/80 text-black px-8 py-3"
                >
                  Sign In to Start
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-lg shadow-sm bg-zinc-900">
                <div className="w-12 h-12 bg-[#e5ff00] rounded-lg flex items-center justify-center mb-4">
                  <span className="text-black font-bold">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Upload Video</h3>
                <p className="text-white text-sm">
                  Drag and drop your video file or click to browse. Supports MP4, MOV, AVI, and more.
                </p>
              </div>
              
              <div className="p-6 rounded-lg shadow-sm bg-zinc-900">
                <div className="w-12 h-12 bg-[#e5ff00] rounded-lg flex items-center justify-center mb-4">
                  <span className="text-black font-bold">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">AI Processing</h3>
                <p className="text-white text-sm">
                  Our AI automatically segments your video and extracts key frames for analysis.
                </p>
              </div>
              
              <div className="p-6 rounded-lg shadow-sm bg-zinc-900">
                <div className="w-12 h-12 bg-[#e5ff00] rounded-lg flex items-center justify-center mb-4">
                  <span className="text-black font-bold">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Get Results</h3>
                <p className="text-white text-sm">
                  View processed frames, download results, and analyze your video content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Powered />
      <Faq />
      <Footer />
    </main>
  );
}
