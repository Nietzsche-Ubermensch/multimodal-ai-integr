import { Card } from "@/components/ui/card";
import { ListNumbers, Cube, Code, ChartLine, Rocket } from "@phosphor-icons/react";

export function TableOfContentsSlide() {
  const sections = [
    {
      number: "01",
      title: "Platform Architecture Overview",
      description: "Deepseek & OpenRouter core functionalities, multimodal processing capabilities",
      icon: Cube,
    },
    {
      number: "02",
      title: "Model Endpoints & Specifications",
      description: "Comprehensive technical specs for 13+ models with connection endpoints",
      icon: ListNumbers,
    },
    {
      number: "03",
      title: "Embedding Models & Multimodal Processing",
      description: "Deep dive into embedding configurations and text/image processing",
      icon: ChartLine,
    },
    {
      number: "04",
      title: "Integration Best Practices",
      description: "Advanced strategies for performance optimization and scalability",
      icon: Code,
    },
    {
      number: "05",
      title: "Implementation Examples",
      description: "Practical code patterns demonstrating real-world integration",
      icon: Rocket,
    },
  ];

  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1 h-16 bg-accent" />
          <div>
            <p className="text-sm font-mono tracking-widest text-accent uppercase mb-1">
              Navigation
            </p>
            <h2 className="text-5xl font-bold">Contents</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {sections.map((section) => (
          <Card
            key={section.number}
            className="p-6 bg-card/50 border-l-4 border-accent hover:bg-card transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-accent-foreground font-mono">
                  {section.number}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
