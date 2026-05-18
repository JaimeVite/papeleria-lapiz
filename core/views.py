from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Producto, Categoria
import json

@csrf_exempt
@require_http_methods(["GET", "POST"])
def productos_api(request):
    if request.method == "GET":
        qs = Producto.objects.select_related('categoria').values(
            'id', 'nombre', 'precio', 'stock', 'categoria_id', 'categoria__nombre', 'fecha_registro'
        )
        return JsonResponse(list(qs), safe=False)

    try:
        data = json.loads(request.body)
        if not data.get('nombre') or data.get('precio') is None:
            return JsonResponse({"error": "Nombre y precio son requeridos"}, status=400)

        # 🔑 Lógica segura para Foreign Key
        cat_raw = data.get('categoria_id')
        cat_instance = None
        if cat_raw and str(cat_raw).strip() and str(cat_raw).isdigit():
            try:
                cat_instance = Categoria.objects.get(id=int(cat_raw))
            except Categoria.DoesNotExist:
                pass  # Si no existe, se guarda como NULL

        # Creación explícita (evita el error de constraint)
        p = Producto(
            nombre=data['nombre'].strip(),
            precio=float(data['precio']),
            stock=int(data.get('stock', 0)),
            categoria=cat_instance
        )
        p.save()

        return JsonResponse({"id": p.id, "status": "creado", "nombre": p.nombre}, status=201)

    except Exception as e:
        print(f"🔴 ERROR: {type(e).__name__} -> {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def producto_detalle(request, pk):
    try:
        if request.method == "PUT":
            data = json.loads(request.body)
            Producto.objects.filter(id=pk).update(
                nombre=data.get('nombre'),
                precio=data.get('precio'),
                stock=data.get('stock')
            )
            return JsonResponse({"status": "actualizado"})
        elif request.method == "DELETE":
            Producto.objects.filter(id=pk).delete()
            return JsonResponse({"status": "eliminado"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Método no válido"}, status=405)