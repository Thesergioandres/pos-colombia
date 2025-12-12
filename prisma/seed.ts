import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de datos...');

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Mi Tienda Colombia',
      nit: '900123456-7',
      email: 'contacto@mitienda.com',
      phone: '+57 1 234 5678',
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      department: 'Cundinamarca',
      ivaRate: 19.0,
    },
  });

  console.log('Organización creada:', organization.name);

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mitienda.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      email: 'cajero@mitienda.com',
      name: 'Cajero Principal',
      password: hashedPassword,
      role: 'CASHIER',
      organizationId: organization.id,
    },
  });

  console.log('Usuarios creados:', adminUser.name, cashierUser.name);

  // Create store
  const store = await prisma.store.create({
    data: {
      name: 'Tienda Principal',
      address: 'Calle 123 #45-67',
      phone: '+57 1 234 5678',
      city: 'Bogotá',
      department: 'Cundinamarca',
      organizationId: organization.id,
    },
  });

  console.log('Tienda creada:', store.name);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Bebidas',
        description: 'Bebidas y líquidos varios',
        organizationId: organization.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Alimentos',
        description: 'Productos alimenticios',
        organizationId: organization.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lácteos',
        description: 'Productos lácteos',
        organizationId: organization.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Aseo',
        description: 'Productos de aseo personal y del hogar',
        organizationId: organization.id,
      },
    }),
  ]);

  console.log('Categorías creadas');

  // Create products
  const products = await Promise.all([
    // Bebidas
    prisma.product.create({
      data: {
        name: 'Coca-Cola 350ml',
        barcode: '7701020001234',
        sku: 'CCO350',
        purchasePrice: 1200,
        salePrice: 2000,
        stock: 50,
        minStock: 10,
        iva: 19,
        includesIva: true,
        categoryId: categories[0].id,
        organizationId: organization.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jugo de Naranja 1L',
        barcode: '7701020001235',
        sku: 'JNAR1L',
        purchasePrice: 3500,
        salePrice: 5500,
        stock: 25,
        minStock: 5,
        iva: 19,
        includesIva: true,
        categoryId: categories[0].id,
        organizationId: organization.id,
      },
    }),
    // Alimentos
    prisma.product.create({
      data: {
        name: 'Pan de Molde 500g',
        barcode: '7701020001236',
        sku: 'PAN500',
        purchasePrice: 2800,
        salePrice: 4200,
        stock: 15,
        minStock: 5,
        iva: 0,
        includesIva: false,
        categoryId: categories[1].id,
        organizationId: organization.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Arroz Diana 500g',
        barcode: '7701020001237',
        sku: 'ARO500',
        purchasePrice: 2000,
        salePrice: 3200,
        stock: 30,
        minStock: 8,
        iva: 0,
        includesIva: false,
        categoryId: categories[1].id,
        organizationId: organization.id,
      },
    }),
    // Lácteos
    prisma.product.create({
      data: {
        name: 'Leche Colanta 1L',
        barcode: '7701020001238',
        sku: 'LECCOL1L',
        purchasePrice: 1800,
        salePrice: 2800,
        stock: 40,
        minStock: 10,
        iva: 0,
        includesIva: false,
        categoryId: categories[2].id,
        organizationId: organization.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Queso Campesino 500g',
        barcode: '7701020001239',
        sku: 'QUECAM500',
        purchasePrice: 8000,
        salePrice: 12000,
        stock: 12,
        minStock: 3,
        iva: 0,
        includesIva: false,
        categoryId: categories[2].id,
        organizationId: organization.id,
      },
    }),
    // Aseo
    prisma.product.create({
      data: {
        name: 'Jabón Rey 120g',
        barcode: '7701020001240',
        sku: 'JABREY120',
        purchasePrice: 800,
        salePrice: 1500,
        stock: 60,
        minStock: 15,
        iva: 19,
        includesIva: true,
        categoryId: categories[3].id,
        organizationId: organization.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Papel Higiénico Elite 4 rollos',
        barcode: '7701020001241',
        sku: 'PAPELI4',
        purchasePrice: 3500,
        salePrice: 5500,
        stock: 20,
        minStock: 5,
        iva: 19,
        includesIva: true,
        categoryId: categories[3].id,
        organizationId: organization.id,
      },
    }),
  ]);

  console.log('Productos creados');

  // Create inventory records
  for (const product of products) {
    await prisma.inventory.create({
      data: {
        productId: product.id,
        storeId: store.id,
        quantity: product.stock,
        minStock: product.minStock,
      },
    });
  }

  console.log('Inventario creado');

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '3001234567',
        documentType: 'CC',
        documentNumber: '80123456',
        city: 'Bogotá',
        department: 'Cundinamarca',
        creditLimit: 500000,
        organizationId: organization.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'María Rodríguez',
        email: 'maria.rodriguez@email.com',
        phone: '3109876543',
        documentType: 'CC',
        documentNumber: '80987654',
        city: 'Medellín',
        department: 'Antioquia',
        creditLimit: 300000,
        organizationId: organization.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Empresa XYZ S.A.',
        email: 'contacto@empresa.com',
        phone: '1 234 5678',
        documentType: 'NIT',
        documentNumber: '900123456-8',
        city: 'Bogotá',
        department: 'Cundinamarca',
        creditLimit: 2000000,
        organizationId: organization.id,
      },
    }),
  ]);

  console.log('Clientes creados');

  console.log('Seed completado exitosamente!');
  console.log('\n--- Credenciales de prueba ---');
  console.log('Administrador: admin@mitienda.com / admin123');
  console.log('Cajero: cajero@mitienda.com / admin123');
  console.log('----------------------------');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });