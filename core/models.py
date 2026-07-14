from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, null=False, blank=False)
    descripcion = models.TextField(null=True, blank=True)
    fecha_creacion = models.DateField(null=False, blank=False)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'categoria'

class Producto(models.Model):
    nombre = models.CharField(max_length=150, null=False, blank=False)
    precio = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    stock = models.IntegerField(default=0, null=False, blank=False)
    fecha_registro = models.DateField(null=False, blank=False)
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='productos'
    )

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'producto'