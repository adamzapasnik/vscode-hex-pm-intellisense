import axios from 'axios';
const BASE_URL = 'https://hex.pm/api';

export function getPackage(name: String) {
  const url = `${BASE_URL}/packages/${name}`;
  return axios.get(url).then((res) => res.data);
}

// https://hexpm.docs.apiary.io/#introduction/package-search
// sort by downloads to show most popular ones first if results are paginated
export function getPackages(search: String) {
  const url = `${BASE_URL}/packages?search=name:*${search}*&sort=downloads`;
  return axios.get(url).then((res) => {
    console.log(res.data);
    return res.data;
  });
}
