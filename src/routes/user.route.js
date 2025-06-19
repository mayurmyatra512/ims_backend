import UserController from "../controller/user.controller.js";
import authMiddleware from "../middleware/auth.js";

const userController = new UserController()
import { Router } from "express";

const userRouter = Router();

//define Routes for User Operations
userRouter.post("/signup",(req,res) => userController.signUp(req, res));
userRouter.get("/:id",(req,res) => userController.getUserById(req, res));
userRouter.get("/",authMiddleware,(req,res) => userController.getAllUser(req, res));
userRouter.put("/:id",authMiddleware,(req,res) => userController.updateUser(req, res));
userRouter.delete("/:id",authMiddleware , (req,res) => userController.deleteUser(req,res));
userRouter.post("/login", (req,res) => userController.login(req,res));
userRouter.post("/logout", (req,res) => userController.logOut(req,res));
userRouter.post('/createOrder', (req,res) => userController.createOrder(req,res))


export default userRouter;