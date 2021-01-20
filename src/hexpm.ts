import axios from 'axios';
const BASE_URL = 'https://hex.pm/api';

export function getPackage(name: String) {
  const url = `${BASE_URL}/packages/${name}`;
  return axios.get(url).then((res) => res.data);
}

export function getPackages(search: String) {
  const url = `${BASE_URL}/packages?search=${search}&sort=downloads`;
  return axios.get(url).then((res) => {
    console.log(res.data);
    return res.data;
  });
}
