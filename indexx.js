import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
const app = express()
app.use(express.json())
app.use(cors())
dotenv.config()
const mongourl = process.env.url
const port = process.env.port
const createconnection = async () => {
    const client = new MongoClient(mongourl)
    await client.connect()
    console.log("mongo connected")
    return client

}

const client = await createconnection()
//create mentor
app.post('/mentors', async (req, res) => {
    try {
      const mentorData = req.body;
      const mentor =await client
      .db("school")
      .collection("mentors")
      .insertOne(mentorData)
      res.status(201).json(mentor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create mentor' });
    }
  });
// create student
app.post('/students', async (req, res) => {
    try {
      const studentData = req.body; 
      const student = await client
      .db("school")
      .collection("students")
      .insertOne(studentData)
      res.status(201).json(student);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create student' });
    }
 });
 //assign or change student to a mentor
 app.put('/students/:studentId/assign-mentor/:mentorId', async (req, res) => {
    try {
      const { studentId, mentorId } = req.params;
      const student = await client
      .db("school")
      .collection("students")
      .updateOne({studentId:+studentId},{$set: {mentor: +mentorId}});
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: 'Failed to assign mentor to student' });
    }
  });
//assign many students to only one mentor
  app.put('/mentors/:mentorId/add-students', async (req, res) => {
   
    try {
      const { mentorId } = req.params;
      const{ studentIds} = req.body;
      //const student=await client.db("school").collection("students").updateMany({studentId:{$in:studentIds}},{$set:{mentor:+mentorId}})
      const mentor = await client
      .db("school")
      .collection("mentors")
      .updateOne({mentorId:+mentorId},{ $push: { students: { $each: studentIds } } },{ returnOriginal: false });
      res.json(mentor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add students to mentor' });
    }
  });

// get all students assigned to a particuar mentor
  app.get('/mentors/:mentorId/students', async (req, res) => {
    try {
      const { mentorId } = req.params;
      const students = await client
      .db("school")
      .collection("students")
      .find({ mentor:+mentorId }).toArray();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch students for mentor' });
    }
  });


app.listen(port, () => console.log("server started on ", port))