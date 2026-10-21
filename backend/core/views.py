from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Producto, Categoria
from django.utils import timezone
import json

@csrf_exempt
@require_http_methods(["GET", "POST"])
def productos_api(request):
    if request.method == "GET":
        qs = Producto.objects.select_related('categoria').values(
            'id', 'nombre', 'precio', 'stock', 'categoria_id', 
            'categoria__nombre', 'fecha_registro'
        )
        return JsonResponse(list(qs), safe=False, json_dumps_params={'default': str})

    try:
        data = json.loads(request.body)
        
        if not data.get('nombre') or data.get('precio') is None:
            return JsonResponse({"error": "Nombre y precio son requeridos"}, status=400)

        clean_data = {
            'nombre': data['nombre'].strip(),
            'precio': float(data['precio']),
            'stock': int(data.get('stock', 0)),
            'fecha_registro': timezone.now().date()
        }

        cat_raw = data.get('categoria_id')
        if cat_raw and str(cat_raw).strip() and str(cat_raw).isdigit():
            try:
                categoria = Categoria.objects.get(id=int(cat_raw))
                clean_data['categoria'] = categoria
            except Categoria.DoesNotExist:
                pass

        p = Producto.objects.create(**clean_data)
        return JsonResponse({
            "id": p.id, 
            "status": "creado", 
            "nombre": p.nombre
        }, status=201, json_dumps_params={'default': str})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def producto_detalle(request, pk):
    try:
        producto = Producto.objects.get(id=pk)
        
        if request.method == "PUT":
            data = json.loads(request.body)
            
            # Actualizar campos normales
            producto.nombre = data.get('nombre', producto.nombre)
            producto.precio = data.get('precio', producto.precio)
            producto.stock = data.get('stock', producto.stock)
            
            # LA CLAVE: Actualizar explícitamente la llave foránea
            if 'categoria_id' in data:
                # Si envía vacío o null, lo dejamos en None, si no, lo convertimos a entero
                producto.categoria_id = data['categoria_id'] if data['categoria_id'] else None
                
            producto.save()
            return JsonResponse({"status": "actualizado", "id": producto.id})
            
        elif request.method == "DELETE":
            producto.delete()
            return JsonResponse({"status": "eliminado"})
            
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
        
    return JsonResponse({"error": "Método no válido"}, status=405)

@csrf_exempt
@require_http_methods(["GET"])
def categorias_api(request):
    if request.method == "GET":
        qs = Categoria.objects.filter(activa=True).values('id', 'nombre')
        return JsonResponse(list(qs), safe=False)


from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "mensaje": "API de Papelería El Lápiz Dorado funcionando correctamente en Render",
        "endpoints": ["/api/productos/", "/api/categorias/", "/admin/"]
    })

@csrf_exempt
def seed_categorias(request):
    """Endpoint temporal para insertar categorías y actualizar productos existentes"""
    from django.utils import timezone
    
    # 1. Crear categorías si no existen
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
    
    # 2. Actualizar productos existentes con categorías
    productos_actualizados = []
    
    # Actualizar producto "hojas" → categoría Escolar
    Producto.objects.filter(nombre='hojas').update(categoria_id=categorias_creadas.get('Escolar'))
    productos_actualizados.append('hojas')
    
    # Actualizar producto "Marcadores" → categoría Oficina
    Producto.objects.filter(nombre='Marcadores').update(categoria_id=categorias_creadas.get('Oficina'))
    productos_actualizados.append('Marcadores')
    
    # Actualizar producto "lapiz" → categoría Oficina
    Producto.objects.filter(nombre='lapiz').update(categoria_id=categorias_creadas.get('Oficina'))
    productos_actualizados.append('lapiz')
    
    return JsonResponse({
        'status': 'ok',
        'categorias': categorias_creadas,
        'productos_actualizados': productos_actualizados,
        'total_productos': Producto.objects.count()
    })

@csrf_exempt
@require_http_methods(["GET", "POST"])
def categorias_api(request):
    if request.method == "GET":
        qs = Categoria.objects.all().values('id', 'nombre', 'descripcion', 'fecha_creacion', 'activa')
        return JsonResponse(list(qs), safe=False, json_dumps_params={'default': str})

    try:
        data = json.loads(request.body)
        cat = Categoria.objects.create(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            fecha_creacion=timezone.now().date(),
            activa=data.get('activa', True)
        )
        return JsonResponse({"id": cat.id, "nombre": cat.nombre, "status": "creado"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)