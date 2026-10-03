/**
 * @module engine/tick
 */
import { emit } from '../store/state.js';

export const SPEED_MS = {
  1: 3000,
  2: 1500,
  5: 600
};

/**
 * GameClock class for managing game time and ticks
 */
export class GameClock {
  constructor() {
    this.currentTick = 0;
    this.ticksPerDay = 8;
    this.speed = 1;
    this.isRunning = false;
    this.currentDay = 1;
    this.currentHour = 9; // Starts at 9 AM
    this.intervalId = null;
  }

  /**
   * Starts the clock
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._scheduleNextTick();
  }

  /**
   * Pauses the clock
   */
  pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resumes the clock
   */
  resume() {
    this.start();
  }

  /**
   * Sets the clock speed
   * @param {number} speed 
   */
  setSpeed(speed) {
    if (SPEED_MS[speed]) {
      this.speed = speed;
      if (this.isRunning) {
        this.pause();
        this.start();
      }
    }
  }

  /**
   * Returns formatted time display string
   * @returns {string} e.g. "Day 3, 2:00 PM"
   */
  getTimeDisplay() {
    const isPM = this.currentHour >= 12;
    const displayHour = this.currentHour > 12 ? this.currentHour - 12 : (this.currentHour === 0 ? 12 : this.currentHour);
    const ampm = isPM ? 'PM' : 'AM';
    return `Day ${this.currentDay}, ${displayHour}:00 ${ampm}`;
  }

  /**
   * Internal method to schedule the next tick
   * @private
   */
  _scheduleNextTick() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    const ms = SPEED_MS[this.speed] || 3000;
    this.intervalId = setInterval(() => {
      this._tick();
    }, ms);
  }

  /**
   * Internal method to process a single tick
   * @private
   */
  _tick() {
    this.currentTick++;
    this.currentHour++;

    if (this.currentHour === 9) {
      emit('day_start', { day: this.currentDay });
    }

    // Work day ends at 5 PM (17:00), so 8 ticks from 9 AM
    if (this.currentHour > 17) {
      emit('day_end', { day: this.currentDay });
      this.currentDay++;
      this.currentHour = 9; // Reset to 9 AM next day
    }

    emit('tick', {
      tick: this.currentTick,
      day: this.currentDay,
      hour: this.currentHour,
      speed: this.speed
    });
  }
}
