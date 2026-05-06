import axios from "axios";

const http = axios.create({
  baseURL: "http://192.168.52.115:8080/api"
});

export default http;
