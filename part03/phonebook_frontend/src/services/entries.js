import axios from "axios";

const baseURL = "/api/persons";

const getAll = () => axios
  .get(baseURL)
  .then(response => response.data);

const add = entry => axios
  .post(baseURL, entry)
  .then(response => response.data);

const update = (id, updatedEntry) => axios
  .put(`${baseURL}/${id}`, updatedEntry)
  .then(response => response.data);

const remove = id => axios.delete(`${baseURL}/${id}`);

export default { getAll, add, update, remove };