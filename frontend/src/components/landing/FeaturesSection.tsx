import { Play, Users, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Play,
    title: "Curated Video Stories",
    description: "Hand-picked entrepreneurial journeys from founders who've built companies from zero to millions.",
    gradient: "from-primary to-primary/50",
  },
  {
    icon: Users,
    title: "Creator Community",
    description: "Connect with a network of ambitious entrepreneurs sharing real experiences and insights.",
    gradient: "from-accent to-accent/50",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Discovery",
    description: "Smart recommendations that match your interests, goals, and learning style perfectly.",
    gradient: "from-primary to-accent",
  },
  {
    icon: TrendingUp,
    title: "Growth Insights",
    description: "Track your learning progress and unlock new content as you advance your knowledge.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Shield,
    title: "Premium Content",
    description: "Exclusive access to behind-the-scenes content not available anywhere else.",
    gradient: "from-primary/80 to-primary",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Stream anywhere, anytime. Download for offline viewing on any device.",
    gradient: "from-accent/80 to-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Why Choose Momentum</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Built for the{" "}
            <span className="gradient-text-accent">Ambitious</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to learn from the world's most successful entrepreneurs, 
            all in one beautifully designed platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 hover:border-primary/20 transition-all duration-500 hover-lift cursor-default"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;