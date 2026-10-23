import axios from 'axios';

const TB_API_URL = import.meta.env.VITE_TB_API_URL;
const TB_API_KEY = import.meta.env.VITE_TB_API_KEY;

export const thingsboardClient = axios.create({
  baseURL: TB_API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'X-Authorization': `ApiKey ${TB_API_KEY}`,
  },
});
