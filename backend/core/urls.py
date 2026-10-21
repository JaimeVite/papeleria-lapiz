from django.urls import path
from . import views
urlpatterns = [
    # Ruta raíz (para que no salga 404 al entrar solo a la URL principal)
    path('', views.home, name='home'),
    
    # Rutas de la API
    path('api/productos/', views.productos_api, name='api_productos'),
    path('api/productos/<int:pk>/', views.producto_detalle, name='api_detalle'),
    path('api/categorias/', views.categorias_api, name='api_categorias'),
    path('api/seed-categorias/', views.seed_categorias, name='seed_categorias'),
]