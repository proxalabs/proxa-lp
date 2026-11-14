import * as migration_20261114_102949_initial from './20261114_102949_initial';

export const migrations = [
  {
    up: migration_20261114_102949_initial.up,
    down: migration_20261114_102949_initial.down,
    name: '20261114_102949_initial'
  },
];
