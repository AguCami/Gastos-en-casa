# Gastos en Casa

App para llevar el control de los gastos del hogar.

## Levantar localmente

```bash
git clone <repo>
cd Gastos-en-casa
npm install
npm run dev
```

Abrí `http://localhost:5173` en el navegador.

## Features

- Registrar gastos con descripción, monto, categoría, miembro y fecha
- Filtrar por miembro, categoría y mes
- Editar y eliminar gastos
- Múltiples miembros del hogar
- Resumen con gráficos: torta por categoría, barras por miembro, evolución mensual
- Datos guardados en LocalStorage (sin necesidad de backend)

## Build para producción

```bash
npm run build
```
