export type ProcesoElectoralTipo =
  | 'presidencial'
  | 'congresal'
  | 'parlamento-andino';

export interface ProcesoElectoral {
  id: ProcesoElectoralTipo;
  nombre: string;
  descripcion: string;
}
