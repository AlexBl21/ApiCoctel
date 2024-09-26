document.addEventListener('DOMContentLoaded', function () {
    const resultsContainer = document.getElementById('results');
    const detalleContainer = document.getElementById('detalle');
    const drinks = JSON.parse(localStorage.getItem('drinks'));
    const selectedDrink = JSON.parse(localStorage.getItem('selectedDrink'));
    const ingredientInfoContainer = document.getElementById('ingredientInfo');
    const modal = document.getElementById('ingredientModal');

    console.log('Drinks desde localStorage:', drinks); // Verifica si hay datos

    // Función para obtener detalles de una bebida por ID
    async function obtenerDetallesBebida(idDrink) {
        try {
            const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idDrink}`);
            const data = await response.json();
            return data.drinks ? data.drinks[0] : null;
        } catch (error) {
            console.error('Error al obtener los detalles de la bebida:', error);
            return null;
        }
    }

    // Función para obtener información de un ingrediente
    async function obtenerInformacionIngrediente(ingredient) {
        try {
            const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${ingredient}`);
            const data = await response.json();
            return data.ingredients ? data.ingredients[0] : null;
        } catch (error) {
            console.error('Error al obtener la información del ingrediente:', error);
            return null;
        }
    }

    // Función para mostrar la información del ingrediente en el modal
    async function mostrarInformacionIngrediente(ingredient) {
        const ingredientDetails = await obtenerInformacionIngrediente(ingredient);
        if (ingredientDetails) {
            const ingredientHtml = `
                <h2>Información del ingrediente: ${ingredientDetails.strIngredient}</h2>
                <p><strong>Descripción:</strong> ${ingredientDetails.strDescription || 'Sin descripción disponible'}</p>
                <p><strong>Tipo:</strong> ${ingredientDetails.strType || 'No disponible'}</p>
                <p><strong>Alcoholico:</strong> ${ingredientDetails.strAlcohol ? ingredientDetails.strAlcohol : 'No aplica'}</p>
                <p><strong>Porcentaje de alcohol:</strong> ${ingredientDetails.strABV ? ingredientDetails.strABV + '%' : 'No disponible'}</p>
            `;
            ingredientInfoContainer.innerHTML = ingredientHtml;

            // Mostrar la ventana modal
            modal.style.display = "block";
        } else {
            ingredientInfoContainer.innerHTML = `<p>No se encontró información para el ingrediente: ${ingredient}</p>`;
            modal.style.display = "block";
        }
    }

    const closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            modal.style.display = "none"; // Oculta la ventana modal
        });
    }

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none"; // Oculta la ventana modal
        }
    };

    // Verifica si estás en productos.html (donde existe el resultsContainer)
    if (resultsContainer && drinks && drinks.length > 0) {
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

            // Evento clic para redirigir a la página de detalles
            drinkCard.addEventListener('click', async function () {
                const detalleCompleto = await obtenerDetallesBebida(drink.idDrink);
                if (detalleCompleto) {
                    localStorage.setItem('selectedDrink', JSON.stringify(detalleCompleto));
                    window.location.href = './detalles.html';
                } else {
                    alert('No se pudieron obtener los detalles de la bebida.');
                }
            });

            cardBody.appendChild(name);
            drinkCard.appendChild(img);
            drinkCard.appendChild(cardBody);

            resultsContainer.appendChild(drinkCard);
        });
    } else if (resultsContainer) {
        resultsContainer.innerHTML = '<p>No se encontraron cócteles.</p>';
    }

    // Manejo de detalles de la bebida en detalles.html
    if (selectedDrink) {
        const detailsContainer = document.getElementById('drinkDetails');
        const html = `
            <div class="drink-header">
                <img class="drink-image" src="${selectedDrink.strDrinkThumb}" alt="${selectedDrink.strDrink}">
                <h1 class="drink-title">${selectedDrink.strDrink}</h1>
            </div>
            <div class="drink-info">
                <h2>Instrucciones</h2>
                <p>${selectedDrink.strInstructions}</p>
                <h2>Ingredientes</h2>
                <ul>
                    ${Object.keys(selectedDrink)
                        .filter(key => key.includes('strIngredient') && selectedDrink[key])
                        .map(ingredientKey => {
                            const measureKey = ingredientKey.replace('Ingredient', 'Measure');
                            const measure = selectedDrink[measureKey] ? `${selectedDrink[measureKey]} de ` : '';
                            return `
                                <li>
                                    ${measure}${selectedDrink[ingredientKey]} 
                                    <button class="ingredient-btn" data-ingredient="${selectedDrink[ingredientKey]}">Ver información</button>
                                </li>
                            `;
                        })
                        .join('')}
                </ul>
                <h2>Información adicional</h2>
                <p><strong>Categoria:</strong> ${selectedDrink.strCategory}</p>
                <p><strong>Tipo:</strong> ${selectedDrink.strAlcoholic}</p>
                <p><strong>Vaso recomendado:</strong> ${selectedDrink.strGlass}</p>
            </div>
        `;
        detailsContainer.innerHTML = html;

        // Agregar eventos a los botones de ingredientes
        document.querySelectorAll('.ingredient-btn').forEach(button => {
            button.addEventListener('click', function (event) {
                event.stopPropagation(); // Evitar que el evento burbujee y cierre el modal
                const ingredient = this.getAttribute('data-ingredient');
                mostrarInformacionIngrediente(ingredient); // Mostrar la información del ingrediente
            });
        });
    }

    // Manejo del evento de clic para el botón "Regresar"
    document.getElementById('regresarBtn').addEventListener('click', function() {
        window.location.href = './productos.html'; // Cambia la ruta según tu estructura de carpetas
    });
});
