import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, List } from "@phosphor-icons/react";
import { UniversalSlide } from "@/components/UniversalSlide";
import { slides } from "@/data/slides";
import { cn } from "@/lib/utils";

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        setShowMenu((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setShowMenu(false);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          className="gap-2"
        >
          <List size={16} weight="bold" />
          Menu
        </Button>
      </div>

      {showMenu && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Slide Navigation</h2>
              <p className="text-muted-foreground">Click any slide to jump to it</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "p-6 rounded-lg border-2 text-left transition-all",
                    currentSlide === index
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50 hover:bg-card"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-accent-foreground font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold mb-1">{slide.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Slide {index + 1} of {slides.length}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => setShowMenu(false)}>
                Close Menu (ESC)
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-7xl aspect-[16/9] bg-card rounded-xl shadow-2xl overflow-hidden border border-border">
          <UniversalSlide 
            slide={currentSlideData} 
            slideNumber={currentSlide + 1}
            totalSlides={slides.length}
          />
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        <Button
          variant="outline"
          size="lg"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="gap-2"
        >
          <ArrowLeft size={20} weight="bold" />
          Previous
        </Button>

        <Badge variant="outline" className="px-6 py-3 text-lg font-mono">
          {currentSlide + 1} / {slides.length}
        </Badge>

        <Button
          variant="outline"
          size="lg"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="gap-2"
        >
          Next
          <ArrowRight size={20} weight="bold" />
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          Use ← → to navigate
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          ESC for menu
        </Badge>
      </div>
    </div>
  );
}

export default App;