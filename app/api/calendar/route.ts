import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    // Proxy the request to the backend conductor system
    const response = await fetch(`${BACKEND_URL}/api/calendar/events`, {
      method: 'GET',
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
    console.error('Error fetching calendar data:', error);
    
    // Return fallback data if backend is not available
    return NextResponse.json({
      success: true,
      events: [
        {
          id: 'fallback_event_1',
          title: 'Welcome to UC Berkeley!',
          description: 'Your first day on campus',
          date: new Date().toISOString(),
          location: 'UC Berkeley Campus',
          category: 'orientation'
        }
      ],
      message: 'Calendar data temporarily unavailable'
    });
  }
} 