# Aplicación Web Veterinaria 
  Una aplicación frontend moderna construida con **React**, **TypeScript** y **Vite**, diseñada para gestionar citas y pacientes de una clínica veterinaria.

## Inicio Rápido: Guía de Instalación
  Lista de pasos para configurar y ejecutar el proyecto.

### Paso 1: Instalación de Dependencias del Proyecto
  Abre tu terminal en la carpeta raíz del proyecto y ejecuta:
  ```bash
  npm install 
  ```
### Paso 2: Instalando JSON Server 
  Es necesario json-server para simular la API que proveerá los datos al frontend. Instalar json-server.
  ```bash
  npm install json-server
  ```

### Paso 3: Iniciando el Servidor de Datos
  Abre una nueva ventana de terminal y ejecuta el servidor de datos, que leerá la información de db.json:
  ```bash
  json-server --watch db.json --port 3001
  ```

### Paso 4: Iniciando el Servidor de Desarrollo
  Volver a la primera terminal y ejecuta el frontend:
  ```bash
  npm run dev
  ``` 
  URL del Frontend: http://localhost:5173

## Tecnologías Clave
  Frontend Principal: React
  Lenguaje: TypeScript
  Empaquetador/Servidor: Vite
  API Mock: JSON Server

## Estructura del Proyecto
  src/: Contiene todo el código fuente de React.
  src/components/: Componentes reutilizables.
  src/pages/: Vistas principales o rutas.
  db.json: El archivo que actúa como base de datos, utilizado por JSON Server.