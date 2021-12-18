import axios from 'axios';

export async function getLatestVersion() {
  const response = await axios.get(
    `https://ddragon.leagueoflegends.com/api/versions.json`,
  );

  if (response.status > 200) return;

  const latestVersion = response.data as string[];

  return latestVersion[0];
}

export async function getChampions(latestVersion: string) {
  const response = await axios.get(
    `http://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`,
  );
  if (response.status > 200) return;

  const championData = response.data.data;

  const champions = Object.values(championData).map(c => c);

  return champions;
}
