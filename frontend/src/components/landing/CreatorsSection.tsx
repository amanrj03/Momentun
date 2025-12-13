import { Star, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const creators = [
  {
    name: "Alex Rivera",
    role: "SaaS Founder",
    company: "CloudScale",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    videos: 24,
    followers: "12.5K",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    name: "Sarah Chen",
    role: "Tech CEO",
    company: "NeuraTech",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    videos: 31,
    followers: "28.3K",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    name: "Marcus Johnson",
    role: "Serial Entrepreneur",
    company: "VentureX",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    videos: 18,
    followers: "9.7K",
    gradient: "from-primary/20 to-accent/5",
  },
  {
    name: "Emily Zhang",
    role: "E-commerce Pioneer",
    company: "ShopFlow",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    videos: 42,
    followers: "45.2K",
    gradient: "from-accent/20 to-primary/5",
  },
];

const CreatorsSection = () => {
  return (
    <section id="creators" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm mb-6">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Featured Creators</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Learn from the{" "}
              <span className="gradient-text">Best Minds</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform hosts visionary entrepreneurs who share their authentic 
              stories, strategies, and hard-won lessons.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full px-6 border-border/50 hover:border-primary/30 hover:bg-secondary/50 group self-start lg:self-auto"
          >
            View All Creators
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Creators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden bg-card/30 border border-border/50 hover:border-primary/30 transition-all duration-500 hover-lift cursor-pointer"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${creator.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500">
                    <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6 -mt-20 z-10">
                <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                  {creator.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-1">{creator.role}</p>
                <p className="text-primary text-sm font-medium mb-4">{creator.company}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Play className="w-4 h-4" />
                    <span>{creator.videos} videos</span>
                  </div>
                  <div className="text-muted-foreground">
                    {creator.followers} followers
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreatorsSection;