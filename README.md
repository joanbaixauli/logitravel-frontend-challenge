## Cómo ejecutar

### Prerrequisitos

* Node.js (versión 16 o superior)
* npm o yarn

### Instalación

```bash
npm install
```

### Desarrollo

Inicia el servidor de desarrollo:

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

### Testing

Ejecuta los tests:

```bash
npm test
```

---

## Suite de Tests

La aplicación incluye una suite completa de tests unitarios que cubre los componentes, hooks y utilidades principales. Los tests utilizan **Jest** y **React Testing Library** para garantizar el correcto funcionamiento de la aplicación.

### Configuración

Los tests están configurados mediante `jest.config.js` usando **ts-jest** para soportar TypeScript. El entorno de pruebas está configurado para Node.js.

### Archivos de Test

#### 1. `hooks/useList.test.ts`

Tests del hook principal que gestiona la lógica de negocio de la lista.

**Cobertura:**
- Estado inicial (lista vacía, sin selección, sin historial)
- `addItem`: Añade items al final y habilita `canUndo`
- `removeItem`: Elimina items individuales y los quita de `selectedIds` si estaban seleccionados
- `removeItems`: Elimina múltiples items en una operación atómica (group-remove)
- `undo`: Revierte la última acción (add, remove, group-remove)
- `setSelectedIds` y `resetSelection`: Gestión de selección
- Casos edge: `removeItem` con id inexistente, `removeItems` con array vacío, `undo` con historial vacío
- Preservación de índices: Los items se restauran en su posición original tras `undo`

**Casos destacados:**
- Verifica que `undo` restaura items en su índice original, no al final
- Confirma que los borrados múltiples se agrupan en una sola acción de historial
- Valida que `selectedIds` se limpia automáticamente al eliminar items seleccionados

#### 2. `components/AddItemModal.test.tsx`

Tests del modal para añadir nuevos items.

**Cobertura:**
- Renderizado condicional: No se renderiza cuando `isOpen=false`
- Renderizado del modal cuando `isOpen=true`
- Actualización del input al escribir
- Botón ADD: Llama `addItem` con id generado y texto, limpia input y cierra modal
- Botón CANCEL: Llama `onClose`
- Click en backdrop: Cierra el modal
- Click dentro del modal: No cierra (stopPropagation)

**Mocks utilizados:**
- CSS Modules
- `generateId` utility (mockeado para controlar IDs en tests)
- Componentes `Card` y `Button` (simplificados)
- Portal DOM (`modal-root`)

#### 3. `components/ui/Button.test.tsx`

Tests del componente reutilizable Button.

**Cobertura:**
- Renderizado del contenido (children)
- Variante por defecto: `primary`
- Variante `secondary` cuando se especifica
- Propagación de props HTML (onClick, disabled, etc.)
- Estado `disabled`

#### 4. `components/list/Item.test.tsx`

Tests del componente individual de item de la lista.

**Cobertura:**
- Renderizado del texto del item
- Aplicación de clase `selected` cuando `selected=true`
- No aplica clase `selected` cuando `selected=false`
- Click: Llama `onClickItem` con el id correcto
- Double click: Llama `onDeleteItem` con el id correcto

#### 5. `components/list/ItemList.test.tsx`

Tests del componente que renderiza la lista completa de items.

**Cobertura:**
- Renderiza todos los items proporcionados
- Marca correctamente los items como `selected` según `selectedIds`
- Pasa correctamente los callbacks (`onClickItem`, `onDeleteItem`) a cada `Item`

**Estrategia de testing:**
- Utiliza un mock de `Item` que captura las props para verificar que se pasan correctamente

#### 6. `App.test.tsx`

Tests del componente raíz que orquesta toda la aplicación.

**Cobertura:**
- Renderizado del título y descripción
- Botón UNDO: Deshabilitado cuando `canUndo=false`, habilitado y funcional cuando `canUndo=true`
- Botón DELETE: Deshabilitado sin selección, habilitado y funcional con items seleccionados
- Modal: Abre al hacer click en ADD, cierra con botón close
- Selección de items: Click en item no seleccionado lo añade, click en item seleccionado lo quita
- Eliminación individual: `onDeleteItem` llama `removeItem`
- Añadir desde modal: `addItem` se llama correctamente con los datos del modal

**Mocks utilizados:**
- `useList` hook (mockeado para controlar el estado en cada test)
- Componentes hijos (`ItemList`, `AddItemModal`, `Button`, `Card`)
- Iconos de `lucide-react`

#### 7. `utils/generateId.test.ts`

Tests de la utilidad para generar IDs únicos.

**Cobertura:**
- Devuelve un string
- No está vacío
- Longitud máxima esperada (13 caracteres)
- Solo contiene caracteres alfanuméricos (lowercase)
- Genera valores distintos en múltiples llamadas (verifica unicidad)

### Estrategia de Testing

#### Enfoque

1. **Testing de componentes**: Se utiliza React Testing Library con enfoque en comportamiento del usuario, no en detalles de implementación
2. **Mocks estratégicos**: Se mockean dependencias externas (CSS Modules, utilidades, componentes complejos) para aislar las unidades bajo test
3. **Testing de hooks**: Se usa `renderHook` de React Testing Library para testear hooks de forma aislada
4. **Casos edge**: Se incluyen tests para casos límite (arrays vacíos, ids inexistentes, historial vacío)

#### Convenciones

- **Nombres descriptivos**: Los tests describen claramente qué comportamiento verifican
- **Arrange-Act-Assert**: Estructura clara en cada test
- **Aislamiento**: Cada test es independiente y no depende del estado de otros tests
- **Mocks consistentes**: Los mocks se configuran en `beforeEach`/`afterEach` para mantener consistencia

### Cobertura Actual

La suite de tests cubre:

- ✅ Lógica de negocio (`useList` hook) - 100% de casos principales
- ✅ Componentes UI reutilizables (`Button`)
- ✅ Componentes de lista (`Item`, `ItemList`)
- ✅ Componentes de funcionalidad (`AddItemModal`)
- ✅ Componente raíz (`App`) - integración de flujos principales
- ✅ Utilidades (`generateId`)

### Ejecutar Tests Específicos

Para ejecutar un archivo de test específico:

```bash
npm test -- AddItemModal.test.tsx
```

Para ejecutar en modo watch:

```bash
npm test -- --watch
```

Para ver cobertura:

```bash
npm test -- --coverage
```

---

### Build de producción

Genera la versión optimizada para producción:

```bash
npm run build
```

---

# useList Hook

Hook para gestionar una lista con selección múltiple y soporte para **undo**.

La lógica de la lista (añadir, eliminar, selección y deshacer) está centralizada en un único reducer para mantener el estado consistente y fácil de seguir.

---

## Decisiones principales

* Se usa `useReducer` en lugar de varios `useState` porque hay varios estados relacionados (`items`, `selectedIds`, `history`) que deben actualizarse de forma coordinada.
* El historial guarda siempre el `item` y su `index` original para poder reconstruir exactamente el estado anterior.
* Los borrados múltiples se agrupan en una sola acción para que `undo` deshaga todo en un único paso.
* El reducer es puro: no hay side-effects ni lógica fuera del flujo de estado.

---

## API del hook

```ts
const {
  items,
  selectedIds,
  setSelectedIds,
  resetSelection,
  addItem,
  removeItem,
  removeItems,
  undo
} = useList();
```

### `addItem(item)`

Añade un item al final de la lista y lo registra en el historial.

### `removeItem(id)`

Elimina un item por id y lo registra en el historial.

### `removeItems(ids)`

Elimina varios items en una sola operación (se registra como acción agrupada).

### `undo()`

Revierte la última acción registrada.

### `setSelectedIds(ids)`

Actualiza la selección (la política de selección queda en la capa de UI).

### `resetSelection()`

Limpia la selección actual.

---

## Cómo funciona el undo

Cada vez que se modifica la lista, se guarda en `history` la información mínima necesaria para reconstruir el estado anterior.

* `add` → guarda item + índice
* `remove` → guarda item + índice
* `group-remove` → guarda array de items + índices

Al hacer `undo`, se toma la última acción y se aplica la operación inversa.

---

## Notas

* El estado es local al hook. No se usa `Context`.
* La estructura está pensada para ser simple y fácil de extender (por ejemplo, añadir `redo` sería directo).
* No hay dependencias externas.

---

## Decisiones técnicas

### Gestión de estado

* **`useReducer` sobre múltiples `useState`**: Se eligió `useReducer` para coordinar estados relacionados (`items`, `selectedIds`, `history`) de forma atómica y predecible.
* **Estado local**: El estado se mantiene local al hook `useList`, sin necesidad de Context API para esta funcionalidad.

### Historial y Undo

* **Almacenamiento de índices**: Se guarda el índice original junto con el item para poder reconstruir exactamente el estado anterior, incluso si hay múltiples items idénticos.
* **Agrupación de borrados**: Los borrados múltiples se registran como una sola acción `group-remove` para que `undo` los revierta todos en un único paso.

### Arquitectura de componentes

* **Separación de responsabilidades**: 
  - `hooks/`: Lógica de negocio (useList)
  - `components/ui/`: Componentes reutilizables (Button, Card)
  - `components/list/`: Componentes específicos de la lista (Item, ItemList)
  - `components/`: Componentes de funcionalidad (AddItemModal)
* **CSS Modules**: Se utiliza CSS Modules para encapsular estilos y evitar conflictos de nombres.
* **TypeScript**: Tipado estricto para mayor seguridad y mejor DX.

### Portal para modales

* Se utiliza `createPortal` de React para renderizar el modal fuera del árbol DOM principal, mejorando la gestión de z-index y accesibilidad.

---

## Arquitectura

La aplicación sigue una arquitectura modular y escalable:

```
src/
├── components/          # Componentes de funcionalidad
│   ├── AddItemModal.tsx
│   ├── list/           # Componentes específicos de lista
│   │   ├── Item.tsx
│   │   └── ItemList.tsx
│   └── ui/             # Componentes UI reutilizables
│       ├── Button.tsx
│       └── Card.tsx
├── hooks/              # Custom hooks
│   └── useList.ts      # Hook principal con lógica de negocio
├── types/              # Definiciones de tipos TypeScript
│   └── list.ts
├── utils/              # Utilidades
│   └── generateId.ts
├── styles/             # Estilos globales
│   └── globals.css
└── App.tsx             # Componente raíz
```

**Flujo de datos**:
1. `App.tsx` orquesta los componentes y maneja el estado del modal
2. `useList` hook gestiona toda la lógica de la lista (CRUD, selección, historial)
3. Los componentes reciben props y callbacks, manteniendo una separación clara entre UI y lógica

---

## Accesibilidad

### Implementado

* **Estructura semántica**: Uso de elementos HTML semánticos (`<ul>`, `<li>`, `<button>`)
* **Portal para modales**: El modal se renderiza fuera del flujo principal del DOM
* **Role presentation**: El backdrop del modal tiene `role="presentation"` para indicar que es decorativo

---

## Mejoras futuras

### Accesibilidad

* **Navegación por teclado**: 
  - Soporte para navegación con flechas en la lista
  - Atajos de teclado (Delete, Ctrl+Z para undo)
  - Focus trap en el modal
* **ARIA labels**: 
  - Añadir `aria-label` a botones con solo iconos
  - `aria-selected` en items seleccionados
  - `aria-describedby` para descripciones de acciones
* **Focus management**: 
  - Restaurar focus al cerrar el modal
  - Indicadores visuales de focus
* **Screen readers**: 
  - Anuncios de cambios de estado (items añadidos/eliminados)
  - Etiquetas descriptivas para todas las acciones

### Funcionalidad

* **Redo**: Implementar funcionalidad de rehacer para complementar el undo
* **Persistencia**: Guardar el estado en localStorage para mantener la lista entre sesiones
* **Validación**: Validar inputs antes de añadir items (longitud mínima, caracteres permitidos)
* **Edición**: Permitir editar items existentes en lugar de solo añadir/eliminar
* **Ordenamiento**: Funcionalidad para ordenar items (drag & drop o botones)

### UX/UI

* **Feedback visual**: 
  - Animaciones de transición al añadir/eliminar items
  - Toast notifications para acciones completadas
  - Loading states si hubiera operaciones asíncronas
* **Confirmación**: Diálogo de confirmación para borrados múltiples
* **Búsqueda/Filtrado**: Permitir buscar o filtrar items en listas largas
* **Paginación**: Para listas muy grandes

### Técnicas

* **Performance**: 
  - Memoización de componentes con `React.memo`
  - Virtualización para listas muy largas
* **Internacionalización**: Soporte para múltiples idiomas
* **PWA**: Convertir en Progressive Web App con service workers

---

## Checklist de requisitos cumplidos

- [x] Añadir items a la lista
- [x] Eliminar items individuales (doble clic)
- [x] Selección múltiple de items
- [x] Eliminar múltiples items seleccionados
- [x] Funcionalidad de undo para revertir acciones
- [x] Interfaz de usuario funcional y responsive
