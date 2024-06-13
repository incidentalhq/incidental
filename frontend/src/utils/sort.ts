type ImplementsRank = {
  rank: number
}

export const rankSorter = (a: ImplementsRank, b: ImplementsRank) => {
  return a.rank > b.rank ? 1 : -1
}
