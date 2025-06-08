const url = 'http://localhost/ApiBiblioteca/api/libros';

let libros = []; //Para almacenar los datos de los libros
let modoEdicion = false; // Para saber si estamos editando o creando
let libroEditandoId = null; // ID del libro que se está editando

document.addEventListener('DOMContentLoaded', () => {
    
    //realizo la llamada a la api para conseguir los datos
    fetch(url)
        .then(response => response.json())
        .then(data => mostrarLibros(data))
        .catch(error => console.error('Error:', error));

    document.getElementById("crear").addEventListener('click', () => {
        // si document.querySelector('form').style.display devuelve un valor vacío 
        // estado toma el segundo valor none
        const estado = document.querySelector('form').style.display || 'none';
        if(estado === 'none'){
            document.querySelector('form').style.display = 'grid'
            document.getElementById("crear").textContent = 'Ocultar formulario'
        }else{
            document.querySelector('form').style.display = 'none'
            document.getElementById("crear").textContent = 'Crear nuevo libro'
        }
        
    })

    document.querySelector('form').addEventListener('submit', enviarDatosNuevoLibro)
})

function mostrarLibros(datos){

    libros = datos.data;
    console.log(libros)

    if(datos.success && datos.count > 0){
        document.getElementById('tablaLibros').innerHTML = 
            "<tr class='cabeceras'>" +
            Object.keys(libros[0]).map(clave =>  
            `
                <td>${clave.toUpperCase()}</td>
                ${
                    clave == 'resumen' ? '<td class="centrado" colspan="2">Acciones</td>' : ''
                }
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
                <td>${(libro.imagen && libro.imagen.trim() !== '') ? `<img src="../img/peques/${libro.imagen}?${new Date().getTime()}" alt="${libro.titulo}" />` : 'Sin imagen'}</td>
                <td class="centrado">${(libro.disponible == 1) ? "Sí" : "No"}</td>
                <td class="centrado">${(libro.favorito == 1) ? "Sí" : "No"}</td>
                <td>${(libro.resumen !== null && libro.resumen.length > 0) ? libro.resumen.substring(0, 100)+"..." : ''}</td>
                <td>
                    <button onclick="editarLibro(${libro.id}, '${libro.titulo}')">Editar</button>
                </td>
                <td>
                    <button onclick="eliminarLibro(${libro.id}, '${libro.titulo}')" class="btn-delete">Eliminar</button>
                </td>
            </tr>
            `).join(' ')


    }else if(datos.count == 0){
        document.getElementById('divLibros').innerHTML = "<p>No hay libros</p>";
    }
}

function eliminarLibro(id, titulo){
    const confirma = confirm(`¿Seguro que quieres eliminar el libro: ${titulo}?`)

    if(!confirma){
        return
    }

    //El usuario ha confirmado que quiere eliminar el libro
    fetch(`${url}/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => libroEliminado(data))
        .catch(error => console.error('Error:', error));
}

function libroEliminado(data){
    if(data.success){
    fetch(url)
        .then(response => response.json())
        .then(data => mostrarLibros(data))
        .catch(error => console.error('Error:', error));
    }else{
        alert("Hubo un problema al eliminar el libro")
    }
}

function editarLibro(id, titulo){
        // Encontramos el libro en los datos que ya tenemos
    const libroAEditar = libros.find(l => l.id === id);
    
    if (libroAEditar) {
        rellenarFormularioEdicion(libroAEditar);
        mostrarFormularioEdicion(id);
    }
}

function enviarDatosNuevoLibro(e){
    e.preventDefault(); 

// Limpiar mensajes de error previos
    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const genero = document.getElementById("genero").value.trim();
    const publicacion = parseInt(document.getElementById("fecha_publicacion").value);
    const imagen = document.getElementById("imagen").files[0];
    const disponible = document.getElementById("disponible").checked;
    const favorito = document.getElementById("favorito").checked;
    const resumen = document.getElementById("resumen").value.trim();

    let errores = false;

    if (!titulo) {
        document.getElementById("error-titulo").textContent = "El título es obligatorio.";
        errores = true;
    }

    if (!autor) {
        document.getElementById("error-autor").textContent = "El autor es obligatorio.";
        errores = true;
    }

    const anioActual = new Date().getFullYear();
    if (isNaN(publicacion) || publicacion < 1000 || publicacion > anioActual + 1) {
        document.getElementById("error-publicacion").textContent = "La fecha de publicación debe ser un año válido (4 dígitos).";
        errores = true;
    }

    if (resumen.length > 1000) {
        document.getElementById("error-resumen").textContent = "El resumen no puede superar los 1000 caracteres.";
        errores = true;
    }

    const validacionImagen = validarImagen(imagen);
    if (!validacionImagen.esValido) {
        document.getElementById("error-imagen").textContent = validacionImagen.mensaje;
        errores = true;
    }

    if (errores) return; // Si hay errores, no enviar

    const datos = {
        titulo,
        autor,
        genero,
        fecha_publicacion: publicacion,
        disponible,
        favorito,
        resumen
    };

    const formData = new FormData();
    formData.append("datos", JSON.stringify(datos));
    if (imagen) {
        formData.append("imagen", imagen);
    }

    fetch(url, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("✅ Libro guardado con éxito.");
            document.querySelector("form").reset();
            document.querySelector("form").style.display = "none";
            document.getElementById("crear").textContent = 'Crear nuevo libro';
            return fetch(url);
        } else {
            throw new Error(data.error || "Error al guardar");
        }
    })
    .then(response => response.json())
    .then(data => mostrarLibros(data))
    .catch(error => {
        console.error("Error al enviar datos:", error);
        alert("❌ Error al guardar el libro");
    });

}


/**
 * Valida que el archivo sea una imagen válida y no exceda el tamaño máximo
 * @param {File} archivo - Archivo a validar
 * @param {number} tamañoMaximoMB - Tamaño máximo en MB (por defecto 1MB)
 * @returns {Object} - {esValido: boolean, mensaje: string}
 */
function validarImagen(archivo, tamañoMaximoMB = 1) {
    // Si no hay archivo, es válido (la imagen es opcional)
    if (!archivo) {
        return { esValido: true, mensaje: "" };
    }

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
        return { 
            esValido: false, 
            mensaje: "Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)." 
        };
    }

    // Validar tamaño (convertir MB a bytes)
    const tamañoMaximoBytes = tamañoMaximoMB * 1024 * 1024;
    if (archivo.size > tamañoMaximoBytes) {
        return { 
            esValido: false, 
            mensaje: `La imagen no puede superar los ${tamañoMaximoMB}MB. Tamaño actual: ${(archivo.size / (1024 * 1024)).toFixed(2)}MB.` 
        };
    }

    // Validar que el archivo tenga contenido
    if (archivo.size === 0) {
        return { 
            esValido: false, 
            mensaje: "El archivo de imagen está vacío." 
        };
    }

    return { esValido: true, mensaje: "" };
}