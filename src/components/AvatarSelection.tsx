import { useState, useRef } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const AI_AVATARS = [
  // Personas style - Professional
  'https://api.dicebear.com/7.x/personas/svg?seed=Felix&backgroundColor=b6e3f4,c1f0c1,d1d4f9',
  'https://api.dicebear.com/7.x/personas/svg?seed=Luna&backgroundColor=ffdfbf,ffd5dc,c0aede',
  'https://api.dicebear.com/7.x/personas/svg?seed=Nova&backgroundColor=c0aede,b6e3f4,ffdfbf',
  'https://api.dicebear.com/7.x/personas/svg?seed=Orion&backgroundColor=d1d4f9,c1f0c1,ffd5dc',
  'https://api.dicebear.com/7.x/personas/svg?seed=Phoenix&backgroundColor=ffd5dc,ffdfbf,b6e3f4',
  'https://api.dicebear.com/7.x/personas/svg?seed=Atlas&backgroundColor=b6e3f4,c0aede,c1f0c1',
  'https://api.dicebear.com/7.x/personas/svg?seed=Sage&backgroundColor=c1f0c1,d1d4f9,ffdfbf',
  'https://api.dicebear.com/7.x/personas/svg?seed=Echo&backgroundColor=ffdfbf,ffd5dc,d1d4f9',
  'https://api.dicebear.com/7.x/personas/svg?seed=Iris&backgroundColor=c0aede,c1f0c1,b6e3f4',
  
  // Fun style - Playful
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Moon&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sun&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Rainbow&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cloud&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Heart&backgroundColor=c1f0c1',
  
  // Pixel Art style - Retro
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Retro&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Arcade&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Game&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Quest&backgroundColor=d1d4f9',
  
  // Adventurer style - Fantasy
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Warrior&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mage&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Rogue&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Cleric&backgroundColor=ffd5dc',
];

interface AvatarSelectionProps {
  selectedAvatar: string;
  onSelect: (url: string) => void;
}

export default function AvatarSelection({ selectedAvatar, onSelect }: AvatarSelectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'personas' | 'fun' | 'pixel' | 'fantasy'>('all');
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', name: 'All Styles' },
    { id: 'personas', name: 'Professional', range: [0, 8] },
    { id: 'fun', name: 'Playful', range: [9, 14] },
    { id: 'pixel', name: 'Retro', range: [15, 19] },
    { id: 'fantasy', name: 'Fantasy', range: [20, 23] },
  ];

  const filteredAvatars = activeCategory === 'all' 
    ? AI_AVATARS 
    : AI_AVATARS.slice(
        categories.find(c => c.id === activeCategory)?.range[0] || 0,
        (categories.find(c => c.id === activeCategory)?.range[1] || 0) + 1
      );

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;

    const scrollAmount = 320; // Adjust this value to control scroll distance
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(
          sliderRef.current.scrollWidth - sliderRef.current.clientWidth,
          scrollPosition + scrollAmount
        );

    sliderRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose an Avatar</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Fun, unique AI-generated avatars</p>
      </div>

      {/* Category Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id as any);
              setScrollPosition(0);
              if (sliderRef.current) {
                sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Avatar Slider */}
      <div className="relative group">
        <div
          ref={sliderRef}
          className="grid grid-flow-col auto-cols-[minmax(5rem,1fr)] gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          style={{ gridTemplateColumns: `repeat(${Math.ceil(filteredAvatars.length / 2)}, minmax(0, 1fr))` }}
        >
          {filteredAvatars.map((avatar, index) => (
            <div key={avatar} className="snap-start">
              <button
                onClick={() => onSelect(avatar)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
                  selectedAvatar === avatar
                    ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-gray-800'
                    : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 dark:hover:ring-offset-gray-800'
                }`}
              >
                <img
                  src={avatar}
                  alt={`Avatar option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                )}
                {hoveredIndex === index && selectedAvatar !== avatar && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-white/5 transition-opacity duration-200" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 disabled:opacity-0 ${
            scrollPosition === 0 ? 'invisible' : ''
          }`}
          disabled={scrollPosition === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 ${
            sliderRef.current && scrollPosition >= (sliderRef.current.scrollWidth - sliderRef.current.clientWidth) ? 'invisible' : ''
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}