import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get organization from auth token or session (simplified for now)
    const organizationId = 'cmj25u4fa0000kze1x5zm0e8t';

    // Get total stats
    const [totalSalesResult, totalRevenueResult] = await Promise.all([
      db.sale.count({
        where: {
          organizationId,
          status: 'COMPLETED',
        },
      }),
      db.sale.aggregate({
        where: {
          organizationId,
          status: 'COMPLETED',
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaySalesResult, todayRevenueResult] = await Promise.all([
      db.sale.count({
        where: {
          organizationId,
          status: 'COMPLETED',
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      db.sale.aggregate({
        where: {
          organizationId,
          status: 'COMPLETED',
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    // Get total products and low stock
    const [totalProductsResult, lowStockResult] = await Promise.all([
      db.product.count({
        where: {
          organizationId,
          isActive: true,
        },
      }),
      db.product.count({
        where: {
          organizationId,
          isActive: true,
          stock: {
            lte: 5,
          },
        },
      }),
    ]);

    // Get total customers
    const totalCustomersResult = await db.customer.count({
      where: {
        organizationId,
        isActive: true,
      },
    });

    const stats = {
      totalSales: totalSalesResult,
      totalRevenue: totalRevenueResult._sum.total || 0,
      todaySales: todaySalesResult,
      todayRevenue: todayRevenueResult._sum.total || 0,
      totalProducts: totalProductsResult,
      lowStockProducts: lowStockResult,
      totalCustomers: totalCustomersResult,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}