<?php

//acepta peticiones desde cualquier origen
header("Access-Control-Allow-Origin: *");
//la respuesta la envía en json con el juego de caracteres utf8
header("Content-Type: application/json; charset=UTF-8");
//acepta las peticiones descritas: GET, POST...
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

//incluir los archivos de clases
//database contiene la clase Database que gestina la conexión con la base de datos
require_once '../config/database.php';
//libroDB contiene la clase LibroDB que realiza las consultas a la tabla libros
require_once '../data/libroDB.php';
//libroController contiene la clase LibroController recibe las peticiones de la tabla libros, las gestiona y devuelve las respuestas
require_once '../controllers/libroController.php';


//averiguar la URL
//la función parse_url elimina los parámetros de la url
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

//obtenemos el método utilizado en la llamada: GET POST PUT DELETE
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Quitar barra inicial y dividir en segmentos
//trim en este caso elimina las barras / al principio y al final
//explode divide un string en segmentos y devuelve un array con estos segmentos
//en este caso le  decimos que divida el string ApiBiblioteca/api/libros
$segments = explode('/', trim($requestUri, '/'));

//compruebo si la dirección es correcta
//si la dirección no es correcta responde not found y termina la ejecución
if($segments[1] !== 'api' || $segments[2] !== 'libros'){
    header('HTTP/1.1 404 Not Found');
    echo json_encode(['success' => false, 'error' => 'Endpoint no encontrado']);
    exit();
}
//variable para guardar el id del libro solicitado
$libroId = null;

//si viene el id en la dirección lo guardo convierto a entero en $libroId 
if(isset($segments[3])){
    $libroId = (int)$segments[3];
}


//ya tenemos todos los datos necesarios para procesar la petición

//inicio la base de datos
//se establece la conexión
$database = new Database();

//crea una instancia de LibroController
$controller = new LibroController($database, $requestMethod, $libroId);

//procesar la petición
$controller->processRequest($libroId);

//cerrar la conexión
$database->close();


