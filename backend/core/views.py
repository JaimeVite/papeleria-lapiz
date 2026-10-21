import json
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Categoria, Producto


# ==================== VISTA HOME ====================
def home(request):
    return JsonResponse({
        "mensaje": "API de Papelería El Lápiz Dorado funcionando en Render",
        "endpoints": ["/api/productos/", "/api/categorias/", "/admin/"]
    })


# ==================== API DE PRODUCTOS ====================
@csrf_exempt
@require_http_methods(["GET", "POST"])
def productos_api(request):
    if request.method == "GET":
        # Devolver todos los productos con su categoría relacionada
        productos = Producto.objects.all().values(
            'id', 'nombre', 'precio', 'stock', 'fecha_registro', 'categoria_id'
        )
        # Convertir Decimal a string para que JSON lo acepte
        lista = []
        for p in productos:
            p['precio'] = str(p['precio'])
            p['fecha_registro'] = str(p['fecha_registro'])
            lista.append(p)
        return JsonResponse(lista, safe=False)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            
            producto = Producto.objects.create(
                nombre=data['nombre'],
                precio=float(data['precio']),
                stock=int(data['stock']),
                fecha_registro=timezone.now().date(),
                categoria_id=data.get('categoria_id')  # Puede ser None si no envían
            )
            
            return JsonResponse({
                "status": "creado",
                "id": producto.id,
                "nombre": producto.nombre,
                "categoria_id": producto.categoria_id
            }, status=201)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# ==================== DETALLE DE PRODUCTO (PUT / DELETE) ====================
@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def producto_detalle(request, pk):
    try:
        producto = Producto.objects.get(id=pk)
        
        if request.method == "PUT":
            data = json.loads(request.body)
            
            # === DEBUG: Ver qué llega ===
            print(f"=== DEBUG PUT - Producto ID: {pk} ===")
            print(f"Datos recibidos: {data}")
            print(f"categoria_id recibido: {data.get('categoria_id')}")
            
            # 1. Actualizar campos básicos
            producto.nombre = data.get('nombre', producto.nombre)
            producto.precio = float(data.get('precio', producto.precio))
            producto.stock = int(data.get('stock', producto.stock))
            
            # 2. ACTUALIZAR LA CATEGORÍA (LA CLAVE DEL FIX)
            if 'categoria_id' in data:
                cat_id = data.get('categoria_id')
                print(f"Intentando actualizar categoria_id a: {cat_id}")
                
                if cat_id is None or cat_id == '' or cat_id == 'null':
                    # Si viene vacío, dejar sin categoría
                    producto.categoria = None
                    print("Asignando categoria = None")
                else:
                    # Buscar la categoría en la BD para asegurar que existe
                    try:
                        categoria = Categoria.objects.get(id=int(cat_id))
                        producto.categoria = categoria  # Asignar el OBJETO, no solo el ID
                        print(f"Categoría encontrada y asignada: {categoria.nombre}")
                    except Categoria.DoesNotExist:
                        producto.categoria = None
                        print(f"La categoría con ID {cat_id} NO existe, asignando None")
            else:
                print("No se recibió 'categoria_id' en los datos")
            
            # 3. Guardar los cambios
            producto.save()
            print(f"Producto guardado. categoria_id final: {producto.categoria_id}")
            print(f"========================================")
            
            return JsonResponse({
                "status": "actualizado",
                "id": producto.id,
                "nombre": producto.nombre,
                "precio": str(producto.precio),
                "stock": producto.stock,
                "categoria_id": producto.categoria_id,
                "categoria_nombre": producto.categoria.nombre if producto.categoria else None
            })
            
        elif request.method == "DELETE":
            producto.delete()
            return JsonResponse({"status": "eliminado"})
            
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)
    except Exception as e:
        print(f"Error en PUT: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


# ==================== API DE CATEGORÍAS ====================
@csrf_exempt
@require_http_methods(["GET", "POST"])
def categorias_api(request):
    if request.method == "GET":
        categorias = Categoria.objects.all().values(
            'id', 'nombre', 'descripcion', 'fecha_creacion', 'activa'
        )
        lista = []
        for c in categorias:
            c['fecha_creacion'] = str(c['fecha_creacion'])
            lista.append(c)
        return JsonResponse(lista, safe=False)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            cat = Categoria.objects.create(
                nombre=data['nombre'],
                descripcion=data.get('descripcion', ''),
                fecha_creacion=timezone.now().date(),
                activa=data.get('activa', True)
            )
            return JsonResponse({
                "status": "creado",
                "id": cat.id,
                "nombre": cat.nombre
            }, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# ==================== SEED DE CATEGORÍAS (Temporal) ====================
@csrf_exempt
def seed_categorias(request):
    """Endpoint temporal para insertar categorías y actualizar productos existentes"""
    categorias_data = [
        {'nombre': 'Oficina', 'descripcion': 'Material de oficina'},
        {'nombre': 'Escolar', 'descripcion': 'Útiles escolares'},
        {'nombre': 'Tecnología', 'descripcion': 'Dispositivos tecnológicos'},
        {'nombre': 'Arte', 'descripcion': 'Material de arte'},
    ]
    
    categorias_creadas = {}
    for data in categorias_data:
        cat, created = Categoria.objects.get_or_create(
            nombre=data['nombre'],
            defaults={
                'descripcion': data['descripcion'],
                'fecha_creacion': timezone.now().date(),
                'activa': True
            }
        )
        categorias_creadas[data['nombre']] = cat.id
    
    # Actualizar productos existentes
    productos_actualizados = []
    Producto.objects.filter(nombre='hojas').update(categoria_id=categorias_creadas.get('Escolar'))
    productos_actualizados.append('hojas')
    Producto.objects.filter(nombre='Marcadores').update(categoria_id=categorias_creadas.get('Oficina'))
    productos_actualizados.append('Marcadores')
    Producto.objects.filter(nombre='lapiz').update(categoria_id=categorias_creadas.get('Oficina'))
    productos_actualizados.append('lapiz')
    
    return JsonResponse({
        'status': 'ok',
        'categorias': categorias_creadas,
        'productos_actualizados': productos_actualizados,
        'total_productos': Producto.objects.count()
    })