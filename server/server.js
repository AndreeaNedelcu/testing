const  express =require('express')
const bodyParser=require('body-parser')
const Sequelize=require('sequelize');
const cors=require('cors');
const path=require('path')

const { appendFile } = require('fs');

const sequelize=new Sequelize(process.env.DATABASE_URL,{
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions:{
ssl:{
    require:true,
    rejectUnauthorized:false
}
    },
    define:{
        timestamps:false
    }
})


const Book=sequelize.define('book', {
    title:Sequelize.STRING,
    content:Sequelize.TEXT
})

const Chapter=sequelize.define('chapter', {
    title:Sequelize.STRING,
    content:Sequelize.TEXT
})



Book.hasMany(Chapter)

const app=express()
app.use(cors())
app.use(express.static(path.join(__dirname,'build')))
app.use(bodyParser.json());


//6.trebuie sa declansam cumva crearea de tabele
app.get('/sync', async(req, res)=>{
    try{
        await sequelize.sync({force:true})
        res.status(201).json({message:'created'})
    }
    catch(err){
        console.warn(err);
        res.status(500).json({message: 'some error'})
    }
})


app.get('/books', async(req, res)=>{
    try{
       const books=await Book.findAll()
       res.status(200).json(books)
    }
    catch(err){
        console.warn(err);
        res.status(500).json({message: 'some error'})
    }
})


app.post('/books', async(req, res)=>{
    try{
      await Book.create(req.body)
      res.status(201).json({message:'created'})
    }
    catch(err){
        console.warn(err);
        res.status(500).json({message: 'some error'})
    }
})
app.get('/books/:bid', async(req, res)=>{
    try{
    const book=await Book.findByPk(req.params.bid,{include:Chapter})
    if(book){
        res.status(200).json(book)
    } 
    else{
        res.status(404).json({message:'not found'})
    }

 }
 catch(err){
     console.warn(err);
     res.status(500).json({message: 'some error'})
 }
}) 

app.put('/books/:bid', async(req, res)=>{ 
    try{
        const book=await Book.findByPk(req.params.bid)
        if(book){
            await book.update(req.body, {fields:['title', 'content']})
            res.status(202).json({message:'accepted'})
        }
        else{
            res.status(404).json({message:'not found'})
        }
    
     }
     catch(err){
         console.warn(err);
         res.status(500).json({message: 'some error'})
     }
})
app.delete('/books/:bid', async(req, res)=>{
    try{
        const book=await Book.findByPk(req.params.bid)
        if(book){
            await book.destroy()
            res.status(202).json({message:'accepted'})
        }
        else{
            res.status(404).json({message:'not found'})
        }
    
     }
     catch(err){
         console.warn(err);
         res.status(500).json({message: 'some error'})
     }
})


app.get('/books/:bid/chapters', async(req, res)=>{
    try{
        const book=await Book.findByPk(req.params.bid)
        if(book){
            const chapters=await book.getChapters()

            res.status(200).json(chapters)
        }
        else{
            res.status(404).json({message:'not found'})
        }
    
     }
     catch(err){
         console.warn(err);
         res.status(500).json({message: 'some error'})
     }
})

app.post('/books/:bid/chapters', async(req, res)=>{
    try{
        const book=await Book.findByPk(req.params.bid)
        if(book){

            const chapter=req.body
            chapter.bookId=book.id
            await Chapter.create(chapter)

            res.status(201).json({message:'created'})
        }
        else{
            res.status(404).json({message:'not found'})
        }
    
     }
     catch(err){
         console.warn(err);
         res.status(500).json({message: 'some error'})
     }
})

app.get('/books/:bid/chapters/:cid', async(req, res)=>{
    try{
        const book=await Book.findByPk(req.params.bid)
        if(book){
            const chapters=await book.getChapters({where:{id:req.params.cid}})
            const chapter=chapters.shift();
            if(chapter){
                res.status(200).json(chapter)
            }
            else{
                res.status(404).json({message:' chapter not found'})
            }

            res.status(200).json(chapters)
        }
        else{
            res.status(404).json({message:' book not found'})
        }
    
     }
     catch(err){
         console.warn(err);
         res.status(500).json({message: 'some error'})
     }
})
app.put('/books/:bid/chapters/:cid', async(req, res)=>{
    try{
        const book=await Book.findByPk(req.params.bid)
        if(book){
            const chapters=await book.getChapters({where:{id:req.params.cid}})
            const chapter=chapters.shift();
            if(chapter){
                await chapter.update(req.body)
                res.status(202).json({message:'accepted'})
            }
            else{
                res.status(404).json({message:' chapter not found'})
            }

            res.status(200).json(chapters)
        }
        else{
            res.status(404).json({message:' book not found'})
        }
    
     }
     catch(err){
         console.warn(err);
         res.status(500).json({message: 'some error'})
     }
})
app.delete('/books/:bid/chapters/:cid', async(req, res)=>{
    try{
        const book=await Book.findByPk(req.params.bid)
        if(book){
            const chapters=await book.getChapters({where:{id:req.params.cid}})
            const chapter=chapters.shift();
            if(chapter){
                await chapter.destroy()
                res.status(202).json({message:'accepted'})
            }
            else{
                res.status(404).json({message:' chapter not found'})
            }

            res.status(200).json(chapters)
        }
        else{
            res.status(404).json({message:' book not found'})
        }
    
     }
     catch(err){
         console.warn(err);
         res.status(500).json({message: 'some error'})
     }
})


//3.app asculta pe un port
// app.listen(8080)
app.listen(process.env.PORT)