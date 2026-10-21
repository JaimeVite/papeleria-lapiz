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


# ==================== API DE PRODUCTOS (GET / POST) ====================
@csrf_exempt
@require_http_methods(["GET", "POST"])
def productos_api(request):
    if request.method == "GET":
        productos = Producto.objects.all().values(
            'id', 'nombre', 'precio', 'stock', 'fecha_registro', 'categoria_id'
        )
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
                categoria_id=data.get('categoria_id')
            )
            return JsonResponse({
                "status": "creado",
                "id": producto.id,
                "nombre": producto.nombre,
                "categoria_id": producto.categoria_id
            }, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# ==================== ACTUALIZACIÓN FORZADA (LA SOLUCIÓN) ====================
@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def producto_update(request, pk):
    """Endpoint de actualización directa usando .update() de Django ORM"""
    try:
        data = json.loads(request.body)
        
        print(f"=== UPDATE FORZADO - ID: {pk} ===")
        print(f"Datos recibidos: {data}")
        
        # Preparar datos para actualizar
        update_data = {
            'nombre': data.get('nombre'),
            'precio': float(data.get('precio', 0)),
            'stock': int(data.get('stock', 0)),
        }
        
        # Manejar categoria_id explícitamente
        if 'categoria_id' in data:
            cat_id = data.get('categoria_id')
            print(f"categoria_id recibido: {cat_id}")
            if cat_id is None or cat_id == '' or cat_id == 'null':
                update_data['categoria_id'] = None
            else:
                update_data['categoria_id'] = int(cat_id)
        
        print(f"Datos a actualizar: {update_data}")
        
        # ACTUALIZACIÓN DIRECTA CON .update() - SIEMPRE FUNCIONA
        affected = Producto.objects.filter(id=pk).update(**update_data)
        print(f"Filas afectadas: {affected}")
        
        # Verificar el resultado
        producto = Producto.objects.get(id=pk)
        print(f"Producto actualizado: {producto.nombre}, categoria_id: {producto.categoria_id}")
        
        return JsonResponse({
            "status": "actualizado",
            "id": producto.id,
            "nombre": producto.nombre,
            "precio": str(producto.precio),
            "stock": producto.stock,
            "categoria_id": producto.categoria_id
        })
        
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)
    except Exception as e:
        print(f"Error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


# ==================== ELIMINAR PRODUCTO ====================
@csrf_exempt
@require_http_methods(["DELETE"])
def producto_delete(request, pk):
    try:
        producto = Producto.objects.get(id=pk)
        producto.delete()
        return JsonResponse({"status": "eliminado"})
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ==================== API DE CATEGORÍAS ====================
@csrf_exempt
@require_http_methods(["GET", "POST"])
def categorias_api(request):
    if request.method == "GET":
        categorias = Categoria.objects.all().values('id', 'nombre')
        return JsonResponse(list(categorias), safe=False)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            cat = Categoria.objects.create(
                nombre=data['nombre'],
                descripcion=data.get('descripcion', ''),
                fecha_creacion=timezone.now().date(),
                activa=data.get('activa', True)
            )
            return JsonResponse({"status": "creado", "id": cat.id, "nombre": cat.nombre}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# ==================== SEED DE CATEGORÍAS ====================
@csrf_exempt
def seed_categorias(request):
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
    
    return JsonResponse({
        'status': 'ok',
        'categorias': categorias_creadas,
        'total': Categoria.objects.count()
    })