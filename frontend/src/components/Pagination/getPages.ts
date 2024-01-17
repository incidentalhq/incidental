export const getPages = (
  currentPage: number,
  totalPages: number,
  leftEdge = 2,
  leftCurrent = 2,
  rightCurrent = 2,
  rightEdge = 2,
) => {
  let last = 0;
  const ret = [];
  for (let i = 1; i < totalPages + 1; i++) {
    if (
      i <= leftEdge ||
      (i > currentPage - leftCurrent - 1 && i < currentPage + rightCurrent) ||
      i > totalPages - rightEdge
    ) {
      if (last + 1 !== i) {
        ret.push(null);
      }
      ret.push(i);
      last = i;
    }
  }
  return ret;
};

export default getPages;
