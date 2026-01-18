require('dotenv').config({ path: '/custom/path/to/.env' })
const express = require('express')
// import express from 'express';
const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/twitter', (req, res) => {
  res.send('harsh.com')
})

app.get("/login",(req,res)=>{
    res.send("<h1>you are login to this page hello</h1>")
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})