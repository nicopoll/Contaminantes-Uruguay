// dataManager.js

class DataManager {
    constructor(data) {
        this.data = data;
    }

    static async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error loading data: ${response.statusText}`);
        }
        const jsonData = await response.json();
        return new DataManager(jsonData);
    }

    parseData() {
        return this.data.map(item => ({
            fecha: item.Fecha,
            contaminante: item.Contaminante,
            tipo: item.Tipo,
            clase: item.Clase,
            muestra: item.Muestra,
            direccion: item.Dirección,
            analista: item.Analista,
            concentracion: item['Concentración (ppm)'],
            latitud: item.Latitud,
            longitud: item.Longitud
        }));
    }
}

// Export the DataManager class
export default DataManager;