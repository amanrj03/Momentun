import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 left-20 w-3 h-3 bg-primary rounded-full animate-float opacity-60" />
      <div className="absolute top-48 right-32 w-2 h-2 bg-accent rounded-full animate-float animation-delay-200 opacity-60" />
      <div className="absolute bottom-48 left-32 w-4 h-4 bg-primary/50 rounded-full animate-float animation-delay-400 opacity-40" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                The Future of Entrepreneur Learning
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8 animate-fade-up animation-delay-200">
            <span className="text-foreground">Where Visionaries</span>
            <br />
            <span className="gradient-text">Share Their Journey</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up animation-delay-400 text-balance">
            Discover exclusive video content from successful entrepreneurs. 
            Learn their strategies, failures, and breakthroughs—all in one 
            premium video directory built for the next generation of founders.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-600">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1 group"
              asChild
            >
              <Link to="/login">
                Start Exploring
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 py-6 text-lg font-semibold border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 group"
            >
              <Play className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 animate-fade-up animation-delay-1000">
            {[
              { value: "500+", label: "Video Stories" },
              { value: "150+", label: "Entrepreneurs" },
              { value: "50K+", label: "Active Learners" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="text-3xl md:text-4xl font-display font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 mb-32 relative max-w-4xl mx-auto animate-scale-in animation-delay-600">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent z-10" />
            
            {/* Demo Thumbnail */}
            <img 
              src="/landingPageDemo.png" 
              alt="Momentum Platform Demo" 
              className="w-full h-full object-cover"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-all duration-300 hover:scale-110 group">
                <Play className="w-8 h-8 text-primary fill-primary group-hover:scale-110 transition-transform" />
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl blur-xl opacity-30 -z-10" />
          </div>

          {/* Floating Cards */}
          <div className="absolute -left-8 top-1/4 glass-card p-4 rounded-xl shadow-lg animate-float hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
              <div>
                <div className="text-sm font-semibold text-foreground">Sarah Chen</div>
                <div className="text-xs text-muted-foreground">Tech Founder</div>
              </div>
            </div>
          </div>

          <div className="absolute -right-8 bottom-1/4 glass-card p-4 rounded-xl shadow-lg animate-float animation-delay-400 hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold gradient-text">12K</div>
              <div className="text-xs text-muted-foreground">views today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;