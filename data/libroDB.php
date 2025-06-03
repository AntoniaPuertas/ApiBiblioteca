<?php
/**
 * Se encarga de interactuar con la base de datos con la tabla libros
 */
class LibroDB {

    private $db;
    private $table = 'libros';
    //recibe una conexión ($database) a una base de datos y la mete en $db
    public function __construct($database){
        $this->db = $database->getConexion();
    }

    //extrae todos los datos de la tabla $table
    public  function getAll(){
        //construye la consulta
        $sql = "SELECT * FROM {$this->table}";

        //realiza la consulta con la función query()
        $resultado = $this->db->query($sql);

        //comprueba si hay respuesta ($resultado) y si la respuesta viene con datos
        if($resultado && $resultado->num_rows > 0){
            //crea un array para guardar los datos
            $libros = [];
            //en cada vuelta obtengo un array asociativo con los datos de una fila y lo guardo en la variable $row
            //cuando ya no quedan filas que recorrer termina el bucle
            while($row = $resultado->fetch_assoc()){
                //al array libros le añado $row 
                $libros[] = $row;
            }
            //devolvemos el resultado
            return $libros;
        }else{
            //no hay datos, devolvemos un array vacío
            return [];
        }
        
    }

    public function getById($id){
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        if($stmt){
            //añado un parámetro a la consulta
            //este va en el lugar de la ? en la variable $sql
            //"i" es para asegurarnos de que el parámetro es un número entero
            $stmt->bind_param("i", $id);
            //ejecuta la consulta
            $stmt->execute();
            //lee el resultado de la consulta
            $result = $stmt->get_result();

            //comprueba si en el resultado hay datos o está vacío
            if($result->num_rows > 0){
                //devuelve un array asociativo con los datos
                return $result->fetch_assoc();
            }
            //cierra 
            $stmt->close();
        }
        //algo falló
        return null;
    }

    //Crear un nuevo libro
    public function create($data){
  
        $sql = "INSERT INTO {$this->table} (titulo, autor, genero, fecha_publicacion, disponible, imagen, favorito, resumen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        if($stmt){
            //comprobar los datos opcionales
            $genero = isset($data['genero']) ? $data['genero'] : '';
            $fecha_publicacion = isset($data['fecha_publicacion']) ? $data['fecha_publicacion'] : null;
            $disponible = isset($data['disponible']) ? (int)(bool)$data['disponible'] : 1;
            $imagen = isset($data['imagen']) ? $data['imagen'] : '';
            $favorito = isset($data['favorito']) ? (int)(bool)$data['favorito'] : 0;
            $resumen = isset($data['resumen']) ? $data['resumen'] : '';

            $stmt->bind_param(
                "sssiisis",
                $data['titulo'],
                $data['autor'],
                $genero,
                $fecha_publicacion,
                $disponible,
                $imagen,
                $favorito,
                $resumen
            );

            if($stmt->execute()){
                //obtengo el id del libro que se acaba de crear
                $id = $this->db->insert_id;
                $stmt->close();
                //devuelve todos los datos del libro que acabamos de crear
                return $this->getById($id);
            }
            $stmt->close();
        }
        return false;
    }

    //actualizar libro
    public function update($id, $data){

               $sql = "UPDATE {$this->table} SET
                titulo = ?,
                autor = ?,
                genero = ?,
                fecha_publicacion = ?,
                disponible = ?,
                imagen = ?,
                favorito = ?,
                resumen = ?
                WHERE id = ?
               ";

        //Leer los datos actuales
        $libro = $this->getById($id);
        if(!$libro){
            return false;
        }

        $titulo = isset($data['titulo']) ? $data['titulo'] : $libro['titulo'];
        $autor = isset($data['autor']) ? $data['autor'] : $libro['autor'];
        $genero = isset($data['genero']) ? $data['genero'] : $libro['genero'];
        $fecha_publicacion = isset($data['fecha_publicacion']) ? $data['fecha_publicacion'] : $libro['fecha_publicacion'];
        $disponible = isset($data['disponible']) ? (int)(bool)$data['disponible'] : $libro['disponible'];
        $imagen = isset($data['imagen']) ? $data['imagen'] : $libro['imagen'];
        $favorito = isset($data['favorito']) ? (int)(bool)$data['favorito'] : $libro['favorito'];
        $resumen = isset($data['resumen']) ? $data['resumen'] : $libro['resumen'];

        $stmt = $this->db->prepare($sql);
        if($stmt){   
            $stmt->bind_param(
                "sssiisisi",
                $titulo,
                $autor,
                $genero,
                $fecha_publicacion,
                $disponible,
                $imagen,
                $favorito,
                $resumen,
                $id
            );

            if($stmt->execute()){
                $stmt->close();
                //devuelve todos los datos del libro que acabamos de modificar
                return $this->getById($id);
            }
            $stmt->close();
        }
        return false; 
    }

    //eliminar un libro
    public function delete($id){
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        if($stmt){
            $stmt->bind_param("i", $id);
            $result = $stmt->execute();
            $stmt->close();
            return $result;
        }
        return false;

    }

}