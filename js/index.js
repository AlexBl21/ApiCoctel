document.addEventListener('DOMContentLoaded', async function () {
    const apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1';
    const inputIngrediente = document.getElementById('ingrediente');
    const suggestionsListIngrediente = document.getElementById('suggestionsListIngrediente');
    const tipoSelect = document.getElementById('tipo');
    const usernameInput = document.getElementById('username');
    const form = document.getElementById('form');

    let ingredientesDisponibles = []; // Array para almacenar los ingredientes

    // Cargar todos los ingredientes al iniciar la página
    async function obtenerIngredientes() {
        try {
            const response = await fetch(`${apiUrl}/list.php?i=list`);
            const data = await response.json();
            if (data.drinks) {
                ingredientesDisponibles = data.drinks.map(drink => drink.strIngredient1.toLowerCase());
            }
        } catch (error) {
            console.error('Error al obtener la lista de ingredientes:', error);
        }
    }

    // Llamar a la función para obtener los ingredientes al cargar la página
    await obtenerIngredientes();

    // Restablecer el formulario completo al cargar la página
    form.reset();
    tipoSelect.value = ""; // Reiniciar el select a la opción por defecto

    // Desactivar los otros campos cuando uno está en uso
    function bloquearOtrosCampos(campo) {
        inputIngrediente.disabled = campo !== inputIngrediente;
        tipoSelect.disabled = campo !== tipoSelect;
        usernameInput.disabled = campo !== usernameInput;
    }

    // Habilitar todos los campos
    function habilitarTodosLosCampos() {
        inputIngrediente.disabled = false;
        tipoSelect.disabled = false;
        usernameInput.disabled = false;
    }

    // Monitorear el input de ingrediente
    inputIngrediente.addEventListener('input', function () {
        const query = inputIngrediente.value.toLowerCase();

        // Limpia las sugerencias anteriores
        suggestionsListIngrediente.innerHTML = '';

        if (query.length) {
            bloquearOtrosCampos(inputIngrediente);

            // Filtrar la lista de ingredientes que contienen la consulta ingresada
            const sugerenciasFiltradas = ingredientesDisponibles.filter(ingrediente =>
                ingrediente.includes(query)
            );

            // Mostrar las sugerencias filtradas
            sugerenciasFiltradas.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient; // Muestra el nombre del ingrediente
                li.addEventListener('click', function () {
                    inputIngrediente.value = ingredient; // Asigna el ingrediente seleccionado
                    suggestionsListIngrediente.innerHTML = ''; // Limpia las sugerencias
                });
                suggestionsListIngrediente.appendChild(li);
            });
        } else {
            habilitarTodosLosCampos();
        }
    });

    // Monitorear el input de nombre
    usernameInput.addEventListener('input', async function () {
        const query = usernameInput.value.toLowerCase();

        // Limpia las sugerencias anteriores
        suggestionsListIngrediente.innerHTML = '';

        if (query.length) {
            bloquearOtrosCampos(usernameInput);
            try {
                const response = await fetch(`${apiUrl}/search.php?s=${query}`);
                const data = await response.json();

                if (data.drinks) {
                    // Muestra las sugerencias basadas en la búsqueda de nombres de cócteles
                    data.drinks.forEach(drink => {
                        const li = document.createElement('li');
                        li.textContent = drink.strDrink; // Muestra el nombre del cóctel
                        li.addEventListener('click', function () {
                            usernameInput.value = drink.strDrink; // Asigna el nombre seleccionado
                            suggestionsListIngrediente.innerHTML = ''; // Limpia las sugerencias
                        });
                        suggestionsListIngrediente.appendChild(li);
                    });
                }
            } catch (error) {
                console.error('Error al buscar sugerencias de cócteles:', error);
            }
        } else {
            habilitarTodosLosCampos();
        }
    });

    // Monitorear el cambio en el select de tipo
    tipoSelect.addEventListener('change', function () {
        if (tipoSelect.value) {
            bloquearOtrosCampos(tipoSelect);
        } else {
            habilitarTodosLosCampos();
        }
    });

    // Escucha el evento submit del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar que se recargue la página

        const ingrediente = inputIngrediente.value;
        const tipo = tipoSelect.value;
        const nombre = usernameInput.value;

        // Prioriza el campo de ingredientes si tiene un valor
        if (ingrediente) {
            buscarCoctelesPorIngrediente(ingrediente);
        }
        // Si no hay ingrediente, busca por tipo
        else if (tipo) {
            const tipoBusqueda = tipo === '1' ? 'Alcoholic' : (tipo === '2' ? 'Non_Alcoholic' : 'Optional_Alcohol');
            buscarCoctelesPorTipo(tipoBusqueda);
        }
        // Si no hay ingrediente ni tipo, busca por nombre
        else if (nombre) {
            buscarCoctelesPorNombre(nombre);
        } else {
            alert('Por favor, ingresa un ingrediente, tipo o nombre de cóctel.');
        }
    });

    // Las funciones de búsqueda siguen siendo las mismas, llamando a la API original
    async function buscarCoctelesPorIngrediente(ingredient) {
        try {
            const response = await fetch(`${apiUrl}/filter.php?i=${ingredient}`);
            const data = await response.json();

            if (data.drinks) {
                guardarResultados(data.drinks);
                redirigirAPaginaDeResultados();
            } else {
                alert(`No hay bebidas con el ingrediente: ${ingredient}`);
            }
        } catch (error) {
            console.error('Error al buscar cócteles por ingrediente:', error);
            alert('Ocurrió un error al buscar los cócteles.');
        }
    }

    async function buscarCoctelesPorTipo(tipo) {
        try {
            const response = await fetch(`${apiUrl}/filter.php?a=${tipo}`);
            const data = await response.json();

            if (data.drinks) {
                guardarResultados(data.drinks);
                redirigirAPaginaDeResultados();
            } else {
                alert(`No hay bebidas de tipo: ${tipo === 'Alcoholic' ? 'Alcohólico' : (tipo === 'No_Alcoholic' ? 'No Alcoholico' : 'Alcohol Opcional')}`);
            }
        } catch (error) {
            console.error('Error al buscar por tipo:', error);
            alert('Ocurrió un error al buscar los cócteles.');
        }
    }

    async function buscarCoctelesPorNombre(nombre) {
        try {
            const response = await fetch(`${apiUrl}/search.php?s=${nombre}`);
            const data = await response.json();

            if (data.drinks) {
                guardarResultados(data.drinks);
                redirigirAPaginaDeResultados();
            } else {
                alert(`No se encontraron cócteles con el nombre: ${nombre}`);
            }
        } catch (error) {
            console.error('Error al buscar cócteles por nombre:', error);
            alert('Ocurrió un error al buscar los cócteles.');
        }
    }

    function guardarResultados(drinks) {
        localStorage.setItem('drinks', JSON.stringify(drinks));
    }

    function redirigirAPaginaDeResultados() {
        window.location.href = './productos.html';
    }
});
