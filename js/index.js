document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1';
    const inputIngrediente = document.getElementById('ingredienteInput');
    const suggestionsList = document.getElementById('suggestionsList');
    const tipoSelect = document.getElementById('tipo');
    const usernameInput = document.getElementById('username');
    const form = document.getElementById('form');

    // Restablecer el formulario completo al cargar la página
    form.reset();

    // Restablecer el valor del select al cargar la página
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
        if (inputIngrediente.value.trim().length > 0) {
            bloquearOtrosCampos(inputIngrediente);
        } else {
            habilitarTodosLosCampos();
        }
    });

    // Monitorear el input de nombre
    usernameInput.addEventListener('input', async function () {
        const query = usernameInput.value.toLowerCase();

        // Limpia las sugerencias anteriores
        suggestionsList.innerHTML = '';

        if (query.length) {
            bloquearOtrosCampos(usernameInput);
            try {
                const response = await fetch(`${apiUrl}/search.php?s=${query}`);
                const data = await response.json();

                if (data.drinks) {
                    // Muestra las sugerencias basadas en la búsqueda
                    data.drinks.forEach(drink => {
                        const li = document.createElement('li');
                        li.textContent = drink.strDrink; // Muestra el nombre del cóctel
                        li.addEventListener('click', function () {
                            usernameInput.value = drink.strDrink; // Asigna el nombre seleccionado
                            suggestionsList.innerHTML = ''; // Limpia las sugerencias
                        });
                        suggestionsList.appendChild(li);
                    });
                }
            } catch (error) {
                console.error('Error al buscar sugerencias:', error);
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

    // Ocultar sugerencias cuando se hace clic fuera del input
    document.addEventListener('click', function (event) {
        if (event.target !== usernameInput) {
            suggestionsList.innerHTML = '';
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
            const tipoBusqueda = tipo === '1' ? 'Alcoholic' : 'Non_Alcoholic';
            buscarCoctelesPorTipo(tipoBusqueda);
        }
        // Si no hay ingrediente ni tipo, busca por nombre
        else if (nombre) {
            buscarCoctelesPorNombre(nombre);
        } else {
            alert('Por favor, ingresa un ingrediente, tipo o nombre de cóctel.');
        }
    });

    async function buscarCoctelesPorIngrediente(ingredient) {
        try {
            const response = await fetch(`${apiUrl}/filter.php?i=${ingredient}`);
    
            if (!response.ok) {
                throw new Error(`Error en la red: ${response.status}`);
            }
    
            const dataText = await response.text(); // Obtener la respuesta como texto primero
    
            if (!dataText) {
                alert(`No hay bebidas con el ingrediente: ${ingredient}`);
                return;
            }
    
            const data = JSON.parse(dataText); // Convertir a JSON
    
            if (!data.drinks || data.drinks.length === 0) {
                alert(`No hay bebidas con el ingrediente: ${ingredient}`);
            } else {
                guardarResultados(data.drinks);
                redirigirAPaginaDeResultados();
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

            if (data.drinks && data.drinks.length > 0) {
                guardarResultados(data.drinks);
                redirigirAPaginaDeResultados();
            } else {
                alert(`No hay bebidas de tipo: ${tipo === 'Alcoholic' ? 'Alcohólico' : 'No Alcohólico'}`);
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

            if (data.drinks && data.drinks.length > 0) {
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
        window.location.href = '../productos.html';
    }
});
