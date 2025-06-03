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
        document.getElementById('tablaLibros').innerHTML = 
            "<tr>" +
            Object.keys(libros[0]).map(clave =>  
            `
                <td>${clave}</td>
            `
            ).join('')
            + "</tr>"

        document.getElementById('tablaLibros').innerHTML += 
        libros.map(libro => `
            <tr>
                <td>${libro.id}</td>
                <td>${libro.titulo}</td>
                <td>${libro.autor}</td>
                <td>${libro.genero}</td>
                <td>${libro.fecha_publicacion}</td>
                <td>${libro.imagen}</td>
                <td>${(libro.disponible == 1) ? "Sí" : "No"}</td>
                <td>${(libro.favorito == 1) ? "Sí" : "No"}</td>
                <td>${(libro.resumen !== null && libro.resumen.length > 0) ? libro.resumen.substring(0, 100)+"..." : ''}</td>
            </tr>
            `).join(' ')


    }else if(datos.count == 0){
        document.getElementById('divLibros').innerHTML = "<p>No hay libros</p>";
    }
}