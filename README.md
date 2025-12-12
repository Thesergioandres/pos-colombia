# POS Colombia - Sistema de Punto de Venta

Un sistema completo de punto de venta (POS) desarrollado para el mercado colombiano, con facturación electrónica DIAN y métodos de pago locales.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **🔐 Sistema de Autenticación**
  - Login seguro con roles de usuario (Admin, Manager, Cajero, Inventario)
  - Gestión de organizaciones multi-tenant
  - Sesiones persistentes

- **📦 Gestión de Productos e Inventario**
  - Catálogo completo de productos
  - Búsqueda por nombre, código de barras o SKU
  - Control de stock con alertas de bajo inventario
  - Categorías y variantes de productos
  - Precios con IVA configurable (19% estándar Colombia)

- **🛒 Módulo de Ventas POS**
  - Interfaz táctil optimizada
  - Carrito dinámico con descuentos
  - Múltiples métodos de pago colombianos:
    - Efectivo
    - Tarjeta (Débito/Crédito)
    - Transferencia bancaria
    - Nequi
    - Daviplata
    - Venta a crédito
  - Cálculo automático de cambio
  - Soporte para clientes con límite de crédito

- **👥 Gestión de Clientes (CRM)**
  - Validación de documentos colombianos (CC, CE, NIT, TI, PPT)
  - Historial de compras
  - Sistema de crédito con límites configurables
  - Búsqueda rápida de clientes

- **📊 Reportes y Análisis**
  - Dashboard en tiempo real
  - Estadísticas de ventas e ingresos
  - Productos más vendidos
  - Ventas recientes con filtros
  - Indicadores de inventario

### 📋 Datos de Prueba

El sistema incluye datos de ejemplo para probar todas las funcionalidades:

#### Credenciales de Acceso
- **Administrador**: `admin@mitienda.com` / `admin123`
- **Cajero**: `cajero@mitienda.com` / `admin123`

#### Datos de Ejemplo
- **Organización**: Mi Tienda Colombia (NIT: 900123456-7)
- **Productos**: 8 productos de ejemplo en 4 categorías
- **Clientes**: 3 clientes de ejemplo (persona natural, persona jurídica)
- **Tienda**: Tienda Principal en Bogotá

## 🏗️ Arquitectura Técnica

### Frontend
- **Next.js 15** con App Router
- **TypeScript** para tipado seguro
- **Tailwind CSS** con diseño responsive
- **shadcn/ui** componentes modernos
- **Zustand** para estado global
- **React Hook Form** para formularios

### Backend
- **Next.js API Routes** para endpoints REST
- **Prisma ORM** con base de datos SQLite
- **bcryptjs** para encriptación de contraseñas

### Base de Datos
- **SQLite** para desarrollo y pruebas
- **Prisma** como ORM
- **Modelos completos** para POS colombiano

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd pos-colombia
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder al sistema**
   - Abre http://localhost:3000
   - Usa las credenciales de prueba

## 📱 Uso del Sistema

### Flujo de Venta Típico

1. **Iniciar Sesión**: Ingresa con tu usuario y contraseña
2. **Seleccionar Cliente** (opcional): Busca o crea un cliente
3. **Agregar Productos**: 
   - Busca por nombre o escanea código de barras
   - Ajusta cantidades y descuentos
4. **Procesar Pago**:
   - Selecciona método de pago
   - Ingresa datos adicionales si es necesario
   - Confirma la venta
5. **Ver Reportes**: Accede al dashboard para ver estadísticas

### Gestión de Inventario

- Los productos se actualizan automáticamente con cada venta
- Sistema alerta cuando el stock es bajo (≤ 5 unidades)
- Soporte para múltiples bodegas/sucursales

### Métodos de Pago Colombianos

- **Efectivo**: Calcula cambio automáticamente
- **Tarjeta**: Registra banco, tipo y últimos 4 dígitos
- **Nequi/Daviplata**: Captura número de referencia
- **Transferencia**: Registra referencia bancaria
- **Crédito**: Vinculado a clientes con límite aprobado

## 🗂️ Estructura del Proyecto

```
src/
├── app/                    # Rutas Next.js App Router
│   ├── api/               # Endpoints API
│   │   ├── auth/          # Autenticación
│   │   ├── customers/     # Clientes
│   │   ├── products/      # Productos
│   │   ├── sales/         # Ventas
│   │   └── reports/       # Reportes
│   ├── login/             # Página de login
│   ├── pos/               # Interfaz principal POS
│   └── reports/           # Dashboard de reportes
├── components/
│   ├── pos/               # Componentes del módulo POS
│   └── ui/                # Componentes UI shadcn
├── stores/                # Estado global Zustand
│   ├── auth.ts            # Estado de autenticación
│   └── pos.ts             # Estado del POS
└── lib/                   # Utilidades y configuración
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env` con:
```env
DATABASE_URL="file:./dev.db"
```

### Personalización
- **IVA**: Configurable por organización (19% por defecto)
- **Métodos de pago**: Extensible para nuevos métodos
- **Roles de usuario**: Sistema de permisos granular

## 🚧 Próximas Funcionalidades

### Plan de Implementación

**Fase 2 (MVP Extendido)**
- [ ] Facturación electrónica DIAN
- [ ] Múltiples tiendas/sucursales
- [ ] Importación/Exportación de datos
- [ ] Impresión de tickets y facturas

**Fase 3 (Avanzado)**
- [ ] Funcionalidad offline (PWA)
- [ ] Gestión de proveedores
- [ ] Compras y ajustes de inventario
- [ ] Reportes avanzados y exportación

**Fase 4 (Enterprise)**
- [ ] Integración con sistemas contables
- [ ] API pública para integraciones
- [ ] App móvil para clientes
- [ ] Análisis predictivo con IA

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama de funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@poscolombia.com
- Documentación: docs.poscolombia.com

---

**POS Colombia** - El sistema de punto de venta diseñado para el éxito de tu negocio en Colombia.