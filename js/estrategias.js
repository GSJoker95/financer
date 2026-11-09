// Encapsula los recorridos para que no dependan del estado de una pantalla.
(function (app) {
  // Activa modo estricto para detectar cambios accidentales.
  'use strict';
  // Contratos de navegación acordados; no crean categorías ni posiciones.
  // Cada estrategia describe su recorrido sin imponerlo a las demás ramas.
  // Los campos y cálculos específicos se incorporarán por estrategia.
  // Publica los recorridos acordados sin crear registros ni posiciones al abrir la web.
  app.Estrategias = Object.freeze([
    // Describe Pools: plataforma y red antes del par; sus campos financieros siguen pendientes.
    { id: 'pools-liquidez', nombre: 'Pools de Liquidez', niveles: ['plataforma', 'red', 'par'] },
    // Describe Hold sin plataforma obligatoria, siguiendo la estructura indicada por el propietario.
    { id: 'hold', nombre: 'Hold', niveles: ['red', 'crypto'] },
    // Describe Farmeo DEX sin red obligatoria y con una operación individual como destino.
    { id: 'farmeo-dex', nombre: 'Farmeo DEX', niveles: ['plataforma', 'trade'] },
    // Describe Shorts con plataforma y red antes de cada operación individual.
    { id: 'shorts', nombre: 'Shorts', niveles: ['plataforma', 'red', 'trade'] }
  // Congela cada recorrido y su lista para impedir modificaciones accidentales en memoria.
  ].map(e => Object.freeze({ ...e, niveles: Object.freeze(e.niveles) })));
// Asocia los contratos de recorrido al espacio común de Financer.
})(globalThis.Financer = globalThis.Financer || {});
