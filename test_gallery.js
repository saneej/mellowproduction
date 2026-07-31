const getGalleryClasses = (mode, cols) => {
  if (mode === "masonry") {
    const colClass = cols === 2 ? "lg:columns-2" : cols === 4 ? "lg:columns-4" : cols === 5 ? "lg:columns-5" : "lg:columns-3";
    return {
      wrapper: `columns-1 sm:columns-2 ${colClass} gap-6 space-y-6`,
      item: "break-inside-avoid relative group"
    };
  }
  if (mode === "justified") {
    return {
      wrapper: "flex flex-wrap gap-2 justify-center",
      item: "flex-auto w-32 sm:w-48 lg:w-64 relative group"
    };
  }
  if (mode === "carousel") {
    return {
      wrapper: "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar",
      item: "w-[85vw] sm:w-[60vw] md:w-[40vw] flex-shrink-0 snap-center relative group"
    };
  }
  if (mode === "collage") {
    return {
      wrapper: "grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[300px]",
      item: (idx) => {
        const isLarge = idx % 7 === 0;
        const isWide = idx % 5 === 0 && !isLarge;
        const isTall = idx % 4 === 0 && !isLarge && !isWide;
        return `relative group ${isLarge ? 'col-span-2 row-span-2' : isWide ? 'col-span-2' : isTall ? 'row-span-2' : ''}`;
      }
    };
  }
  
  // grid
  const gridColClass = cols === 2 ? "lg:grid-cols-2" : cols === 4 ? "lg:grid-cols-4" : cols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-3";
  return {
    wrapper: `grid grid-cols-1 sm:grid-cols-2 ${gridColClass} gap-6`,
    item: "relative group"
  };
};
