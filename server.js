//  aqui recibiremos la informacion del fronteEnd

/* Nuestro backend realizará las siguientes operaciones:
   -Recibir los valores del frontend.
   -Realizar el hash de la contraseña utilizando HMAC donde está el algoritmo que estamos usando sha512 y la clave es la phone variable proporcionada por el usuario.
   -Estableciendo una conexión con MongoDB .
   -Creando una base de datos. El nombre de la base de datos se pasa aquí: 
   const new_db = "mongodb://localhost:27017/database_name";
   -Creando una colección. El nombre de la colección se pasa aquí
   db.collection("details")
   -Almacenar los datos recibidos desde el frontend en la base de datos mongodb.
   -Una vez que los datos se almacenen correctamente, redirija al usuario a la success.html página.
*/


const http = require('http')
const path = require('path'); 
const fs = require('fs')
const crypto = require('crypto');
const {MongoClient} = require('mongodb');
const uri = 'mongodb://localhost:27017/'
const qs = require('querystring')
// modulo que analiza el los datos de solicitud entrante en un middleware
const bodyParser = require('body-parser');
console.log(bodyParser);
const urlencodedParser = bodyParser.urlencoded({ extended: false });


const client = new MongoClient(uri)

async function insertUserToDB(userObject) {
    try{
        await client.connect()
        const db = client.db('loguin')
        const coll = db.collection('users')
        const result = await coll.insertOne(userObject)
        console.log(result.insertedId);
    }
    catch(err){
        console.log(err);
    }
    finally {
        await client.close()
    }
}


const server = http.createServer((req, res) => {
   // console.log(req.url);
    console.log(req.method);
    if(req.method === 'POST') {
        // decodificando los datos del formulario con el modulo querystring nativo de node js
        let body = ''
        req.on('data', (chunk) => {
            body+=chunk
        })
        req.on('end', () => {
            const {name, email, password, phone } = qs.parse(body)
            const passwordCustom =  getHash(password, phone)
            const dataToSendDb = {name, email, phone, passwordCustom}
            console.log(dataToSendDb);
            // una vez tengamos que recojimos los datos del formulario, parseamos esos
            // datos y creamos una contraseña segura, solo queda enviar dichos datos
            // a la DB
            // enviando datos a la DB
            insertUserToDB(dataToSendDb)
            res.writeHead(302, { 'Location': '/success.html' });
            res.end();
        })

         // decodificando los datos del formulario con body-Parser modulo externo 
        /* urlencodedParser(req, res, () => {
            const formData = req.body;
            console.log(formData);
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.end(` ${JSON.stringify(formData)}`);
        }) */
    }
    else if(req.method === 'GET'){
        if(req.url == '/') {
            const data = fs.createReadStream('./public/index.html', 'utf-8')
            data.pipe(res)
            data.on('end', () => {
            console.log('data received');
           })
    
        }
        else if(req.url == '/style.css'){ 
            // archivo leible
            const data = fs.createReadStream('./public/style.css')
            // generando un conexion de tipo tuberia entre un proceso leible y escribible
            data.pipe(res)
        }
        else if (req.url == '/success.html') {
            const data = fs.createReadStream('./public/success.html', 'utf-8');
            data.pipe(res);
        }
    }

})

server.listen(3000, () => console.log('listening in por 3000'))


/* función para realizar la operación HMAC en la contraseña y también usar el número de teléfono del usuario como clave: */

var getHash = ( pass , phone ) => {
				
    var hmac = crypto.createHmac('sha512', phone);
    
    //passing the data to be hashed
    data = hmac.update(pass);
    //Creating the hmac in the required format
    gen_hmac= data.digest('hex');
    //Printing the output on the console
    console.log("hmac : " + gen_hmac);
    return gen_hmac;
}


