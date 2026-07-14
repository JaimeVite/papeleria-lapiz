from django.urls import path
from . import views

urlpatterns = [
    path('api/productos/', views.productos_api, name='api_productos'),
    path('api/productos/<int:pk>/', views.producto_detalle, name='api_detalle'),
    path('api/categorias/', views.categorias_api, name='api_categorias'),
]