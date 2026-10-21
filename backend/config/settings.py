import os
from pathlib import Path

# Construye rutas como: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Clave secreta y modo de depuración desde variables de entorno
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-clave-de-desarrollo-local-123')
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

# Hosts permitidos: localhost para desarrollo, dominios de Render y Netlify para producción
ALLOWED_HOSTS = os.getenv(
    'DJANGO_ALLOWED_HOSTS', 
    'localhost,127.0.0.1,.onrender.com,.netlify.app'
).split(',')

# Aplicaciones instaladas (corsheaders debe estar antes que las apps de django)
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',  # Tu aplicación principal
]

# Middleware (¡MUY IMPORTANTE! CorsMiddleware debe ser el PRIMERO de todos)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ==========================================================
# CONFIGURACIÓN DE BASE DE DATOS (MySQL para Local y Aiven)
# ==========================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'papeleria_db'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
        }
    }
}

# Validación de contraseñas
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internacionalización
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Mexico_City'
USE_I18N = True
USE_TZ = True

# Archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==========================================================
# CONFIGURACIÓN DE CORS Y CSRF (Para que Netlify hable con Render)
# ==========================================================
# Orígenes permitidos para solicitudes CORS (GET, POST, etc.)
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:5173,http://127.0.0.1:5173,https://papeleria-lapiz.netlify.app'
).split(',')

CORS_ALLOW_CREDENTIALS = True

# Orígenes de confianza para CSRF (Obligatorio para POST, PUT, DELETE en Django 4.x+)
CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'https://*.netlify.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]