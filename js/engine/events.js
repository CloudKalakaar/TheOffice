/**
 * @module engine/events
 */

export const EVENTS = [
  { id: 'coffee_run', name: 'Coffee Run', description: 'Someone makes a coffee run', emoji: '☕', probability: 0.05, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(5) },
  { id: 'printer_jam', name: 'Printer Jam', description: 'Printer is jammed again', emoji: '🖨️', probability: 0.03, duration: 2, type: 'disruptive', effect: (emp) => emp.updateProductivity(-5) },
  { id: 'birthday_party', name: 'Birthday Party', description: 'It\'s someone\'s birthday', emoji: '🎂', probability: 0.01, duration: 1, type: 'fun', effect: (emp) => { emp.updateMood(10); emp.updateProductivity(-5); } },
  { id: 'fire_drill', name: 'Fire Drill', description: 'Fire drill!', emoji: '🔥', probability: 0.01, duration: 1, type: 'disruptive', effect: (emp) => emp.setStatus('idle') },
  { id: 'pizza_day', name: 'Pizza Day', description: 'Pizza in the break room', emoji: '🍕', probability: 0.02, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(15) },
  { id: 'water_cooler', name: 'Water Cooler Gossip', description: 'Water cooler gossip', emoji: '🚰', probability: 0.08, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(3) },
  { id: 'motivational_meeting', name: 'Motivational Meeting', description: 'Manager calls motivational meeting', emoji: '📢', probability: 0.04, duration: 1, type: 'productive', effect: (emp) => emp.updateMood(2) },
  { id: 'bug_crisis', name: 'Bug Crisis', description: 'Critical bug found in production!', emoji: '🐛', probability: 0.02, duration: 0, type: 'disruptive', effect: (emp) => emp.updateMood(-5) },
  { id: 'client_praise', name: 'Client Praise', description: 'Client sends praise email', emoji: '⭐', probability: 0.02, duration: 0, type: 'productive', effect: (emp) => { emp.updateMood(10); emp.updateProductivity(5); } },
  { id: 'internet_outage', name: 'Internet Outage', description: 'Internet is down', emoji: '📡', probability: 0.01, duration: 2, type: 'disruptive', effect: (emp) => { emp.setStatus('blocked'); emp.updateProductivity(-10); } },
  { id: 'team_lunch', name: 'Team Lunch', description: 'Team lunch outing', emoji: '🍽️', probability: 0.02, duration: 1, type: 'fun', effect: (emp) => emp.updateMood(8) },
  { id: 'standup_comedy', name: 'Standup Comedy', description: 'Someone tells a joke in standup', emoji: '😂', probability: 0.05, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(5) },
  { id: 'keyboard_warrior', name: 'Keyboard Warrior', description: 'Mechanical keyboard annoys neighbors', emoji: '⌨️', probability: 0.04, duration: 0, type: 'disruptive', effect: (emp) => emp.updateMood(-3) },
  { id: 'rubber_duck', name: 'Rubber Ducking', description: 'Developer explains problem to rubber duck', emoji: '🦆', probability: 0.06, duration: 0, type: 'productive', effect: (emp) => emp.updateProductivity(10) },
  { id: 'whiteboard_session', name: 'Whiteboard Session', description: 'Impromptu whiteboard brainstorming', emoji: '📋', probability: 0.05, duration: 1, type: 'productive', effect: (emp) => emp.updateProductivity(5) }
];

let eventLog = [];

/**
 * OfficeEvents manages random office events.
 */
export class OfficeEvents {
  /**
   * Randomly picks an event based on probability
   * @param {number} currentTick 
   * @returns {Object|null}
   */
  static rollForEvent(currentTick) {
    for (const event of EVENTS) {
      if (Math.random() < event.probability) {
        return event;
      }
    }
    return null;
  }

  /**
   * Applies event effects to employees
   * @param {Object} event 
   * @param {Array<Object>} employees 
   * @returns {Object}
   */
  static applyEvent(event, employees) {
    let affectedEmployees = [];
    
    if (['coffee_run', 'birthday_party', 'fire_drill', 'pizza_day', 'client_praise', 'internet_outage', 'team_lunch'].includes(event.id)) {
      affectedEmployees = employees;
    } else {
      // Pick 1-3 random employees for other events
      const numAffected = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...employees].sort(() => 0.5 - Math.random());
      affectedEmployees = shuffled.slice(0, numAffected);
    }

    affectedEmployees.forEach(emp => event.effect(emp));
    
    const record = {
      event,
      affectedCount: affectedEmployees.length,
      timestamp: new Date()
    };
    eventLog.push(record);
    
    return {
      event,
      affectedEmployees,
      description: `${event.emoji} ${event.name}: ${event.description}`
    };
  }

  /**
   * Returns array of past events
   * @returns {Array<Object>}
   */
  static getEventLog() {
    return eventLog;
  }
}
