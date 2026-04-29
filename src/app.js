import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();//express ek function ki tarah hota hai. Usko call karke humne apni ek nayi blank app (ya machine) s
// tart kar li hai, jiska naam humne app rakha hai. Ab is app ke andar hum saare features daalenge.

app.use(cors({
    origin:process.env.CROS_ORIGIN,
    credentials:true//Browser ko allow karna ki wo request 
    //ke saath cookies, authorization headers, ya login-related data bhej sakta hai.
}))//from documentaion learn more about cors options

app.use(express.json({limit:"16kb"}))//whatever response we get from frontend that response is in json format and that response size is not more than 16kb
//therefore whatever data come from frontend it can read json data and then in object format convert kar dega and then we can use that data in our backend code.

app.use(express.urlencoded({extended:true,limit:"16kb"}))
//some time data is send from frontend in urlencoded format and that data size is not more than 16kb therefore this middleware is used to read that data and then
//convert it into object format and then we can use that data in our backend code.

app.use(express.static("public"))
//this is used to serve static files like images, css files, js files etc. from the "public" directory.

app.use(cookieParser())//when ever you login first time any where at that time your browser store you some data and when ever you
//come again at that website then your browser auto send that data backend but that data format is not redable by the backend then this
//middleware cookie parser comes it connvert that unreadable data to into proper readable fomat and then you auto login means it conert
//encrypted data to decrypted data..

//routes import 

import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/user",userRouter)
export  {app};//Ye file sirf app ko set up karne ke liye thi (jaise app.js). Par is app ko start karne ka kaam 
// (yani app.listen jisme hum port batate hain) kisi dusri file mein hota hai (jaise index.js).


//https://chatgpt.com/share/69f2065e-6d34-83ab-a5ee-e84279a548f4 this is the link which you can use for revision