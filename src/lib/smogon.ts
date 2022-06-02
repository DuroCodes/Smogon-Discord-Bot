import fetch from 'node-fetch';
import { Generations } from '@pkmn/data';
import { Smogon } from '@pkmn/smogon';
import { Dex } from '@pkmn/dex';

export const gens = new Generations(Dex);
export const smogon = new Smogon(fetch);
