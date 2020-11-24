/**
 * Function that derives that stats value using the formula Total Current Value - Total Prev Value
 * @param {Object} prevStats - The stats object from the previous retrieval.
 * @param {Object} stats - The stats object.
 * @param {String} prop - Stats dictionary identifier.
 * @return {number}
 * @memberOf PeerConnectionStatisticsParsers
 * was _parseConnectionStats in 0.6.x
 */
const tabulateStats = (prevStats = null, stats, prop) => {
  const nTime = stats.timestamp;
  const oTime = prevStats ? prevStats.timestamp || (new Date(stats.timestamp).getTime() - 20000) : (new Date(stats.timestamp).getTime() - 20000);
  const nVal = parseFloat(stats[prop] || '0', 10);
  let oVal = parseFloat(prevStats ? prevStats[prop] || '0' : '0', 10);

  if (nVal < oVal) {
    oVal = 0;
  }

  if ((new Date(nTime).getTime()) === (new Date(oTime).getTime())) {
    return nVal;
  }

  return parseFloat(((nVal - oVal) / (nTime - oTime) * 1000).toFixed(3) || '0', 10);
};

export default tabulateStats;
