from django.db import models

class Categoria(models.Model):
    # Tipos de datos: VARCHAR, TEXT, DATE, BOOLEAN
    nombre = models.CharField(max_length=100, verbose_name="Nombre de la categoría")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción detallada")
    fecha_creacion = models.DateField(auto_now_add=True, verbose_name="Fecha de creación")
    activa = models.BooleanField(default=True, verbose_name="¿Está activa?")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    # Tipos de datos: VARCHAR, DECIMAL, INT, DATE
    nombre = models.CharField(max_length=150, verbose_name="Nombre del producto")
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio unitario")
    stock = models.IntegerField(default=0, verbose_name="Cantidad en stock")
    fecha_registro = models.DateField(auto_now_add=True, verbose_name="Fecha de registro")
    
    # RELACIÓN CLAVE (Foreign Key)
    # null=True y blank=True son CRUCIALES para que Django permita actualizar este campo 
    # a un valor diferente o dejarlo vacío sin lanzar errores de validación.
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.SET_NULL,  # Si se borra la categoría, el producto no se borra, solo queda el ID en null
        null=True, 
        blank=True,
        related_name='productos',
        verbose_name="Categoría"
    )

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-fecha_registro', 'nombre']

    def __str__(self):
        cat_nombre = self.categoria.nombre if self.categoria else "Sin categoría"
        return f"{self.nombre} ({cat_nombre})"