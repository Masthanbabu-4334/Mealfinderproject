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
        showMealsByCategory(category);
        closeMenu();
    }
};

// Show category cards below search results always
function renderCategories() {
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
            categoriesCardRow.style.display = 'flex';  
            document.querySelector('.categories-title').style.display = 'block'; 
        })
        .catch(() => {
            categoriesCardRow.innerHTML = "<div>Error loading categories</div>";
        });
}

// On load, render categories
renderCategories();

// Clicking a category card loads recipes and shows categories below
categoriesCardRow.onclick = function(e) {
    const card = e.target.closest('.category-card');
    if (!card) return;
    showMealsByCategory(card.getAttribute('data-category'));
};

// Render meals for category
function showMealsByCategory(category) {
    resultsDiv.innerHTML = '<div>Loading...</div>';  
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        .then(res => res.json())
        .then(data => {
            let html = `<div class="meals-heading">MEALS</div><div class="search-results-container">`;
            if (!data.meals) {
                html += '<div class="not-found">No recipes found!</div>';
            } else {
                html += data.meals.map(meal => `
                    <div class="result-card" data-mealid="${meal.idMeal}">
                        <div class="cuisine">${category}</div>
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                    </div>
                `).join('');
            }
            html += '</div>';
            resultsDiv.innerHTML = html;
            renderCategories();  
        })
        .catch(() => {
            resultsDiv.innerHTML = '<div class="not-found">Error loading recipes.</div>';
            renderCategories();  
        });
}

// Search API: recipe search
function doSearch() {
    const food = searchInput.value.trim();
    if (!food) {
        resultsDiv.innerHTML = '';
        renderCategories();
        return;
    }
    resultsDiv.innerHTML = '<div>Loading...</div>';
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`)
        .then(res => res.json())
        .then(data => {
            let html = `<div class="meals-heading">MEALS</div><div class="search-results-container">`;
            if (!data.meals) {
                html += '<div class="not-found">No recipes found!</div>';
            } else {
                html += data.meals.map(meal => `
                    <div class="result-card" data-mealid="${meal.idMeal}">
                        <div class="cuisine">${meal.strArea || ''}</div>
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                    </div>
                `).join('');
            }
            html += '</div>';
            resultsDiv.innerHTML = html;
            renderCategories();
        })
        .catch(() => {
            resultsDiv.innerHTML = '<div class="not-found">Error loading recipes.</div>';
            renderCategories();
        });
}
searchBtn.onclick = doSearch;
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') doSearch();
});

// When clicking a meal card, go to meal details page
resultsDiv.onclick = function(e) {
    const card = e.target.closest('.result-card');
    if (!card) return;
    const mealId = card.getAttribute('data-mealid');
    showMealDetails(mealId);
}

// Show meal details in a modal or section
function showMealDetails(mealId) {
    resultsDiv.innerHTML = '<div>Loading meal details...</div>';
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                resultsDiv.innerHTML = '<div class="not-found">Meal details not found!</div>';
                renderCategories();
                return;
            }
            const meal = data.meals[0];

            // Build ingredients and measures arrays
            let ingredientsArr = [], measuresArr = [];
            for (let i = 1; i <= 20; i++) {
                let ingredient = meal["strIngredient" + i];
                let measure = meal["strMeasure" + i];
                if (ingredient && ingredient.trim()) {
                    ingredientsArr.push(ingredient.trim());
                    if (measure && measure.trim()) measuresArr.push(measure.trim());
                }
            }

            // Ingredients HTML
            let ingredientsHTML = ingredientsArr.map((ing, idx) => 
                `<span class="ingredient-pill"><i class="fa-solid fa-circle" style="font-size:0.9em;color:#ffb811"></i> ${ing}</span>`
            ).join('');

            // Measures HTML
            let measuresHTML = measuresArr.map(val => 
                `<span class="measure-pill"><i class="fa-solid fa-check" style="font-size:0.95em;color:#eb5310"></i> ${val}</span>`
            ).join('');

            resultsDiv.innerHTML = `
                <div class="details-heading">MEAL DETAILS</div>
                <div class="meal-details-container">
                    <img class="details-img" src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <div class="meal-info">
                        <h2 class="meal-title-detail">${meal.strMeal}</h2>
                        <div class="meal-meta">
                            <div><b>Category:</b> ${meal.strCategory}</div>
                            <div><b>Area:</b> ${meal.strArea}</div>
                            ${meal.strSource ? `<div><b>Source:</b> <a href="${meal.strSource}" target="_blank">${meal.strSource}</a></div>` : ''}
                            <div><b>Tags:</b> ${meal.strTags || "None"}</div>
                        </div>
                        <div class="ingredients-box">
                            <div class="ingredients-title">Ingredients:</div>
                            <div class="ingredient-list-grid">${ingredientsHTML}</div>
                        </div>
                        <div class="measure-box">
                            <div class="measure-title">Measure:</div>
                            <div class="measure-list">${measuresHTML}</div>
                        </div>
                        <div class="instructions-title">Instructions:</div>
                        <div class="description-area">${meal.strInstructions || ""}</div>
                    </div>
                </div>
            `;
            renderCategories();
        })
        .catch(() => {
            resultsDiv.innerHTML = '<div class="not-found">Error loading meal details.</div>';
            renderCategories();
        });
}