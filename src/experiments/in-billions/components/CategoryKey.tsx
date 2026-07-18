interface CategoryKeyProps {
  visibleCategories: Set<number>;
  onToggleCategory: (categoryId: number) => void;
}

const categoryMap: Record<number, string> = {
  1: "Major Policy Proposals",
  2: "Individual Wealth & Income",
  3: "Government Budgets & Spending",
  4: "Items & Services",
  5: "Business",
};

const getCategoryColor = (categoryNum: number) => {
  const colors: Record<number, string> = {
    1: "bg-emerald", // Major Policy Proposals
    2: "bg-midnight-green", // Individual Wealth & Income
    3: "bg-bright-pink",    // Government Budgets & Spending
    4: "bg-warm-autumn-glow", // Items & Services
    5: "bg-blue-ncs"        // Business
  };
  return colors[categoryNum] || "bg-gray-500";
};

export function CategoryKey({ visibleCategories, onToggleCategory }: CategoryKeyProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Categories (click to toggle)</h3>
      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryMap).map(([id, name]) => {
          const categoryId = parseInt(id);
          const isVisible = visibleCategories.has(categoryId);

          return (
            <button
              key={categoryId}
              onClick={() => onToggleCategory(categoryId)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all hover:shadow-sm ${
                isVisible
                  ? 'bg-white border-gray-300'
                  : 'bg-gray-100 border-gray-200 opacity-60'
              }`}
            >
              <div
                className={`w-3 h-3 rounded ${getCategoryColor(categoryId)} ${
                  isVisible ? '' : 'opacity-50'
                }`}
              />
              <span className={`text-xs ${isVisible ? 'text-gray-800' : 'text-gray-500'}`}>
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
