import { Document } from 'mongoose'
import { Request } from 'express'

export interface IUser extends Document{
  name: string
  email: string
  password: string
  avatar: string
  role: string
  type: string
  rf_token?: string
}


export interface INewUser {
  name: string
  email: string
  password: string
}

export interface IDecodedToken {
  id?: string
  newUser?: INewUser
  iat: number
  exp: number
}


export interface IUserParams {
  name: string 
  email: string 
  password: string
  avatar?: string
  type: string
}

export interface IReqAuth extends Request {
  user?: IUser
}


export interface IComment extends Document{
  user: string
  blog_id: string
  blog_user_id: string
  content: string
  replyCM: string[]
  reply_user: string
  comment_root: string
  _doc: object
}


export interface IBlog extends Document{
  user: string
  title: string
  content: string
  description: string
  thumbnail: string
  category: string
  _doc: object
}