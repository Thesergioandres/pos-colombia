import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get organization from auth token or session (simplified for now)
    const organizationId = 'cmj25u4fa0000kze1x5zm0e8t';

    const recentSales = await db.sale.findMany({
      where: {
        organizationId,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const formattedSales = recentSales.map(sale => ({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customer?.name || null,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      createdAt: sale.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedSales);

  } catch (error) {
    console.error('Error fetching recent sales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}