(function (app) {
  'use strict';
  // Contratos de navegación acordados; no crean categorías ni posiciones.
  // Cada estrategia describe su recorrido sin imponerlo a las demás ramas.
  // Los campos y cálculos específicos se incorporarán por estrategia.
  app.Estrategias = Object.freeze([
    { id: 'pools-liquidez', nombre: 'Pools de Liquidez', niveles: ['plataforma', 'red', 'par'] },
    { id: 'hold', nombre: 'Hold', niveles: ['red', 'crypto'] },
    { id: 'farmeo-dex', nombre: 'Farmeo DEX', niveles: ['plataforma', 'trade'] },
    { id: 'shorts', nombre: 'Shorts', niveles: ['plataforma', 'red', 'trade'] }
  ].map(e => Object.freeze({ ...e, niveles: Object.freeze(e.niveles) })));
})(globalThis.Financer = globalThis.Financer || {});
