 import express from 'express';
 import mysql from 'mysql';
 import cors from 'cors';
 import bodyParser from 'body-parser';
 import bcrypt from 'bcryptjs'
 import jwt from 'jsonwebtoken'


 const db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: '',
    database : 'todo_list'
 })

 db.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("connected");
 })

 const app = express();
 const port = 4000;

 app.use(cors());

 app.use(bodyParser.json());

 app.use(bodyParser.urlencoded({extended:true}))

 app.get('/api/users',(req,res)=>{
    db.query('select * from users', (err,result)=>{
        if(err){
            return res.status(500).send(err);
        }
        res.status(200).json(result);
    })
 })

 // post userinfo-- /api/userinfo
 app.post('/api/userinfo',async(req,res)=>{
      const {name, father_name, email, phone, password} = req.body;

      console.log(req.body)
        
      const hashPassword = await bcrypt.hash(password,10);
      console.log(hashPassword)
      db.query('insert into usersignup(full_name, father_name, email, phone, password) values(?,?,?,?,?)',[name, father_name, email, phone, hashPassword],(err,data)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.status(201).json({message :"signup Successfully"})
      })
 })

 app.post('/api/userlogin',async(req,res)=>{
    const {username, password} = req.body;
    db.query('select * from usersignup where phone = ?', [username], async(err,result)=>{
       if(err){
        return res.status(500).send("server error");
       }
       const user = result[0];
       console.log(user);
       if(result.length == 0){
        return res.status(401).send("invalid credential");
       }
       if(await bcrypt.compare(password, user.password)){
        //   const token = jwt.sign({username: user.username}, SECRET_KEY, {expiresIn:'10m'});
        //   res.json({token})
        console.log("login")
        res.json({message: 'login successfully'})
       }else{
        res.json({message: "wrong password"})
       }
    })
 })

 // todo- add data
 app.post('/api/user/addtodo', async(req,res)=>{
    const {data} = req.body;
    db.query('insert into tododata(todoitem) values(?)', [data], async(err,result)=>{
        if(err){
            return res.status(500).send(err);
        }
        res.status(201).json({message:"successfull added"})
    })
 })

 // get todo item
 app.get('/api/users/todo', async(req,res)=>{
    db.query('select * from tododata', async(err,result)=>{
        if(err){
            return res.status(500).send(err);
        }
        res.status(200).json(result)
    })
 })

 //delete items
 app.delete('/api/user/:id', (req,res)=>{
    const id = req.params.id;
    console.log(id);
    db.query('delete from tododata where id = ?',[id], (err,result)=>{
        // console.log("daddada")
        if(err){
            return res.status(500).send(err);
        }
        res.json({message:"deleted"})
    })
 })

 // update todo
 app.put('/api/userupdate', async(req,res)=>{
    // const id = req.params.id;
    const {data, editId} = req.body;
    console.log(data,editId)
    db.query('update  tododata set todoItem = ? where id = ?', [data, editId], (err,result)=>{
        if(err){
            return res.status(500).send(err);
        }
        res.json({message:"updated"})
    })
 })

 app.listen(port,(err)=>{
    console.log("running on port 4000")
 })
