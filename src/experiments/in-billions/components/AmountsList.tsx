import { useState, useEffect } from 'react';
import { AmountDisplay } from './AmountDisplay';
import { CategoryKey } from './CategoryKey';
import amountsData from '../data/amounts.json';

interface AmountItem {
  amount: number;
  title: string;
  description: string;
  sourceUrl: string;
  category: number;
}

export function AmountsList() {
  const [amounts, setAmounts] = useState<AmountItem[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [visibleCategories, setVisibleCategories] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));

  useEffect(() => {
    setAmounts(amountsData);
  }, []);

  const filteredAndSortedAmounts = [...amounts]
    .filter(item => visibleCategories.has(item.category))
    .sort((a, b) => {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    });

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const toggleCategory = (categoryId: number) => {
    const newVisibleCategories = new Set(visibleCategories);
    if (newVisibleCategories.has(categoryId)) {
      newVisibleCategories.delete(categoryId);
    } else {
      newVisibleCategories.add(categoryId);
    }
    setVisibleCategories(newVisibleCategories);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">In Billions</h1>
            <p className="text-gray-600 mt-1">Wealth, spending, and costs measured in billions of dollars</p>
          </div>
          <button
            onClick={toggleSort}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sort {sortOrder === 'desc' ? 'Low to High' : 'High to Low'}
          </button>
        </div>
      </div>
      <div className="p-6">
        <CategoryKey
          visibleCategories={visibleCategories}
          onToggleCategory={toggleCategory}
        />
        <div className="flex flex-col justify-center items-center">
          {filteredAndSortedAmounts.map((item) => (
            <AmountDisplay
              key={item.title}
              amount={item.amount}
              title={item.title}
              description={item.description}
              sourceUrl={item.sourceUrl}
              category={item.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
