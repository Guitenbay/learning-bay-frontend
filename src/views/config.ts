import axios from 'axios';

// const baseURL = 'http://www.biki.wiki:3000';
// const fusekiURL = 'http://www.biki.wiki:8000/fuseki';

const baseURL = 'http://localhost:3000';
const fusekiURL = 'http://localhost:8000/fuseki';
const Axios = axios.create({
  withCredentials: true
})

export { baseURL, fusekiURL, Axios };