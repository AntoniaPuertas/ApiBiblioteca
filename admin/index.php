<?php
    //todo comprobar si el usuario está logueado
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de control</title>
    <link rel="stylesheet" href="css/estilos.css">
</head>
<body>
    <div class="container">
    <h1>Panel de control</h1>
    <div class="panelCrear">
        <button id="crear" class="btn-crear">Crear nuevo libro</button>
    </div>
    <!-- enctype="multipart/form-data" se utiliza cuando queremos subir archivos -->
    <form action="#" enctype="multipart/form-data">
        <label for="titulo">Título</label>
        <input type="text" id="titulo" name="titulo">

        <label for="autor">Autor</label>
        <input type="text" id="autor" name="autor">

        <label for="genero">Genero</label>
        <input type="text" id="genero" name="genero">

        <label for="publicacion">Fecha de publicación</label>
        <input type="number" id="publicacion" name="publicacion">

        <label for="imagen">Imagen</label>
        <input type="file" id="imagen" name="imagen">

        <input type="checkbox" id="disponible" name="disponible">
        <label for="disponible">Disponible</label>

        <input type="checkbox" id="favorito" name="favorito">
        <label for="favorito">Favorito</label>

        <label for="resumen">Resumen</label>
        <textarea name="resumen" id="resumen" rows="6"></textarea>

        <button>Guardar libro</button>

    </form>
    <table class="tablaLibros" id="tablaLibros"></table>
    </div>
    <script src="js/funciones.js"></script>
</body>
</html>