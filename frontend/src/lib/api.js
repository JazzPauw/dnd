import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API, timeout: 15000 });

export default api;

// CRUD helpers per resource
export const resourceApi = (name) => ({
  list: (params) => api.get(`/${name}`, { params }).then((r) => r.data),
  get: (id) => api.get(`/${name}/${id}`).then((r) => r.data),
  create: (data) => api.post(`/${name}`, data).then((r) => r.data),
  update: (id, data) => api.put(`/${name}/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/${name}/${id}`).then((r) => r.data),
});

export const characters = {
  ...resourceApi("characters"),
  duplicate: (id) => api.post(`/characters/${id}/duplicate`).then((r) => r.data),
};
export const spells = resourceApi("spells");
export const creatures = resourceApi("creatures");
export const diary = resourceApi("diary");
export const memories = resourceApi("memories");
export const dreams = resourceApi("dreams");
export const fungi = resourceApi("fungi");
export const recipes = resourceApi("recipes");
export const deaths = resourceApi("deaths");
export const ledger = resourceApi("ledger");
export const resources = resourceApi("resources");
export const effects = resourceApi("effects");
export const themes = resourceApi("themes");
export const inventory = resourceApi("inventory");

export const longRest = (cid) => api.post(`/rest/long/${cid}`).then((r) => r.data);
export const shortRest = (cid) => api.post(`/rest/short/${cid}`).then((r) => r.data);
export const globalSearch = (cid, q) =>
  api.get(`/search`, { params: { character_id: cid, q } }).then((r) => r.data);
