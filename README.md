# Documentación del Proyecto

Este documento describe la estructura del proyecto y el formato de los datos para el sitio de monitoreo de contaminantes en Uruguay.

## Estructura del Proyecto

```
Contaminantes-Uruguay/
├── data/
│   ├── contaminantes.csv
│   ├── metadatos.json
├── scripts/
│   ├── analisis.py
│   ├── visualizacion.py
├── logs/
│   ├── registro_2026-05-02.log
├── README.md
```

- `data/`: Carpeta donde se almacenan los archivos de datos.
  - `contaminantes.csv`: Archivo CSV que contiene datos sobre los contaminantes monitoreados.
  - `metadatos.json`: Archivo JSON que describe los metadatos asociados a los datos de contaminantes.

- `scripts/`: Carpeta con scripts para analizar y visualizar los datos.
  - `analisis.py`: Script para realizar análisis de datos.
  - `visualizacion.py`: Script para generar visualizaciones de los datos.

- `logs/`: Carpeta donde se guardan los registros de las actividades del sistema.
  - `registro_2026-05-02.log`: Archivo de log para registrar eventos y errores.

## Formato de los Datos

### contaminantes.csv
El archivo `contaminantes.csv` contiene las siguientes columnas:
- `fecha`: Fecha de la medición (formato: YYYY-MM-DD)
- `contaminante`: Tipo de contaminante medido
- `nivel`: Nivel de contaminación (en unidades apropiadas según el contaminante)

### metadatos.json
El archivo `metadatos.json` contiene información adicional sobre los datos, tal como:
- `fuente`: Fuente de los datos
- `unidad`: Unidad de medida utilizada
- `contacto`: Información de contacto del responsable del monitoreo

Para más información, consulte la documentación de cada script y archivo de datos en sus respectivas secciones.