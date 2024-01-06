// const express = require('express');
import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { get } from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import pkg from "jsonwebtoken";
const jwt = pkg;
// import Post from "../models/Post";
const router = express.Router();
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// 
// Check  login Page

const authMiddleWare = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.redirect('/admin');
    // return res.status(401).json({message : 'unauthorized'});
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  }
  catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}



// GET
// ADMIN - login Page

router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// POST
// ADMIN - Check Login

router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // console.log(jwtSecret);
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/dashboard');
  }
  catch (error) {
    console.log(error);
  }
})

// GET
// Dashboard Admin

router.get('/dashboard', authMiddleWare, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with Nodejs, express & MongoDb."
    }
    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
})

// GET
// Admin - Create New Post
router.get('/add-post', authMiddleWare, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with Nodejs, express & MongoDb."
    }
    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
})


router.post('/add-post', authMiddleWare, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      })
      await Post.create(newPost);
      res.redirect('/dashboard');
    }
    catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
})


/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }

});


/**
 * PUT /
 * Admin - Create New Post
*/
router.put('/edit-post/:id', authMiddleWare, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }

});

/**
 * DELETE /
 * Admin - DElete Post
*/

router.delete('/delete-post/:id', authMiddleWare, async (req, res) => {
  try {

    await Post.deleteOne({_id : req.params.id});

    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }

});

//GET
//Admin Logout
router.get('/logout',(req,res)=>{
  res.clearCookie('token');
  res.redirect('/');
})

// POST
// Register new admin

// router.post('/register',async(req,res)=>{
//   try{
//     const {username , password} = req.body;
//     const hashedPassword = await bcrypt.hash(password , 10);
//     try {
//       const user = await User.create({username , password:hashedPassword});
//       res.status(201).json({message:"User CReated",user});
//     } catch (error) {
//       if(error.code === 11000){
//         res.status(409).json({message:'User already in use'});
//       }
//       res.status(500).json({message:"Internal server error"})
//     }
//   }
//   catch(error){
//     console.log(error);
//   }
// })


export default router;
