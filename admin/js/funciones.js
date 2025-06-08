const url = 'http://localhost/ApiBiblioteca/api/libros';
let librosData = []; // Variable global para almacenar los datos de los libros
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
            // Si estamos en modo edición, resetear a modo creación
            if (modoEdicion) {
                resetearModoCreacion();
            }
            document.querySelector('form').style.display = 'grid'
            document.getElementById("crear").textContent = 'Ocultar formulario'
        }else{
            document.querySelector('form').style.display = 'none'
            document.getElementById("crear").textContent = 'Crear nuevo libro'
            // Resetear modo si estaba editando
            if (modoEdicion) {
                resetearModoCreacion();
            }
        }
    })

    document.querySelector('form').addEventListener('submit', enviarDatosLibro)
})

function mostrarLibros(datos){

    const libros = datos.data;
    librosData = libros; // Guardamos los datos para reutilizar
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
                    <button onclick="editarLibro(${libro.id})">Editar</button>
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

function editarLibro(id){
    // Encontrar el libro en los datos que ya tenemos
    const libro = librosData.find(l => l.id == id);
    
    if (libro) {
        // Activar modo edición
        modoEdicion = true;
        libroEditandoId = id;
        
        // Rellenar formulario con datos existentes
        rellenarFormularioEdicion(libro);
        
        // Mostrar formulario en modo edición
        mostrarFormularioEdicion();
    } else {
        alert("Error: No se encontraron los datos del libro");
    }
}

/**
 * Rellena el formulario con los datos del libro a editar
 * @param {Object} libro - Datos del libro
 */
function rellenarFormularioEdicion(libro) {
    document.getElementById("titulo").value = libro.titulo || '';
    document.getElementById("autor").value = libro.autor || '';
    document.getElementById("genero").value = libro.genero || '';
    document.getElementById("fecha_publicacion").value = libro.fecha_publicacion || '';
    document.getElementById("disponible").checked = libro.disponible == 1;
    document.getElementById("favorito").checked = libro.favorito == 1;
    document.getElementById("resumen").value = libro.resumen || '';
    
    // Limpiar el campo de imagen (no podemos prellenar un input file)
    document.getElementById("imagen").value = '';
    
    // Mostrar imagen actual si existe
    mostrarImagenActual(libro.imagen, libro.titulo);
}

/**
 * Muestra el formulario en modo edición
 */
function mostrarFormularioEdicion() {
    // Mostrar formulario
    document.querySelector('form').style.display = 'grid';
    
    // Cambiar textos para modo edición
    document.querySelector('form h2').textContent = '✏️ Editar Libro';
    document.getElementById('btnGuardar').textContent = 'Actualizar libro';
    document.getElementById("crear").textContent = 'Ocultar formulario';
}

/**
 * Muestra la imagen actual del libro si existe
 * @param {string} imagen - Nombre del archivo de imagen
 * @param {string} titulo - Título del libro
 */
function mostrarImagenActual(imagen, titulo) {
    // Eliminar imagen previa si existe
    const imagenPrevia = document.getElementById('imagen-actual');
    if (imagenPrevia) {
        imagenPrevia.remove();
    }
    
    if (imagen && imagen.trim() !== '') {
        // Crear elemento para mostrar imagen actual
        const divImagen = document.createElement('div');
        divImagen.id = 'imagen-actual';
        divImagen.innerHTML = `
            <p><strong>Imagen actual:</strong></p>
            <img src="../img/peques/${imagen}?${new Date().getTime()}" 
                 alt="${titulo}" 
                 style="max-width: 100px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 12px; color: #666;">Selecciona una nueva imagen para reemplazarla</p>
        `;
        
        // Insertar después del input de imagen
        const inputImagen = document.getElementById('imagen');
        inputImagen.parentNode.insertBefore(divImagen, inputImagen.nextSibling);
    }
}

/**
 * Resetea el formulario a modo creación
 */
function resetearModoCreacion() {
    modoEdicion = false;
    libroEditandoId = null;
    
    // Restaurar textos originales
    document.querySelector('form h2').textContent = '📚 Nuevo Libro';
    document.getElementById('btnGuardar').textContent = 'Guardar libro';
    
    // Eliminar imagen actual si existe
    const imagenPrevia = document.getElementById('imagen-actual');
    if (imagenPrevia) {
        imagenPrevia.remove();
    }
    
    // Limpiar formulario
    document.querySelector("form").reset();
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

function enviarDatosLibro(e){
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

    // Validaciones existentes
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

    // Validación de imagen (solo si se seleccionó una nueva)
    if (imagen) {
        const validacionImagen = validarImagen(imagen);
        if (!validacionImagen.esValido) {
            // Crear elemento de error para imagen si no existe
            let errorImagen = document.getElementById("error-imagen");
            if (!errorImagen) {
                errorImagen = document.createElement("small");
                errorImagen.id = "error-imagen";
                errorImagen.className = "error";
                document.getElementById("imagen").parentNode.appendChild(errorImagen);
            }
            errorImagen.textContent = validacionImagen.mensaje;
            errores = true;
        }
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

    // Determinar si es creación o edición
    const metodo = "POST"; // Siempre POST para que PHP procese $_FILES
    const urlPeticion = modoEdicion ? `${url}/${libroEditandoId}` : url;
    const mensajeExito = modoEdicion ? "✅ Libro actualizado con éxito." : "✅ Libro guardado con éxito.";

    // Si es edición, añadir _method para spoofing
    if (modoEdicion) {
        formData.append("_method", "PUT");
    }

    fetch(urlPeticion, {
        method: metodo,
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(mensajeExito);
            document.querySelector("form").reset();
            document.querySelector("form").style.display = "none";
            document.getElementById("crear").textContent = 'Crear nuevo libro';
            
            // Resetear modo edición
            resetearModoCreacion();
            
            return fetch(url);
        } else {
            throw new Error(data.error || "Error al guardar");
        }
    })
    .then(response => response.json())
    .then(data => mostrarLibros(data))
    .catch(error => {
        console.error("Error al enviar datos:", error);
        const accion = modoEdicion ? "actualizar" : "guardar";
        alert(`❌ Error al ${accion} el libro`);
    });
}