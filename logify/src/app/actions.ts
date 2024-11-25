"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
    const sql = neon("postgresql://neondb_owner:IF7mBYJ6oaui@ep-nameless-mountain-a2iggdpd.eu-central-1.aws.neon.tech/logify-db?sslmode=require");
    const data = await sql`...`;
    return data;
}