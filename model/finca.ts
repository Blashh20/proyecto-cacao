export interface Finca {
    id_finca: string;
    nit_empresa: string;
    region: {
    nombre_region: string;
    coordenadas: {
        lat: number;
        lng: number;
    };
    };
    nombre_finca: string;
    hectareas: number;
    cumplimiento_norma_ue: boolean;
    analisis_dofa: string;
}
