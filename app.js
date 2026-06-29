const { useState, useEffect } = React;

const API_KEY = 'bbb7aba425484c77ad1a94e0b1be5ecd';

function App() {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const searchRecipes = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setShowFavoritesOnly(false);

    try {
      let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&number=12`;
      if (diet) {
        url += `&diet=${diet}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        setRecipes(data.results);
      } else if (data.status === 'failure') {
         setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch recipes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeDetails = async (id) => {
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
      const data = await response.json();
      setSelectedRecipe(data);
    } catch (err) {
      alert('Failed to fetch recipe details.');
    }
  };

  const toggleFavorite = (recipe) => {
    const isFav = favorites.find((f) => f.id === recipe.id);
    if (isFav) {
      setFavorites(favorites.filter((f) => f.id !== recipe.id));
    } else {
      setFavorites([...favorites, { id: recipe.id, title: recipe.title, image: recipe.image }]);
    }
  };

  const isFavorite = (id) => {
    return favorites.some((f) => f.id === id);
  };

  const displayedRecipes = showFavoritesOnly ? favorites : recipes;

  return (
    <div className="container">
      <header>
        <h1>Recipe Finder</h1>
        <button onClick={() => setDarkMode(!darkMode)}>
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </header>

      <form className="search-section" onSubmit={searchRecipes}>
        <input
          type="text"
          placeholder="Search recipes (e.g., pasta)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={diet} onChange={(e) => setDiet(e.target.value)}>
          <option value="">Any Diet</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten free">Gluten Free</option>
        </select>
        <button type="submit">Search</button>
      </form>

      <div className="favorites-toggle">
        <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          {showFavoritesOnly ? 'Show Search Results' : 'Show Favorites'}
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      {!loading && !error && displayedRecipes.length === 0 && (
        <p>No recipes found. Try searching for something else!</p>
      )}

      <div className="recipe-grid">
        {displayedRecipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.title} />
            <h3>{recipe.title}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => fetchRecipeDetails(recipe.id)}>View Details</button>
              <button onClick={() => toggleFavorite(recipe)}>
                {isFavorite(recipe.id) ? 'Unfavorite' : 'Favorite'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedRecipe(null)}>&times;</button>
            <h2>{selectedRecipe.title}</h2>
            <img src={selectedRecipe.image} alt={selectedRecipe.title} style={{ maxWidth: '100%' }} />
            
            <h3>Ingredients</h3>
            <ul>
              {selectedRecipe.extendedIngredients?.map((ing) => (
                <li key={ing.id + ing.original}>{ing.original}</li>
              ))}
            </ul>
            
            <h3>Instructions</h3>
            <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
