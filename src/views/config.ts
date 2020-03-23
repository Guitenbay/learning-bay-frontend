import axios from 'axios';

const baseURL = 'http://localhost:3000';
const fusekiURL = 'http://localhost:8000/fuseki';
const Axios = axios.create({
  withCredentials: true
})

export { baseURL, fusekiURL, Axios };