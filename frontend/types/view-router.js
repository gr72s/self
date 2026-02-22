const VIEW_KEYS = {
  HOME: 'home',

  WORKOUTS_LIST: 'workouts.list',
  WORKOUTS_CREATE: 'workouts.create',
  WORKOUTS_EDIT: 'workouts.edit',

  ROUTINES_LIST: 'routines.list',
  ROUTINES_CREATE: 'routines.create',
  ROUTINES_EDIT: 'routines.edit',

  EXERCISES_LIST: 'exercises.list',
  EXERCISES_CREATE: 'exercises.create',
  EXERCISES_EDIT: 'exercises.edit',

  GYMS_LIST: 'gyms.list',
  GYMS_CREATE: 'gyms.create',
  GYMS_EDIT: 'gyms.edit',

  MUSCLES_LIST: 'muscles.list',
  MUSCLES_CREATE: 'muscles.create',
  MUSCLES_EDIT: 'muscles.edit'
};

const VALID_VIEWS = new Set(Object.values(VIEW_KEYS));
const SHELL_VIEW_STORAGE_KEY = 'shell.pending.view';

function normalizeView(view) {
  if (VALID_VIEWS.has(view)) {
    return view;
  }
  return VIEW_KEYS.HOME;
}

function buildView(view, params = {}) {
  return {
    view: normalizeView(view),
    params: params || {}
  };
}

function parseViewQuery(query = {}) {
  const view = normalizeView(query.view);
  const params = {};

  if (query.id) {
    params.id = query.id;
  }

  return { view, params };
}

module.exports = {
  VIEW_KEYS,
  SHELL_VIEW_STORAGE_KEY,
  normalizeView,
  buildView,
  parseViewQuery
};
