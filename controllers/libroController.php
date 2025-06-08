<?php
//recibe los datos de una petición y devuelve una respuesta
class LibroController {
    private $libroDB;
    private $requestMethod;
    private $libroId;

    //el constructor recibe un objeto de la clase LibroDB
    //el método que se ha utilizado en la llamada: GET, POST, PUT o DELETE
    //un id de un libro que puede ser nulo
    public function __construct($db, $requestMethod, $libroId = null)
    {
        $this->libroDB = new LibroDB($db);
        $this->requestMethod = $requestMethod;
        $this->libroId = $libroId;
    }


    public function processRequest(){
        //comprobar si la petición ha sido realizada con GET, POST, PUT, DELETE
        switch($this->requestMethod){
            case 'GET':
                if($this->libroId){
                    //devolver un libro
                    $respuesta = $this->getLibro($this->libroId);
                }else{
                    //libroId es nulo y devuleve todos los libros
                    $respuesta = $this->getAllLibros();
                }
                break;
            case 'POST':
                //crear un nuevo libro
                $respuesta = $this->createLibro();
                break;
            case 'PUT':
                $respuesta = $this->updateLibro($this->libroId);
                break;
            case 'DELETE':
                $respuesta = $this->deleteLibro($this->libroId);
                break;
            default:
                $respuesta = $this->noEncontradoRespuesta();
                break;
        }

            header($respuesta['status_code_header']);
            if($respuesta['body']){
                echo $respuesta['body'];
            }
    }

    private function getAllLibros(){
        //conseguir todos los libros de la tabla libros
        $libros = $this->libroDB->getAll();

        //construir la respuesta
        $respuesta['status_code_header'] = 'HTTP/1.1 200 OK';
        $respuesta['body'] = json_encode([
            'success' => true,
            'data' => $libros,
            'count' => count($libros)
        ]);
        return $respuesta;
    }

    private function getLibro($id){
        //llamo a la función que devuelve un libro o null
        $libro = $this->libroDB->getById($id);
        //comprobar si $libro es null
        if(!$libro){
            return $this->noEncontradoRespuesta();
        }
        //hay libro
        //construir la respuesta
        $respuesta['status_code_header'] = 'HTTP/1.1 200 OK';
        $respuesta['body'] = json_encode([
            'success' => true,
            'data' => $libro
        ]);
        return $respuesta;
    }

    private function createLibro(){

        //ahora los datos vienen en el array $_POST
        $input = json_decode($_POST['datos'], true);

        if(!$this->validarDatos($input)){
           return $this->datosInvalidosRespuesta();
        }

        // Procesar imagen si existe
        $nombreImagen = '';
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            // Validar imagen
            $validacionImagen = $this->validarImagen($_FILES['imagen']);
            if (!$validacionImagen['valida']) {
                return $this->imagenInvalidaRespuesta($validacionImagen['mensaje']);
            }

            // Guardar imagen
            $nombreImagen = $this->guardarImagen($_FILES['imagen'], $input['titulo']);
            if (!$nombreImagen) {
                return $this->errorGuardarImagenRespuesta();
            }
        }

        // Añadir nombre de imagen a los datos
        if ($nombreImagen) {
            $input['imagen'] = $nombreImagen;
        }

        $libro = $this->libroDB->create($input);

        if(!$libro){
            return $this->internalServerError();
        }

        //libro creado 
        //construir la respuesta
        $respuesta['status_code_header'] = 'HTTP/1.1 201 Created';
        $respuesta['body'] = json_encode([
            'success' => true,
            'data' => $libro,
            'message' => 'Libro creado con exito'
        ]);
        return $respuesta;

    }

    private function updateLibro($id){
        $libro = $this->libroDB->getById($id);
        if(!$libro){
            return $this->noEncontradoRespuesta();
        }
        //el libro existe
        //leo los datos que llegan en el body de la  petición
        $input = json_decode(file_get_contents('php://input'),true);

        // if(!$this->validarDatos($input)){
        //     return $this->datosInvalidosRespuesta();
        // }

        //el libro existe y los datos que llegan son válidos
        $libroActualizado = $this->libroDB->update($this->libroId, $input);

        if(!$libroActualizado){
            return $this->internalServerError();
        }
        //el libro se ha actualizado con éxito
        //construyo la respuesta
        $respuesta['status_code_header'] = 'HTTP/1.1 200 OK';
        $respuesta['body'] = json_encode([
            'success' => true,
            'message' => 'Libro actualizado exitosamente',
            'data' => $libroActualizado
        ]);
        return $respuesta;

    }

    private function deleteLibro($id){
        $libro = $this->libroDB->getById($id);

        if(!$libro){
            return $this->noEncontradoRespuesta();
        }

        if($this->libroDB->delete($id)){
            //libro borrado
            //construir la respuesta
            $respuesta['status_code_header'] = 'HTTP/1.1 200 OK';
            $respuesta['body'] = json_encode([
                'success' => true,
                'message' => 'Libro eliminado'
            ]);
        return $respuesta;

        }else{
            return $this->internalServerError();
        }

    }//fin delete libro


    private function validarDatos($datos){
        if(!isset($datos['titulo']) || !isset($datos['autor'])){
            return false;
        }
        //validar que la fecha sea un número de 4 dígitos, mayor a 1000 y menor que el año que viene
        $anio = $datos['fecha_publicacion'];
        $anioActual = (int)date("Y");

        if(!is_numeric($anio) || strlen((string)$anio) !== 4 || $anio < 1000 || $anio > $anioActual + 1){
            return false;
        }

        return true;
    }

        /**
     * Valida que el archivo subido sea una imagen válida
     * @param array $archivo - Array de $_FILES
     * @return array - ['valida' => bool, 'mensaje' => string]
     */
    private function validarImagen($archivo) {
        // Verificar errores de subida
        if ($archivo['error'] !== UPLOAD_ERR_OK) {
            return ['valida' => false, 'mensaje' => 'Error al subir el archivo'];
        }

        // Verificar tamaño (1MB máximo)
        $tamañoMaximo = 1 * 1024 * 1024; // 1MB en bytes
        if ($archivo['size'] > $tamañoMaximo) {
            return ['valida' => false, 'mensaje' => 'La imagen no puede superar 1MB'];
        }

        // Verificar tipo MIME
        $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($archivo['type'], $tiposPermitidos)) {
            return ['valida' => false, 'mensaje' => 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'];
        }

        // Verificar extensión del archivo
        $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
        $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($extension, $extensionesPermitidas)) {
            return ['valida' => false, 'mensaje' => 'Extensión de archivo no permitida'];
        }

        // Verificar que sea realmente una imagen
        $infoImagen = getimagesize($archivo['tmp_name']);
        if ($infoImagen === false) {
            return ['valida' => false, 'mensaje' => 'El archivo no es una imagen válida'];
        }

        return ['valida' => true, 'mensaje' => ''];
    }

    /**
     * Guarda la imagen en el servidor con el nombre basado en el título del libro
     * @param array $archivo - Array de $_FILES
     * @param string $titulo - Título del libro
     * @return string|false - Nombre del archivo guardado o false si hay error
     */
    private function guardarImagen($archivo, $titulo) {
        // Limpiar el título para usarlo como nombre de archivo
        $nombreLimpio = $this->limpiarNombreArchivo($titulo);
        
        // Obtener extensión del archivo original
        $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
        
        // Crear nombre del archivo
        $nombreArchivo = $nombreLimpio . '.' . $extension;
        
        // Definir rutas
        $directorioDestino = '../img/peques/';
        $rutaCompleta = $directorioDestino . $nombreArchivo;
        
        // Crear directorio si no existe
        if (!file_exists($directorioDestino)) {
            mkdir($directorioDestino, 0755, true);
        }
        
        // Mover archivo subido
        if (move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
            return $nombreArchivo;
        }
        
        return false;
    }

    /**
     * Limpia el título para usarlo como nombre de archivo
     * @param string $titulo - Título del libro
     * @return string - Nombre limpio para archivo
     */
    private function limpiarNombreArchivo($titulo) {
        // Convertir a minúsculas
        $nombre = strtolower($titulo);
        
        // Reemplazar caracteres especiales y espacios
        $nombre = preg_replace('/[áàäâ]/u', 'a', $nombre);
        $nombre = preg_replace('/[éèëê]/u', 'e', $nombre);
        $nombre = preg_replace('/[íìïî]/u', 'i', $nombre);
        $nombre = preg_replace('/[óòöô]/u', 'o', $nombre);
        $nombre = preg_replace('/[úùüû]/u', 'u', $nombre);
        $nombre = preg_replace('/[ñ]/u', 'n', $nombre);
        $nombre = preg_replace('/[ç]/u', 'c', $nombre);
        
        // Reemplazar espacios y caracteres no alfanuméricos con guiones bajos
        $nombre = preg_replace('/[^a-z0-9]/i', '_', $nombre);
        
        // Eliminar guiones bajos múltiples
        $nombre = preg_replace('/_+/', '_', $nombre);
        
        // Eliminar guiones bajos al inicio y final
        $nombre = trim($nombre, '_');
        
        // Limitar longitud
        if (strlen($nombre) > 50) {
            $nombre = substr($nombre, 0, 50);
            $nombre = trim($nombre, '_');
        }
        
        return $nombre ?: 'libro_sin_titulo';
    }

    /**
     * Elimina una imagen del servidor
     * @param string $nombreArchivo - Nombre del archivo a eliminar
     */
    private function eliminarImagen($nombreArchivo) {
        if (empty($nombreArchivo)) return;
        
        $rutaArchivo = '../img/peques/' . $nombreArchivo;
        if (file_exists($rutaArchivo)) {
            unlink($rutaArchivo);
        }
    }



    private function noEncontradoRespuesta(){
        $respuesta['status_code_header'] = 'HTTP/1.1 404 Not Found';
        $respuesta['body'] = json_encode([
            'success' => false,
            'error' => 'Libro no encontrado'
        ]);
        return $respuesta;
    }

    private function datosInvalidosRespuesta(){
        $respuesta['status_code_header'] = 'HTTP/1.1 422 Unprocessable Entity';
        $respuesta['body'] = json_encode([
            'success' => false,
            'error' => 'Datos de entrada inválidos. Se requiere título y autor. La fecha tiene formato (YYYY)'
        ]);
        return $respuesta;
    }

    private function imagenInvalidaRespuesta($mensaje){
        $respuesta['status_code_header'] = 'HTTP/1.1 422 Unprocessable Entity';
        $respuesta['body'] = json_encode([
            'success' => false,
            'error' => 'Imagen inválida: ' . $mensaje
        ]);
        return $respuesta;
    }

    private function errorGuardarImagenRespuesta(){
        $respuesta['status_code_header'] = 'HTTP/1.1 500 Internal Server Error';
        $respuesta['body'] = json_encode([
            'success' => false,
            'error' => 'Error al guardar la imagen en el servidor'
        ]);
        return $respuesta;
    }

    private function internalServerError(){
        $respuesta['status_code_header'] = 'HTTP/1.1 500 Internal Server Error';
        $respuesta['body'] = json_encode([
            'success' => false,
            'error' => 'Error interno del servidor'
        ]);
        return $respuesta;
    }
}