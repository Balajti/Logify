'use client';

import { NextFetchEvent, NextRequest } from "next/server";
import {Pool} from '@neondatabase/serverless'
import zod, { number, date } from 'zod'
import sqlstring from 'sqlstring'

async function extractBody(req: NextRequest){
    if(!req.body) {
        return 'upload unsuccesful';
    }

const decoder = new TextDecoder();

const reader = req.body.getReader();

let body =''

while(true){
    const {done, value} = await reader.read();

    if(done){
        try{
        return JSON.parse(body);
        }
        catch(e){
            console.error(e)
            return null;
        }
    }

    body = body + decoder.decode(value)
}

}

const schema = zod.object({
    id: number().max(10).min(1),
    start_date : date(),
    end_date : date(),
    on_previous: date(),
    on_next: date(),
});

async function createPageHandler(req: NextRequest, event: NextFetchEvent){
    
    const body = await extractBody(req);

    const {id} = schema.parse(body)
    const {start_date} = schema.parse(body)
    const {end_date} = schema.parse(body)
    const {on_previous} = schema.parse(body)
    const {on_next} = schema.parse(body)

    console.log("body", body);
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    
    const sql= sqlstring.format(`
    INSERT INTO timesheet (id, start_date, end_date, on_previous, on_next) VALUES
    (?, ?, ?, ?, ?);
    `, [id, start_date, end_date, on_previous, on_next]);

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