const categoriesContainer = document.getElementById("categories");

function renderCategories() {
    categoriesData.forEach(category => {
        categoriesContainer.innerHTML += `
            <div class="card">
                <div class="card-top">
                    <h1>${category.icon}</h1>
                </div>
                <div class="card-bottom">
                    <h3>${category.title}</h3>
                </div>
            </div>
        `;
    });
}

renderCategories();