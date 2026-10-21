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
            
            if 'nombre' in data:
                producto.nombre = data['nombre'].strip()
            if 'precio' in data:
                producto.precio = float(data['precio'])
            if 'stock' in data:
                producto.stock = int(data['stock'])
                
            producto.save()
            return JsonResponse({"status": "actualizado"}, json_dumps_params={'default': str})
            
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
    """Endpoint temporal para insertar categorías de prueba"""
    from django.utils import timezone
    
    categorias_data = [
        {'nombre': 'Oficina', 'descripcion': 'Material de oficina'},
        {'nombre': 'Escolar', 'descripcion': 'Útiles escolares'},
        {'nombre': 'Tecnología', 'descripcion': 'Dispositivos tecnológicos'},
        {'nombre': 'Arte', 'descripcion': 'Material de arte'},
    ]
    
    creadas = []
    for data in categorias_data:
        cat, created = Categoria.objects.get_or_create(
            nombre=data['nombre'],
            defaults={
                'descripcion': data['descripcion'],
                'fecha_creacion': timezone.now().date(),
                'activa': True
            }
        )
        if created:
            creadas.append(cat.nombre)
    
    return JsonResponse({
        'status': 'ok',
        'categorias_creadas': creadas,
        'total': Categoria.objects.count()
    })