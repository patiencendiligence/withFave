const si = require('systeminformation');

class CPUMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 500;
    this.smoothingFactor = options.smoothingFactor || 0.3;
    this.previousAvg = 0;
    this.timer = null;
    this.listeners = new Set();
  }

  calculateSmoothedValue(currentValue) {
    const smoothed = this.previousAvg * (1 - this.smoothingFactor) + currentValue * this.smoothingFactor;
    this.previousAvg = smoothed;
    return smoothed;
  }

  getEmotionState(cpuUsage) {
    if (cpuUsage < 25) return 'calm';
    if (cpuUsage < 55) return 'normal';
    if (cpuUsage < 80) return 'excited';
    return 'stressed';
  }

  async getCurrentCPU() {
    try {
      const load = await si.currentLoad();
      const currentUsage = load.currentLoad;
      const smoothedUsage = this.calculateSmoothedValue(currentUsage);
      const emotionState = this.getEmotionState(smoothedUsage);

      return {
        raw: Math.round(currentUsage * 100) / 100,
        smoothed: Math.round(smoothedUsage * 100) / 100,
        emotion: emotionState,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('CPU measurement error:', error);
      return {
        raw: 0,
        smoothed: this.previousAvg,
        emotion: 'calm',
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Listener callback error:', error);
      }
    });
  }

  start() {
    if (this.timer) return;

    const measure = async () => {
      const data = await this.getCurrentCPU();
      this.notifyListeners(data);
    };

    measure();
    this.timer = setInterval(measure, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset() {
    this.previousAvg = 0;
  }
}

module.exports = CPUMonitor;
