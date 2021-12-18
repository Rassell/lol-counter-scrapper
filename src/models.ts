type IPosition = 'middle' | 'top' | 'jungle' | 'bottom' | 'utility';

type IChampionData = {
  id: number;
  name: string;
  alias: string;
  title: string;
  shortBio: string;
  tacticalInfo: {};
  playstyleInfo: {};
  squarePortraitPath: string;
  stingerSfxPath: string;
  chooseVoPath: string;
  banVoPath: string;
  roles: IPosition[];
  recommendedItemDefaults: [];
  skins: [];
  passive: {};
  spells: [];
};

type ICounter = {
  id: number;
  name: string;
  matches: number;
  winRate: number;
}
