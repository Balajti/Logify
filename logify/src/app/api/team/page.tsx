'use client';

import { NextFetchEvent, NextRequest } from "next/server";
import {Pool} from '@neondatabase/serverless'
import zod, { z, number, string } from 'zod'
import sqlstring from 'sqlstring'
import { extractBody } from "../utils/extractBody";

const schema = zod.object({
    id : number(),
    name : string(),
    role: string(),
    department: string(),
    email: string(),
    phone: string(),
    avatar: string(),
    status: string(),
});

async function createPageHandler(req: NextRequest, event: NextFetchEvent){
    
    const body = await extractBody(req);

    const {id} = schema.parse(body)
    const {name} = schema.parse(body)
    const {role} = schema.parse(body)
    const {department} = schema.parse(body)
    const {email} = schema.parse(body)
    const {phone} = schema.parse(body)
    const {avatar} = schema.parse(body)
    const {status} = schema.parse(body)

    console.log("id", id);
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    
    const sql= sqlstring.format(`
    INSERT INTO team_members (id, name, role, department, email, phone, avatar, status) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?);
    `, [id, name, role, department, email, phone, avatar, status]);

    console.log("sql", sql);

    await pool.query(sql);


    event.waitUntil(pool.end());

    return new Response(
        JSON.stringify({res: "Uploaded succesfully"}), 
        {
            status: 200
        }
    );

}

export default async function handler(req: NextRequest, event: NextFetchEvent)
{

   if(req.method === 'POST'){
        return createPageHandler(req, event)
   }

   return new Response('invalid method', 
    {
        status: 405,
    }
);

}