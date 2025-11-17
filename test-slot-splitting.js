/**
 * Test unitaire pour la fonction de découpage des créneaux
 * Ce fichier peut être exécuté avec : node test-slot-splitting.js
 */

function splitSlotsAtMidnight(slots) {
  const today = [];
  const nextDay = [];

  for (const slot of slots) {
    const [start, end] = slot.split("-");

    // Cas spécial : créneau se terminant exactement à minuit (ex: 20:00-00:00)
    if (end === "00:00") {
      today.push(slot);
      continue;
    }

    // Si start > end, le créneau traverse minuit
    if (start > end) {
      // Découper: de start à 23:59 pour aujourd'hui
      today.push(`${start}-23:59`);
      // Découper: de 00:00 à end pour le jour suivant
      nextDay.push(`00:00-${end}`);
    } else {
      // Créneau normal dans la même journée
      today.push(slot);
    }
  }

  return { today, nextDay };
}

// Tests
console.log("🧪 Test de découpage des créneaux traversant minuit\n");

const tests = [
  {
    name: "Créneau normal (9h-17h)",
    input: ["09:00-17:00"],
    expected: { today: ["09:00-17:00"], nextDay: [] }
  },
  {
    name: "Créneau traversant minuit (22h-02h)",
    input: ["22:00-02:00"],
    expected: { today: ["22:00-23:59"], nextDay: ["00:00-02:00"] }
  },
  {
    name: "Créneau traversant minuit (23h-01h)",
    input: ["23:00-01:00"],
    expected: { today: ["23:00-23:59"], nextDay: ["00:00-01:00"] }
  },
  {
    name: "Plusieurs créneaux dont un traverse minuit",
    input: ["09:00-12:00", "14:00-18:00", "20:00-02:00"],
    expected: {
      today: ["09:00-12:00", "14:00-18:00", "20:00-23:59"],
      nextDay: ["00:00-02:00"]
    }
  },
  {
    name: "Créneau de nuit complet (00h-06h)",
    input: ["00:00-06:00"],
    expected: { today: ["00:00-06:00"], nextDay: [] }
  },
  {
    name: "Créneau jusqu'à minuit (20h-00h)",
    input: ["20:00-00:00"],
    expected: { today: ["20:00-00:00"], nextDay: [] }
  },
  {
    name: "Deux créneaux traversant minuit",
    input: ["20:00-01:00", "22:00-03:00"],
    expected: {
      today: ["20:00-23:59", "22:00-23:59"],
      nextDay: ["00:00-01:00", "00:00-03:00"]
    }
  }
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  Input: ${JSON.stringify(test.input)}`);

  const result = splitSlotsAtMidnight(test.input);

  const todayMatch = JSON.stringify(result.today) === JSON.stringify(test.expected.today);
  const nextDayMatch = JSON.stringify(result.nextDay) === JSON.stringify(test.expected.nextDay);

  if (todayMatch && nextDayMatch) {
    console.log(`  ✅ PASSED`);
    console.log(`     Today: ${JSON.stringify(result.today)}`);
    console.log(`     Next day: ${JSON.stringify(result.nextDay)}`);
    passed++;
  } else {
    console.log(`  ❌ FAILED`);
    console.log(`     Expected today: ${JSON.stringify(test.expected.today)}`);
    console.log(`     Got today: ${JSON.stringify(result.today)}`);
    console.log(`     Expected next day: ${JSON.stringify(test.expected.nextDay)}`);
    console.log(`     Got next day: ${JSON.stringify(result.nextDay)}`);
    failed++;
  }
  console.log("");
});

console.log("━".repeat(60));
console.log(`\n📊 Résultats: ${passed} tests réussis, ${failed} tests échoués\n`);

if (failed === 0) {
  console.log("✨ Tous les tests sont passés ! ✨");
  process.exit(0);
} else {
  console.log("⚠️  Certains tests ont échoué");
  process.exit(1);
}
