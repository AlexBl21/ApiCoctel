document.addEventListener('DOMContentLoaded', function () {
    const resultsContainer = document.getElementById('results');
    const drinks = JSON.parse(localStorage.getItem('drinks'));

    if (drinks && drinks.length > 0) {
        drinks.forEach(drink => {
            const drinkCard = document.createElement('div');
            drinkCard.classList.add('card');

            const img = document.createElement('img');
            img.src = drink.strDrinkThumb;
            img.alt = drink.strDrink;
            img.classList.add('card-img');

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const name = document.createElement('h5');
            name.textContent = drink.strDrink;
            name.classList.add('card-title');

            const text = document.createElement('p');
            text.textContent = "Some quick example text about the drink.";
            text.classList.add('card-text');

            cardBody.appendChild(name);
            cardBody.appendChild(text);
            drinkCard.appendChild(img);
            drinkCard.appendChild(cardBody);

            resultsContainer.appendChild(drinkCard);
        });
    } else {
        resultsContainer.innerHTML = '<p>No se encontraron cócteles.</p>';
    }
});
