'use client';

import { NextFetchEvent, NextRequest } from "next/server";
import {Pool} from '@neondatabase/serverless'
import zod , { z, number, string, date } from 'zod'
import sqlstring from 'sqlstring'
import { extractBody } from "../utils/extractBody";

const schema = zod.object({
    id: number().max(10).min(1),
    title: string().max(100).min(1),
    description: string().max(1000).min(1),
    status: z.enum(["to-do", "in-progress", "completed"]),
    priority: z.enum(["low", "medium", "high"]),
    due_date : date(),
    project_id: number().max(10).min(1),
});

async function createPageHandler(req: NextRequest, event: NextFetchEvent){
    
    const body = await extractBody(req);

    const {id} = schema.parse(body)
    const {title} = schema.parse(body)
    const {description} = schema.parse(body)
    const {status} = schema.parse(body)
    const {priority} = schema.parse(body)
    const {due_date} = schema.parse(body)
    const {project_id} = schema.parse(body)

    console.log("body", body);
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    
    const sql= sqlstring.format(`
    INSERT INTO tasks (id, title, description, status, priority, due_date, is_completed, project_id) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?);
    `, [id, title, description, status, priority, due_date, project_id]);

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