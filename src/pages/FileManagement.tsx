import { useState } from 'react';
import { SearchBar } from '../components/files/SearchBar';
import { FileFilters } from '../components/files/FileFilters';
import { FileList } from '../components/files/FileList';
import { FileHeader } from '../components/files/FileHeader';

export function FileManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FileHeader />
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <FileFilters
            activeFilter={activeFilter}
            showFavorites={showFavorites}
            onFilterChange={setActiveFilter}
            onFavoritesChange={setShowFavorites}
          />
        </div>

        <FileList
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          showFavorites={showFavorites}
        />
      </div>
    </div>
  );
}