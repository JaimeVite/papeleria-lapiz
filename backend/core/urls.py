from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/productos/', views.productos_api, name='api_productos'),
    path('api/productos/<int:pk>/', views.producto_update, name='api_producto_update'),
    path('api/productos/<int:pk>/delete/', views.producto_delete, name='api_producto_delete'),
    path('api/categorias/', views.categorias_api, name='api_categorias'),
    path('api/seed-categorias/', views.seed_categorias, name='seed_categorias'),

    path('api/forzar-update/<int:producto_id>/<int:categoria_id>/', views.forzar_update_categoria, name='forzar_update'),
]