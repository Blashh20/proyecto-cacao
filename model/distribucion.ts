export interface puntos_distribucion{
    id_punto: string;
    nit_empresa: string;
    nombre_local: string;
    region: {
        nombre_region: string;
        coordenadas: {
            lat: number;
            lng: number;
        };
    };
    tipo_local: string;
    direccion: string;
    telefono: string;
}