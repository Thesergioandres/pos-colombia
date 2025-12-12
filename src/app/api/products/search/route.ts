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
    // In a real app, you'd get this from the authenticated user
    const organizationId = 'cmj25u4fa0000kze1x5zm0e8t'; // This should come from auth

    const products = await db.product.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { name: { contains: query } },
          { barcode: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 20,
    });

    return NextResponse.json(products);

  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}