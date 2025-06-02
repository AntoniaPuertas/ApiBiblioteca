//crear evento para que se ejecute el código cuando haya terminado de cargarse el DOM
document.addEventListener('DOMContentLoaded', () => {
    const url = 'http://localhost/ApiBiblioteca/api/libros';

    //realizo la llamada a la api para conseguir los datos
    fetch(url)
        .then(response => response.json())
        .then(data => mostrarLibros(data))
        .catch(error => console.error('Error:', error));
})

function mostrarLibros(datos){

    const libros = datos.data;
    console.log(libros)

    if(datos.success && datos.count > 0){
        //muestro los libros por pantalla
        document.getElementById('divLibros').innerHTML = 
        libros.map(libro => `
            <div class="libroCard" draggable="true">
                <img src="img/peques/${libro.imagen}" />
                <p>${libro.titulo}</p>
            </div>
            `).join(' ')


    }else if(datos.count == 0){
        document.getElementById('divLibros').innerHTML = "<p>No hay libros</p>";
    }
}