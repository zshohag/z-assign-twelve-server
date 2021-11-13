const  express = require('express')
const { MongoClient } = require('mongodb');

const ObjectId = require('mongodb').ObjectId

const bodyParser = require("body-parser")

const cors = require('cors');
const { urlencoded } = require('body-parser');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;


// middlewire

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdjev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)


async function run() {
    try {
      await client.connect();
      console.log('Database Connected')
      const database = client.db("fly_go");
      const dronesCollection = database.collection("drones");
      const orderCollection = database.collection('orders')
      const usersCollection = database.collection('users')
      const reviewCollection = database.collection('review')



      // GET ALL ORDER 

      app.get("/orders", async (req, res) => {
        const result = await orderCollection.find({}).toArray();
        res.send(result);
      });
     
      //GET ALL DRONES  

        app.get('/drones' , async(req,res)=> {

        const cursor = dronesCollection.find({})
        const drones = await cursor.toArray()
        res.send(drones)
      })


     // GET SINGLE DRONE ITEM USING GET 

           app.get('/drones/:id' , async (req,res) => {
             
            const id = req.params.id
            console.log(' Getting Specific Service ' ,id)
            const query = {_id : ObjectId(id) }
            const drone = await dronesCollection.findOne(query)
            res.json(drone)
       })


   
      //  ORDER POST 

      app.post('/order', async (req,res)=> {

          const drone = req.body
          const result =  await orderCollection.insertOne(drone)
          console.log(result)
          res.json(result)
        
      });

       // GET  ORDER BY SINGLE USER USING EMAIL 

        app.get("/orders/:email", async (req, res) => {
          const result = await orderCollection.find({
            email: req.params.email,
          }).toArray();

          res.send(result);
        });
  


        // DELETE ORDER 
       
        app.delete('/orders/:id' , async(req,res)=> {

          const id =  req.params.id 
          console.log(id)
          const query = {_id : ObjectId(id)}
          const result = await orderCollection.deleteOne(query)
          console.log('deleting item with id  ',id)
          res.json(result)
        })



      // GET ALL USER 
        app.get('/users' , async(req,res)=> {
          const cursor = usersCollection.find({})
          const result = await cursor.toArray()
          res.send(result)
      })
  
      // USER POST 

           app.post('/users', async (req,res)=> {

              const user = req.body
              const result =  await usersCollection.insertOne(user)
              res.json(result)
            
          });
    

      // POST A NEW DRONE 
      app.post('/drones', async (req,res)=> {

        const drone = req.body
        const result =  await dronesCollection.insertOne(drone)
        console.log(result)
        res.json(result)
      
      });


     // REVIEW POST 
         
        app.post("/review", async (req, res) => {
          const result = await reviewCollection.insertOne(req.body);
          res.send(result);
        });



        // ADMIN SET 

        app.get('/users/:email', async(req,res)=> {
          const email = req.params.email
          const query = {email: email }
          const user =  await usersCollection.findOne(query)
 
          let isAdmin =  false
 
          if(user?.role === "admin"  ){
              isAdmin =  true
          }
 
          res.json({admin : isAdmin})
          
        })
 

        app.put('/users/admin' , async(req,res)=>{
          const user = req.body
          const filter = {email : user.email }
          const updateDoc = { $set: { role:'admin' } };
          const  result = await usersCollection.updateOne(filter,updateDoc)
          res.json(result)
        })

      
      } 
    
    finally {
      //await client.close();
    }
  }

  run().catch(console.dir);



  
app.get('/', (req,res)=> {
res.send('fly_go z')
})


app.listen(port , () => {
console.log(' Z, Running Server on port ' ,port)
})
