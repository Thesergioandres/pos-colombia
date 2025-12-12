import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get organization from auth token or session (simplified for now)
    const organizationId = 'cmj25u4fa0000kze1x5zm0e8t';

    // Get top products by sales quantity
    const topProducts = await db.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          organizationId,
          status: 'COMPLETED',
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Get product details
    const productIds = topProducts.map(item => item.productId);
    const products = await db.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        organizationId,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    // Combine data
    const result = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name || 'Producto desconocido',
        totalSold: item._sum.quantity || 0,
        revenue: item._sum.totalPrice || 0,
        stock: product?.stock || 0,
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}