"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
    const sql = neon("postgres://neondb_owner:IF7mBYJ6oaui@ep-nameless-mountain-a2iggdpd-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require");
    const data = await sql`...`;
    return data;
}