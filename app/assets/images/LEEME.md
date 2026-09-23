# Imágenes de origen

Aquí viven los **originales**: los archivos que entrega Inmobarco antes de
recortar, comprimir o derivar. No se sirven al navegador. Vite solo empaqueta lo
que se importa, así que un archivo que esté solo aquí no engorda el despliegue.

- `banner.jpeg` — foto original del hero, con el logo incrustado en una banda
  diagonal a la izquierda. De ella sale `public/hero-home.jpg`, que es el mismo
  encuadre sin esa banda:

  ```
  sharp('app/assets/images/banner.jpeg')
    .extract({ left: 540, top: 0, width: 1060, height: 900 })
  ```

Lo que el sitio sirve va en `public/`, porque `@nuxt/image` lo procesa por URL en
tiempo de ejecución. La excepción son las fotos de `zonas/`, que sí se resuelven
al construir con `import.meta.glob`.
