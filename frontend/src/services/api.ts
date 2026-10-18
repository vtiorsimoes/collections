import axios from 'axios';

const API_URL = 'http://localhost:5131/api';

export const api = axios.create({
  baseURL: API_URL,
});
