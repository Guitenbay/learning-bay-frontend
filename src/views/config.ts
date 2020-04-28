import axios from 'axios';

// const baseURL = 'http://139.196.179.105:3000';
// const fusekiURL = 'http://139.196.179.105:8000/fuseki';

const baseURL = 'http://localhost:3000';
const fusekiURL = 'http://localhost:8000/fuseki';

const aliyunOSSURL = 'https://learningbay-20200428.oss-cn-shanghai.aliyuncs.com'
const Axios = axios.create({
  withCredentials: true
})

export { baseURL, fusekiURL, aliyunOSSURL, Axios };