import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto animate-fade-up">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="font-display text-[10rem] md:text-[14rem] font-bold leading-none gradient-text opacity-80">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Lost in the Vision
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full px-8 shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-border/50 hover:bg-secondary/50 hover:border-primary/30"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Decorative element */}
        <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground">
          <Search className="w-4 h-4" />
          <span className="text-sm">Tried to access: <code className="text-foreground bg-secondary px-2 py-1 rounded font-mono text-xs">{location.pathname}</code></span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
