import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      documentType,
      documentNumber,
      city,
      department
    } = body;

    if (!name.trim()) {
      return NextResponse.json(
        { error: 'El nombre del cliente es requerido' },
        { status: 400 }
      );
    }

    // Get organization from auth token or session (simplified for now)
    const organizationId = 'cmj25u4fa0000kze1x5zm0e8t'; // This should come from auth

    // Check if customer with same document number already exists
    if (documentNumber) {
      const existingCustomer = await db.customer.findFirst({
        where: {
          organizationId,
          documentNumber,
          isActive: true,
        },
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este número de documento' },
          { status: 400 }
        );
      }
    }

    const customer = await db.customer.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        documentType: documentType || null,
        documentNumber: documentNumber?.trim() || null,
        city: city?.trim() || null,
        department: department?.trim() || null,
        organizationId,
      },
    });

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}