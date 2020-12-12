'use strict';
module.exports = {
  handleStartEvent: function (event) {
    console.log(`Starting benchmark suite: ${event.currentTarget.name}`);
  },

  handleCycleEvent: function (event) {
    const result = event.target.toString();
    const splitIndex = result.indexOf('ops/sec') + 7;
    const rmeOpsPerSec = (event.target.stats.rme.toFixed(2) * (event.target.hz / 100))
      .toFixed(0)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    console.log(
      '\t' +
      result.substring(0, splitIndex) +
      `, \xb1${rmeOpsPerSec} ops/sec or` +
      result.substring(splitIndex)
    );
  },

  handleCompleteEvent: function (event) {
    console.log('Fastest is ' + event.currentTarget.filter('fastest').map('name'));
  }
};
