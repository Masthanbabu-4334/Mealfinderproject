let hamburger = document.getElementById('hamburger');
let sideMenu = document.getElementById('side-menu');
let closeBtn = document.getElementById('close-btn');
let overlay = document.getElementById('overlay');
let logo = document.getElementById('logo');
let categoryList = document.getElementById('category-list');
let searchBtn = document.getElementById('searchBtn');
let searchInput = document.getElementById('searchInput');
let resultsDiv = document.getElementById('results');
let categoriesCardRow = document.getElementById('categories-card-row');

// Hamburger open
hamburger.onclick = () => {
    sideMenu.classList.add('active');
    overlay.classList.add('active');
};
// Sidebar close
function closeMenu() {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
}
closeBtn.onclick = closeMenu;
overlay.onclick = closeMenu;

// Logo redirect
logo.onclick = () => window.location.href = "/";

// Load sidebar categories
fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`)
    .then(response => response.json())
    .then(data => {
        categoryList.innerHTML = "";
        data.categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category.strCategory;
            li.setAttribute('data-category', category.strCategory);
            categoryList.appendChild(li);
        });
    })
    .catch(() => {
        categoryList.innerHTML = "<li>Error loading categories</li>";
    });

// Sidebar: filter by category
categoryList.onclick = function(e) {
    if (e.target.tagName === 'LI') {
        const category = e.target.getAttribute('data-category');
        resultsDiv.innerHTML = '<div>Loading...</div>';
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
            .then(res => res.json())
            .then(data => {
                categoriesCardRow.style.display = 'none';
                document.querySelector('.categories-title').style.display = 'none';
                if (!data.meals) {
                    resultsDiv.innerHTML = '<div class="not-found">No recipes found!</div>';
                    return;
                }
                resultsDiv.innerHTML = data.meals
                    .map(meal => `
                        <div class="result-card">
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                            <h3>${meal.strMeal}</h3>
                        </div>
                    `).join('');
            })
            .catch(() => {
                resultsDiv.innerHTML = '<div class="not-found">Error loading recipes.</div>';
            });
        closeMenu();
    }
};

// Show category cards above search bar by default
fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`)
    .then(response => response.json())
    .then(data => {
        categoriesCardRow.innerHTML = data.categories
          .map(cat => `
            <div class="category-card" data-category="${cat.strCategory}">
                <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
                <span>${cat.strCategory}</span>
            </div>
          `)
          .join('');
    })
    .catch(() => {
        categoriesCardRow.innerHTML = "<div>Error loading categories</div>";
    });

// Clicking a category card loads recipes and hides category cards
categoriesCardRow.onclick = function(e) {
    const card = e.target.closest('.category-card');
    if (!card) return;
    categoriesCardRow.style.display = 'none';
    document.querySelector('.categories-title').style.display = 'none';
    const category = card.getAttribute('data-category');
    resultsDiv.innerHTML = '<div>Loading...</div>';
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                resultsDiv.innerHTML = '<div class="not-found">No recipes found!</div>';
                return;
            }
            resultsDiv.innerHTML = data.meals
                .map(meal => `
                    <div class="result-card">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                    </div>
                `).join('');
        })
        .catch(() => {
            resultsDiv.innerHTML = '<div class="not-found">Error loading recipes.</div>';
        });
};

// Search API: recipe search
function doSearch() {
    const food = searchInput.value.trim();
    if (!food) {
        resultsDiv.innerHTML = '';
        return;
    }
    categoriesCardRow.style.display = 'none';
    document.querySelector('.categories-title').style.display = 'none';
    resultsDiv.innerHTML = '<div>Loading...</div>';
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`)
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                resultsDiv.innerHTML = '<div class="not-found">No recipes found!</div>';
                return;
            }
            resultsDiv.innerHTML = data.meals
                .map(meal => `
                    <div class="result-card">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                    </div>
                `)
                .join('');
        })
        .catch(() => {
            resultsDiv.innerHTML = '<div class="not-found">Error loading recipes.</div>';
        });
}
searchBtn.onclick = doSearch;
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') doSearch();
});