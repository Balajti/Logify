import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testTable } from '@/lib/db/schema';

export async function GET() {
  try {
    const result = await db.select().from(testTable);
    return NextResponse.json({ 
      message: 'Data retrieved successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await db.insert(testTable).values({
      name: `Test Entry ${new Date().toISOString()}`,
    }).returning();
    return NextResponse.json({ 
      message: 'Data inserted successfully',
      data: result 
    });
  } catch (error) {
    console.error('Database POST error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}