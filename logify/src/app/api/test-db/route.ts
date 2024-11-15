import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testTable } from '@/lib/db/schema';

export async function GET() {
  try {
    // Test database connection
    const result = await db.select().from(testTable);
    return NextResponse.json({ 
      status: 'connected',
      timestamp: new Date().toISOString(),
      data: result 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to connect to database',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}