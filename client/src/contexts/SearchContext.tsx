import React, { createContext, useContext, useState, useEffect } from 'react';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  // Get initial search term from URL if present
  const getInitialSearchTerm = () => {
    if (typeof window !== 'undefined') {
      const qs = new URLSearchParams(window.location.search);
      return qs.get('q') || '';
    }
    return '';
  };

  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm());

  // Update URL when search term changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/venues') {
      const params = new URLSearchParams(window.location.search);
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      } else {
        params.delete('q');
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchTerm]);

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};