"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Music2, ArrowRight, LogIn, UserPlus } from "lucide-react";

export function Index() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-md z-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <Music2 className="w-8 h-8 text-[#1DB954]" />
          <h1 className="text-xl font-bold">Content Hub</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#1DB954] to-[#1ed760] bg-clip-text text-transparent">
              Content Request Hub
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Request new movies and TV shows, update existing content, or report issues
              with our simple wizard-driven process ✨
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card 
              className="group p-6 bg-[#282828] hover:bg-[#2a2a2a] border-none transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => router.push("/request")}
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full bg-[#1DB954] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Music2 className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-bold">Make a Request</h2>
                <p className="text-gray-400">
                  Submit your content requests easily through our guided wizard
                </p>
                <Button 
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold transition-colors"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card 
              className="p-6 bg-gradient-to-br from-[#535353] to-[#282828] border-none"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Already have an account?</h2>
                <p className="text-gray-400">
                  Sign in to track your requests and get notifications
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
                    onClick={() => router.push("/login")}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
                    onClick={() => router.push("/register")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 py-12">
            {[
              {
                title: "Easy Requests",
                description: "Submit content requests with our intuitive wizard interface 🎯"
              },
              {
                title: "Real-time Updates",
                description: "Track the status of your requests in real-time ⚡"
              },
              {
                title: "Quick Response",
                description: "Get notifications when your requests are processed 🔔"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg bg-[#282828] hover:bg-[#2a2a2a] transition-colors"
              >
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}