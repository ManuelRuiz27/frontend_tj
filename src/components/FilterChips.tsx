import { ChangeEvent, FormEvent } from 'react';

interface FilterChipsProps {
  categories: string[];
  municipalities: string[];
  selectedCategory?: string;
  selectedMunicipality?: string;
  query: string;
  onCategoryChange: (category?: string) => void;
  onMunicipalityChange: (municipality?: string) => void;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

const FilterChips = ({
  categories,
  municipalities,
  selectedCategory,
  selectedMunicipality,
  query,
  onCategoryChange,
  onMunicipalityChange,
  onQueryChange,
  onSearch,
  onReset,
}: FilterChipsProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  const handleQueryInput = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  const renderChip = (
    value: string,
    isActive: boolean,
    onClick: (value?: string) => void,
  ) => (
    <button
      type="button"
      key={value}
      className={`chip${isActive ? ' chip--active' : ''}`}
      onClick={() => onClick(isActive ? undefined : value)}
      aria-pressed={isActive}
    >
      {value}
    </button>
  );

  return (
    <form className="catalog-filters" onSubmit={handleSubmit}>
      <div className="catalog-filters__search">
        <label htmlFor="catalog-search" className="sr-only">
          Buscar por nombre
        </label>
        <input
          id="catalog-search"
          type="search"
          placeholder="Buscar beneficio"
          value={query}
          onChange={handleQueryInput}
          className="catalog-filters__input"
        />
        <button type="submit" className="catalog-filters__submit">
          Buscar
        </button>
      </div>

      {categories.length > 0 && (
        <div className="catalog-filters__chips" role="group" aria-label="Filtrar por categoría">
          {categories.map((category) =>
            renderChip(category, selectedCategory === category, onCategoryChange),
          )}
        </div>
      )}

      {municipalities.length > 0 && (
        <div className="catalog-filters__chips" role="group" aria-label="Filtrar por municipio">
          {municipalities.map((municipality) =>
            renderChip(
              municipality,
              selectedMunicipality === municipality,
              onMunicipalityChange,
            ),
          )}
        </div>
      )}

      <button type="button" className="catalog-filters__reset" onClick={onReset}>
        Limpiar filtros
      </button>
    </form>
  );
};

export default FilterChips;
