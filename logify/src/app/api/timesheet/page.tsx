'use client';

import { NextFetchEvent, NextRequest } from "next/server";
import {Pool} from '@neondatabase/serverless'
import zod, { string } from 'zod'
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
    handle: string().max(60).min(1),
});

async function createPageHandler(req: NextRequest, event: NextFetchEvent){
    
    const body = await extractBody(req);

    const {handle} = schema.parse(body)

    console.log("body", body);
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    
    const sql= sqlstring.format(`
    INSERT INTO timesheet (id, start_date, end_date, on_previous, on_next) VALUES
    (?, ?, ?, ?);
    `, [handle]);

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