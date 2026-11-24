import * as migration_20261114_105652_initial from './20261114_105652_initial';
import * as migration_20261120_131948_remove_resources_page from './20261120_131948_remove_resources_page';
import * as migration_20261120_140152_home_whats_new from './20261120_140152_home_whats_new';
import * as migration_20261121_121536_solutions_pages_redesign from './20261121_121536_solutions_pages_redesign';
import * as migration_20261121_143602_lab_and_content_trim from './20261121_143602_lab_and_content_trim';
import * as migration_20261121_143617_lab_method_outcome from './20261121_143617_lab_method_outcome';

export const migrations = [
  {
    up: migration_20261114_105652_initial.up,
    down: migration_20261114_105652_initial.down,
    name: '20261114_105652_initial',
  },
  {
    up: migration_20261120_131948_remove_resources_page.up,
    down: migration_20261120_131948_remove_resources_page.down,
    name: '20261120_131948_remove_resources_page',
  },
  {
    up: migration_20261120_140152_home_whats_new.up,
    down: migration_20261120_140152_home_whats_new.down,
    name: '20261120_140152_home_whats_new',
  },
  {
    up: migration_20261121_121536_solutions_pages_redesign.up,
    down: migration_20261121_121536_solutions_pages_redesign.down,
    name: '20261121_121536_solutions_pages_redesign',
  },
  {
    up: migration_20261121_143602_lab_and_content_trim.up,
    down: migration_20261121_143602_lab_and_content_trim.down,
    name: '20261121_143602_lab_and_content_trim',
  },
  {
    up: migration_20261121_143617_lab_method_outcome.up,
    down: migration_20261121_143617_lab_method_outcome.down,
    name: '20261121_143617_lab_method_outcome'
  },
];
