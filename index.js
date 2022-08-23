/* Paso 1: Crear un servidor con Express e importar el paquete express-fileupload. */
const express = require("express");
const app = express();
const fs = require("fs").promises;
/* Sólo sube archivos */
const expressFileUpload = require("express-fileupload");
app.listen(3000, () => {
  console.log("Server en http://localhost:3000");
});

/* Paso 2: Integrar el paquete express-fileupload con un middleware, definiendo 5MB como límite del peso de las canciones. Agrega un mensaje que indique que el límite fue superado.  y finalmente activando la creacion de carpeta sino existe */
app.use(
  expressFileUpload({
    limits: { fileSize: 5_000_000 },
    abortOnLimit: true,
    responseOnLimit:
      "El limite especificado ha sido excedido.... Intente de nuevo",
    createParentPath: true,
  })
);

// middleware para definir public como una carpeta publica para archivos estaticos
app.use(express.static("public"));

// ruta raiz despliega el html que contiene el formulario
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/formulario.html");
});

// ruta /collage para desplegar el html que contiene el collage de fotos
app.get("/collage", (req, res) => {
  res.sendFile(__dirname + "/public/collage.html");
});

/* Paso 4: Crear una ruta POST /imagen, que almacene el archivo recibido dentro de una
carpeta "imgs", con un nombre compuesto por la concatenación imagen-<posicion>.jpg. */

app.post("/imagen", (req, res) => {
  try {
    console.log("Files: ", req.files);
    console.log("Body: ", req.body);
    const { target_file } = req.files;
    const { posicion } = req.body;
    //const name = `${nombre} - ${artista} (${album})`;
    target_file.mv(`${__dirname}/public/imgs/imagen-${posicion}.jpg`, (err) => {
      if (err) {
        res.status(500).send(err); // en caso de error
      }
      res.redirect("/collage"); // redirecciona a collage.html sino hay error
    });
  } catch (err) {
    res.status(500).send("Algo salió mal en la carga de la imagen...");
  }
});
/* Crear una ruta DELETE /imagen/:nombre que reciba como parámetro el nombre de
una imagen y la elimine de la carpeta en donde están siendo alojadas las imágenes.
Considerar que esta interacción se ejecuta al hacer click en alguno de los números
del collage. (2 Puntos) */

app.delete("/imagen/:nombre", async (req, res) => {
  try {
      const { nombre } = req.params;
      console.log(nombre)
      // FileSystem => require("fs").promises
      // unlink => primer parametro => path
      // await fs.unlink(ruta del archivo a eliminar);
      await fs.unlink(`${__dirname}/public/imgs/${nombre}`);
      res.redirect("/collage");
      /* res.send(`La imagen ${nombre} fue eliminada con éxito`); */
      
  } catch (error) {
      res.status(500).send("La imagen no fue encontrada");
  }
});