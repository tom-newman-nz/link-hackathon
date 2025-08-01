import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    // Trigger comprehensive scraping on backend
    const response = await fetch(`${BACKEND_URL}/api/marketplace/comprehensive-scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error triggering comprehensive scraping:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger comprehensive scraping'
    }, { status: 500 });
  }
} 