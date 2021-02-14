const timeToISO = (t) => {
  return new Date(t).toISOString();
}

const sortBy = (key, order = 'asc') => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;

    const _A = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
    const _B = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (_A > _B) {
      comparison = 1;
    } else if (_A < _B) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}
