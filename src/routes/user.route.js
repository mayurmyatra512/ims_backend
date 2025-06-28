import UserController, { upload } from "../controller/user.controller.js";
import authMiddleware from "../middleware/auth.js";
import uploadMiddleware from "../middleware/uploads.js";
import { Router } from "express";
import express from "express";

const userController = new UserController()
const userRouter = Router();

//define Routes for User Operations
userRouter.post("/signup", (req,res) => userController.signUp(req, res));
userRouter.get("/:id", (req,res) => userController.getUserById(req, res));
userRouter.get("/",authMiddleware,(req,res) => userController.getAllUser(req, res));
userRouter.put("/:id",authMiddleware,(req,res) => userController.updateUser(req, res));
userRouter.delete("/:id",authMiddleware , (req,res) => userController.deleteUser(req,res));
userRouter.post("/login", (req,res) => userController.login(req,res));
userRouter.post("/logout", (req,res) => userController.logOut(req,res));
// userRouter.post('/updateUser', authMiddleware, (req,res) => userController.updateProfile(req,res))
userRouter.post('/createOrder', (req,res) => userController.createOrder(req,res))
userRouter.post('/forgotPassword', (req,res) => userController.forgetPassword(req,res))
userRouter.post('/resetPassword', (req,res) => userController.resetPassword(req,res))
userRouter.put("/update/:id/:companyId", uploadMiddleware.single("profileImage"), (req, res) => userController.updateUser(req, res));


export default userRouter;