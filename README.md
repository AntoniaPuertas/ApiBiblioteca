# 📚 ApiBiblioteca - Sistema de Gestión de Biblioteca

Una API REST completa para la gestión de bibliotecas con panel de administración web. Permite crear, leer, actualizar y eliminar libros con soporte para imágenes de portada.

## ✨ Características principales

- 🔗 **API REST completa** con endpoints CRUD
- 🖼️ **Gestión de imágenes** con validación y optimización automática
- 🛡️ **Validación robusta** de datos en frontend y backend
- 📱 **Interfaz responsive** para administración
- 🗄️ **Base de datos MySQL** con arquitectura MVC
- 🎨 **Diseño moderno** con animaciones y efectos visuales
- 📋 **Formularios dinámicos** para crear y editar libros
- 🔍 **Vista pública** de la biblioteca

## 🏗️ Arquitectura del Proyecto

```
ApiBiblioteca/
├── 📁 api/                     # Punto de entrada de la API
│   └── index.php              # Router principal y configuración CORS
├── 📁 config/                  # Configuración de la aplicación
│   ├── database.php           # Clase de conexión a MySQL
│   ├── config.php             # Credenciales de BD (no incluido)
│   └── config_ejemplo.php     # Plantilla de configuración
├── 📁 controllers/             # Lógica de negocio
│   └── libroController.php    # Controlador de libros con CRUD completo
├── 📁 data/                    # Capa de acceso a datos
│   ├── libroDB.php            # Operaciones de base de datos
│   └── libros.txt             # Documentación y ejemplos SQL
├── 📁 admin/                   # Panel de administración
│   ├── index.php              # Interfaz de gestión de libros
│   ├── guardarLibro.php       # Procesamiento de formularios
│   ├── 📁 css/
│   │   └── estilos.css        # Estilos del panel admin
│   └── 📁 js/
│       └── funciones.js       # JavaScript para CRUD y validaciones
├── 📁 img/peques/              # Almacenamiento de imágenes de libros
├── 📁 css/                     # Estilos para vista pública
│   └── estilos.css
├── 📁 js/                      # JavaScript para vista pública
│   └── funciones.js
├── index.html                  # Vista pública de la biblioteca
├── .htaccess                   # Configuración de URLs amigables
└── .gitignore                  # Archivos excluidos del control de versiones
```

## 🛠️ Tecnologías utilizadas

### Backend
- **PHP 7.4+** - Lenguaje de programación servidor
- **MySQL** - Base de datos relacional
- **Architecture MVC** - Separación de responsabilidades
- **REST API** - Arquitectura de servicios web

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Grid y Flexbox
- **JavaScript ES6+** - Interactividad y llamadas asíncronas
- **Fetch API** - Comunicación con la API
- **FormData** - Manejo de archivos

## 🚀 Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ApiBiblioteca.git
cd ApiBiblioteca
```

### 2. Configurar la base de datos
```sql
-- Crear base de datos
CREATE DATABASE biblioteca;

-- Crear tabla libros
CREATE TABLE libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    genero VARCHAR(100),
    fecha_publicacion YEAR,
    imagen VARCHAR(255),
    disponible TINYINT(1) DEFAULT 1,
    favorito TINYINT(1) DEFAULT 0,
    resumen TEXT
);
```

### 3. Configurar credenciales
```php
// Copiar config_ejemplo.php a config.php
cp config/config_ejemplo.php config/config.php

// Editar config/config.php con tus credenciales
define('DB_HOST', 'localhost');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_password');
define('DB_NAME', 'biblioteca');
```

### 4. Configurar servidor web
```apache
# Asegurar que .htaccess esté habilitado
# El archivo ya incluye la configuración de URL rewriting
```

### 5. Crear directorio de imágenes
```bash
mkdir -p img/peques
chmod 755 img/peques
```

## 📖 Uso de la API

### Endpoints disponibles

| Método | URL | Descripción | Parámetros |
|--------|-----|-------------|------------|
| `GET` | `/api/libros` | Obtener todos los libros | - |
| `GET` | `/api/libros/{id}` | Obtener libro específico | `id`: ID del libro |
| `POST` | `/api/libros` | Crear nuevo libro | FormData con datos + imagen |
| `PUT` | `/api/libros/{id}` | Actualizar libro existente | FormData con datos + imagen |
| `DELETE` | `/api/libros/{id}` | Eliminar libro | `id`: ID del libro |

### Ejemplos de uso

#### Obtener todos los libros
```javascript
fetch('http://localhost/ApiBiblioteca/api/libros')
    .then(response => response.json())
    .then(data => console.log(data));

// Respuesta:
{
    "success": true,
    "data": [...],
    "count": 5
}
```

#### Crear un libro con imagen
```javascript
const formData = new FormData();
formData.append('datos', JSON.stringify({
    titulo: "El Quijote",
    autor: "Miguel de Cervantes",
    genero: "Novela",
    fecha_publicacion: 1605,
    disponible: true,
    favorito: false,
    resumen: "Las aventuras de Don Quijote..."
}));
formData.append('imagen', fileInput.files[0]);

fetch('http://localhost/ApiBiblioteca/api/libros', {
    method: 'POST',
    body: formData
});
```

#### Actualizar un libro (Method Spoofing)
```javascript
const formData = new FormData();
formData.append('_method', 'PUT'); // Method spoofing para archivos
formData.append('datos', JSON.stringify(datosActualizados));
formData.append('imagen', nuevaImagen); // Opcional

fetch('http://localhost/ApiBiblioteca/api/libros/1', {
    method: 'POST', // POST real para que PHP procese $_FILES
    body: formData
});
```

## 🎛️ Panel de administración

Accede al panel en `/admin/` para gestionar la biblioteca:

### Funcionalidades

#### 📝 Gestión de libros
- **Crear libros** con formulario validado
- **Editar libros** existentes con datos precargados
- **Eliminar libros** con confirmación
- **Subir imágenes** con validación automática

#### 🖼️ Gestión de imágenes
- **Validación de tipo**: Solo imágenes (JPEG, PNG, GIF, WebP)
- **Validación de tamaño**: Máximo 1MB
- **Nombres automáticos**: Basados en el título del libro
- **Reemplazo inteligente**: Una imagen por libro
- **Preview**: Muestra imagen actual al editar

#### ✅ Validaciones implementadas
- **Campos obligatorios**: Título y autor
- **Fecha de publicación**: Año válido de 4 dígitos
- **Límite de caracteres**: Resumen máximo 1000 caracteres
- **Imágenes**: Tipo, tamaño y contenido válido

### Vista de tabla
```
┌─────────────────────────────────────────────────────────────┐
│ ID │ Título │ Autor │ Género │ Año │ Imagen │ Disp │ Fav │   │
├─────────────────────────────────────────────────────────────┤
│ 1  │ El ... │ Cer.. │ Novel. │ 1605│   📷   │  Sí  │ No  │🔧❌│
│ 2  │ Cie... │ Gab.. │ Real.. │ 1967│Sin img │  Sí  │ Sí  │🔧❌│
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Características técnicas

### Seguridad
- **Validación dual**: Frontend y backend
- **Sanitización de nombres**: Archivos con nombres seguros
- **Validación de imágenes**: Verificación real del contenido
- **Control de errores**: Rollback automático en fallos

### Optimizaciones
- **Carga eficiente**: Datos locales para edición
- **Gestión de memoria**: Eliminación automática de archivos temporales
- **URLs amigables**: Configuración Apache incluida
- **Responsive design**: Adaptable a dispositivos móviles

### Patrones implementados
- **MVC**: Separación clara de responsabilidades
- **Method Spoofing**: Soporte para PUT con archivos
- **Form Validation**: Validación en tiempo real
- **Progressive Enhancement**: Funciona con y sin JavaScript

## 🗃️ Estructura de base de datos

### Tabla `libros`
```sql
Campo               | Tipo          | Nulo | Clave | Predeterminado
--------------------|---------------|------|-------|---------------
id                  | int(11)       | NO   | PRI   | NULL (AI)
titulo              | varchar(255)  | NO   |       | NULL
autor               | varchar(255)  | NO   |       | NULL
genero              | varchar(100)  | SÍ   |       | NULL
fecha_publicacion   | year(4)       | SÍ   |       | NULL
imagen              | varchar(255)  | SÍ   |       | NULL
disponible          | tinyint(1)    | SÍ   |       | 1
favorito            | tinyint(1)    | SÍ   |       | 0
resumen             | text          | SÍ   |       | NULL
```

## 🚦 Códigos de respuesta HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| `200 OK` | Éxito | GET, PUT, DELETE exitosos |
| `201 Created` | Creado | POST exitoso |
| `404 Not Found` | No encontrado | Libro inexistente o endpoint inválido |
| `422 Unprocessable Entity` | Datos inválidos | Validación fallida |
| `500 Internal Server Error` | Error del servidor | Fallo en BD o filesystem |


## 🙏 Agradecimientos

- Inspirado en mejores prácticas de APIs REST
- Diseño responsive moderno
- Patrones de validación robustos
- Comunidad PHP por las soluciones técnicas