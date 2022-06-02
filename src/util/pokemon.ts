import axios from 'axios';

interface IStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

interface BaseStat {
  base: number;
  name: string;
}

interface ApiAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

interface Ability {
  name: string;
  hidden: boolean;
}

export const fetchSprite = async (id: number, shiny?: boolean): Promise<string> => {
  const req = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const { data } = req;
  return shiny ? data.sprites.front_shiny : data.sprites.front_default;
};

export const fetchStats = async (id: number): Promise<BaseStat[]> => {
  const req = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);

  const { data } = req;
  const { stats } = data;

  return stats.map((Stat: IStat) => ({
    base: Stat.base_stat,
    name: Stat.stat.name,
  }));
};

export const fetchAbilities = async (id: number): Promise<Ability[]> => {
  const req = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);

  const { data } = req;
  const { abilities } = data;

  return abilities.map((ability: ApiAbility) => ({
    name: ability.ability.name,
    hidden: ability.is_hidden,
  }));
};
