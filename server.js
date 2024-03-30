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


// usando el driver de mongoDB

// var express = require('express');
const http = require('http')
const path = require('path'); 
const fs = require('fs')
const crypto = require('crypto');
// modulo que se encarga de analizar el cuerpo de la solicitud en un middleware(funcion intermedia ebtre la solicitud y la respuesta)

const {MongoClient} = require('mongodb');
const uri = 'mongodb://localhost:27017/'
const bodyParser = require('body-parser');
console.log(bodyParser);
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const qs = require('querystring')


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
            res.end(`<h1>${JSON.stringify({name, email, passwordCustom, phone})}</h1>`)
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
        if(req.url == '/style.css'){ 
            // archivo leible
            const data = fs.createReadStream('./public/style.css')
            // generando un conexion de tipo tuberia entre un proceso leible y escribible
            data.pipe(res)
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




/* var express = require('express');
var path = require('path'); 
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var crypto = require('crypto');



var app = express();
//enter the name of the database in the end 
var new_db = "mongodb://localhost:27017/database_name";

app.get('/',function(req,res){
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('/public/index.html');
}).listen(3000);

console.log("Server listening at : 3000");
app.use('/public', express.static(__dirname + '/public'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));



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



// Sign-up function starts here. . .
app.post('/sign_up' ,function(req,res){
	var name = req.body.name;
	var email= req.body.email;
	var pass = req.body.password;
		var phone = req.body.phone;
	var password = getHash( pass , phone ); 				

	
	var data = {
		"name":name,
		"email":email,
		"password": password, 
		"phone" : phone
	}
	
	mongo.connect(new_db , function(error , db){
		if (error){
			throw error;
		}
		console.log("connected to database successfully");
		//CREATING A COLLECTION IN MONGODB USING NODE.JS
		db.collection("details").insertOne(data, (err , collection) => {
			if(err) throw err;
			console.log("Record inserted successfully");
			console.log(collection);
		});
	});
	
	console.log("DATA is " + JSON.stringify(data) );
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('/public/success.html');  

}); */

