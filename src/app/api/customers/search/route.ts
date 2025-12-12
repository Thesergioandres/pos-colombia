import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Get organization from auth token or session (simplified for now)
    const organizationId = 'cmj25u4fa0000kze1x5zm0e8t'; // This should come from auth

    const customers = await db.customer.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { name: { contains: query } },
          { documentNumber: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      orderBy: {
        name: 'asc',
      },
      take: 20,
    });

    return NextResponse.json(customers);

  } catch (error) {
    console.error('Error searching customers:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}