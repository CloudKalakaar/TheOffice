// ============================================
// THE OFFICE — Random Name Generator
// ============================================

const FIRST_NAMES = [
  // Male
  'James', 'Robert', 'Michael', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul', 'Andrew', 'Kevin',
  'Brian', 'Eric', 'Nathan', 'Ryan', 'Tyler', 'Brandon', 'Jason', 'Justin',
  'Aaron', 'Adam', 'Benjamin', 'Carlos', 'Derek', 'Frank', 'Greg', 'Henry',
  'Ivan', 'Jake', 'Kyle', 'Leo', 'Marcus', 'Neil', 'Oscar', 'Patrick',
  // Female
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica',
  'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley',
  'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie',
  'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley',
  'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine',
  'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
  'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia', 'Victoria', 'Kelly',
  'Lauren', 'Christina', 'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl',
  'Hannah', 'Jacqueline', 'Martha', 'Gloria', 'Teresa', 'Ann', 'Sara', 'Madison',
  'Frances', 'Kathryn', 'Janice', 'Jean', 'Abigail', 'Alice', 'Judy', 'Sophia',
  'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella',
  'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Marie', 'Kayla', 'Alexis',
  'Lori', 'Priya', 'Wei', 'Aisha', 'Yuki', 'Fatima', 'Mei', 'Zara', 'Sana'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Turner', 'Phillips', 'Evans', 'Collins', 'Stewart',
  'Morris', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Cooper',
  'Richardson', 'Cox', 'Howard', 'Ward', 'Brooks', 'Gray', 'Chen', 'Kim',
  'Patel', 'Singh', 'Kumar', 'Shah', 'Tanaka', 'Yamamoto', 'Müller', 'Fischer',
  'Weber', 'Schmidt', 'Rossi', 'Ferrari', 'Bianchi', 'Sato', 'Suzuki', 'Park'
];

/** Set of already used names to avoid duplicates */
const usedNames = new Set();

/**
 * Generate a random full name
 * @returns {{ firstName: string, lastName: string, fullName: string }}
 */
export function generateName() {
  let attempts = 0;
  let fullName;
  let firstName;
  let lastName;

  do {
    firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    fullName = `${firstName} ${lastName}`;
    attempts++;
  } while (usedNames.has(fullName) && attempts < 100);

  usedNames.add(fullName);
  return { firstName, lastName, fullName };
}

/**
 * Reset used names (for new game)
 */
export function resetNames() {
  usedNames.clear();
}

/**
 * Generate a character bio snippet inspired by The Office
 * @param {string} personality - Personality type ID
 * @returns {string}
 */
export function generateBio(personality) {
  const bios = {
    enthusiastic: [
      "Believes they're the world's greatest boss. Organizes improv sessions at lunch.",
      "Has a 'World\'s Best Employee' mug they bought for themselves.",
      "Starts every meeting with an awkward ice breaker.",
      "Once declared 'bankruptcy' by just shouting it in the office."
    ],
    deadpan: [
      "Has been doing crossword puzzles at their desk since 2003.",
      "Leaves at exactly 5:00 PM. Not 5:01. Not 4:59.",
      "Their favorite day is 'Pretzel Day'.",
      "Responds to most questions with a long, silent stare."
    ],
    perfectionist: [
      "Color-codes everything. Including their lunch containers.",
      "Has reported 47 dress code violations this quarter.",
      "Maintains a spreadsheet tracking everyone's break times.",
      "Their desk is surgically organized. Touch nothing."
    ],
    prankster: [
      "Once put a colleague's stapler in Jello. Twice.",
      "Looks directly at the camera when something absurd happens.",
      "Master of the slow-burn desk prank.",
      "Can sell anything to anyone. Chooses not to try too hard."
    ],
    eccentric: [
      "Assistant TO the Regional Manager. Not 'Assistant Regional Manager.'",
      "Owns a beet farm. Will tell you about it. Repeatedly.",
      "Has a black belt in karate. And a desk full of weapons.",
      "Runs fire drills without warning. Brings their own smoke machine."
    ],
    peacemaker: [
      "The emotional backbone of the office. Makes great art.",
      "Remembers everyone's birthday and favorite coffee order.",
      "Mediates 90% of office conflicts with quiet diplomacy.",
      "Keeps a candy jar on their desk for visitors."
    ],
    party_planner: [
      "Has planned 200+ office parties. Each one with a theme.",
      "The Party Planning Committee is their life's work.",
      "Once organized a Casino Night fundraiser in the warehouse.",
      "Takes potlucks very, very seriously."
    ],
    know_it_all: [
      "Actually IS the smartest person in the room. Will let you know.",
      "Corrects grammar in casual conversations.",
      "Has an opinion on everything. Usually right. Annoyingly.",
      "Reads The Economist during lunch. Judges those who don't."
    ],
    newbie: [
      "Still figuring out how the printer works.",
      "Takes notes during every single meeting. Even the bad ones.",
      "Eager to please. Accidentally CC'd all-staff on a private email.",
      "Started a blog about their first job. Nobody reads it."
    ],
    sweetheart: [
      "Brings homemade cookies every Friday.",
      "Laughs at everyone's jokes, even the bad ones. Especially the bad ones.",
      "Has a collection of desk plants, each with a name.",
      "Once cried during a team-building exercise. Happy tears."
    ]
  };

  const personalityBios = bios[personality] || bios.newbie;
  return personalityBios[Math.floor(Math.random() * personalityBios.length)];
}

export default { generateName, resetNames, generateBio };
