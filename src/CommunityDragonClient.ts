import axios from 'axios';

export async function getChampionData(id: number) {
  const response = await axios.get(
    `https://cdn.communitydragon.org/latest/champion/${id}/data`,
  );

  if (response.status > 200) return {};

  return response.data;
}
