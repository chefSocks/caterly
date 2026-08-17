import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient();

function at(dayOffset: number, hour: number) {
  const date = new Date();
  date.setUTCHours(hour, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date;
}

async function main() {
  await db.$transaction([
    db.recipeLine.deleteMany(),
    db.packingLine.deleteMany(),
    db.menuPackageItem.deleteMany(),
    db.menuPackage.deleteMany(),
    db.eventItem.deleteMany(),
    db.payment.deleteMany(),
    db.scheduledPayment.deleteMany(),
    db.shift.deleteMany(),
    db.task.deleteMany(),
    db.event.deleteMany(),
    db.lead.deleteMany(),
    db.client.deleteMany(),
    db.staff.deleteMany(),
    db.venue.deleteMany(),
    db.menuItem.deleteMany(),
  ]);

  const [ballroom, garden] = await Promise.all([
    db.venue.create({
      data: {
        name: "Riverside Ballroom",
        address: "18 River Rd",
        capacity: 220,
      },
    }),
    db.venue.create({
      data: { name: "Garden Pavilion", address: "44 Orchard Ln", capacity: 120 },
    }),
  ]);

  const menu = await Promise.all(
    [
      { name: "Beef tenderloin, red wine jus", category: "ENTREE", price: 34, cost: 14 },
      { name: "Herb-roasted chicken supreme", category: "ENTREE", price: 26, cost: 9 },
      { name: "Wild mushroom risotto (v)", category: "ENTREE", price: 24, cost: 7 },
      { name: "Seared salmon, lemon beurre blanc", category: "ENTREE", price: 30, cost: 12 },
      { name: "Bacon-wrapped scallops", category: "APPETIZER", price: 4.5, cost: 1.8, unit: "each" },
      { name: "Mini crab cakes", category: "APPETIZER", price: 4, cost: 1.5, unit: "each" },
      { name: "Caprese skewers", category: "APPETIZER", price: 3, cost: 0.9, unit: "each" },
      { name: "Garden salad, house vinaigrette", category: "SALAD", price: 7, cost: 2 },
      { name: "Caesar salad", category: "SALAD", price: 8, cost: 2.4 },
      { name: "Roasted seasonal vegetables", category: "SIDE", price: 6, cost: 1.8 },
      { name: "Garlic mashed potatoes", category: "SIDE", price: 5, cost: 1.2 },
      { name: "Chocolate torte", category: "DESSERT", price: 9, cost: 2.5 },
      { name: "Assorted mini pastries", category: "DESSERT", price: 7, cost: 2 },
      { name: "Coffee & tea service", category: "BEVERAGE", price: 3.5, cost: 0.7 },
      { name: "Sparkling wine toast", category: "BAR", price: 6, cost: 2.6 },
      { name: "Bartender", category: "LABOR", price: 45, cost: 28, unit: "per hour" },
      { name: "Server", category: "LABOR", price: 38, cost: 24, unit: "per hour" },
      { name: "Chafing dish set", category: "RENTAL", price: 25, cost: 0, unit: "each" },
      { name: "Linen tablecloth", category: "RENTAL", price: 14, cost: 4, unit: "each" },
      { name: "China & flatware setting", category: "RENTAL", price: 9, cost: 3 },
    ].map((item) =>
      db.menuItem.create({
        data: {
          name: item.name,
          category: item.category as never,
          price: item.price,
          cost: item.cost,
          unit: item.unit ?? "per person",
        },
      }),
    ),
  );

  const byName = (name: string) => menu.find((item) => item.name.startsWith(name))!;

  await db.recipeLine.createMany({
    data: [
      { menuItemId: byName("Beef tenderloin").id, ingredient: "Beef tenderloin", quantity: 220, unit: "g" },
      { menuItemId: byName("Beef tenderloin").id, ingredient: "Red wine", quantity: 60, unit: "ml" },
      { menuItemId: byName("Beef tenderloin").id, ingredient: "Shallots", quantity: 25, unit: "g" },
      { menuItemId: byName("Herb-roasted chicken").id, ingredient: "Chicken supreme", quantity: 240, unit: "g" },
      { menuItemId: byName("Herb-roasted chicken").id, ingredient: "Fresh thyme", quantity: 3, unit: "g" },
      { menuItemId: byName("Garlic mashed").id, ingredient: "Yukon potatoes", quantity: 200, unit: "g" },
      { menuItemId: byName("Garlic mashed").id, ingredient: "Cream", quantity: 40, unit: "ml" },
      { menuItemId: byName("Garden salad").id, ingredient: "Mixed greens", quantity: 80, unit: "g" },
      { menuItemId: byName("Chocolate torte").id, ingredient: "Dark chocolate", quantity: 60, unit: "g" },
    ],
  });

  await db.packingLine.createMany({
    data: [
      { menuItemId: byName("Beef tenderloin").id, equipment: "Full-size chafer", quantity: 0.02, unit: "ea" },
      { menuItemId: byName("Garlic mashed").id, equipment: "Half-size chafer", quantity: 0.02, unit: "ea" },
      { menuItemId: byName("Coffee & tea").id, equipment: "Coffee urn", quantity: 0.01, unit: "ea" },
      { menuItemId: byName("China & flatware").id, equipment: "Dinner plate", quantity: 1, unit: "ea" },
      { menuItemId: byName("China & flatware").id, equipment: "Flatware set", quantity: 1, unit: "ea" },
      { menuItemId: byName("Bacon-wrapped scallops").id, equipment: "Passing tray", quantity: 0.05, unit: "ea" },
    ],
  });

  await db.menuPackage.create({
    data: {
      name: "Classic plated dinner",
      description: "Salad, choice of entrée, two sides, dessert, coffee service",
      pricePerGuest: 62,
      items: {
        create: [
          { menuItemId: byName("Caesar salad").id },
          { menuItemId: byName("Herb-roasted chicken").id },
          { menuItemId: byName("Garlic mashed").id },
          { menuItemId: byName("Roasted seasonal").id },
          { menuItemId: byName("Chocolate torte").id },
          { menuItemId: byName("Coffee & tea").id },
        ],
      },
    },
  });

  const [acme, novak, cityHospital] = await Promise.all([
    db.client.create({
      data: {
        name: "Acme Logistics",
        contactName: "Dana Reyes",
        email: "dana@acmelogistics.com",
        phone: "(555) 221-8890",
        address: "900 Industrial Pkwy",
        city: "Hamilton",
        region: "ON",
      },
    }),
    db.client.create({
      data: {
        type: "PERSON",
        name: "Novak / Bell wedding",
        contactName: "Mira Novak",
        email: "mira.novak@example.com",
        phone: "(555) 447-1122",
        city: "Burlington",
        region: "ON",
      },
    }),
    db.client.create({
      data: {
        name: "City Hospital Foundation",
        contactName: "Alan Chu",
        email: "achu@cityhospitalfdn.org",
        phone: "(555) 908-4410",
        city: "Toronto",
        region: "ON",
      },
    }),
  ]);

  const staff = await Promise.all(
    [
      { name: "Marisol Vega", position: "Chef", hourlyRate: 42 },
      { name: "Tobias Krall", position: "Sous chef", hourlyRate: 32 },
      { name: "Priya Anand", position: "Captain", hourlyRate: 28 },
      { name: "Devon Blake", position: "Server", hourlyRate: 22 },
      { name: "Lena Ortiz", position: "Bartender", hourlyRate: 25 },
    ].map((member) => db.staff.create({ data: member })),
  );

  const wedding = await db.event.create({
    data: {
      name: "Novak / Bell wedding reception",
      clientId: novak.id,
      status: "DEFINITE",
      serviceType: "PLATED",
      eventType: "Wedding",
      venueId: ballroom.id,
      room: "Grand Ballroom",
      guestCount: 140,
      startAt: at(21, 17),
      endAt: at(21, 23),
      arrivalAt: at(21, 14),
      clientNotes: "Two vegetarian plates, one gluten-free. Toast at 7:30pm.",
      kitchenNotes: "Plate salads at 5:45pm sharp.",
      staffNotes: "Black tie service. Sparkling wine poured before speeches.",
      items: {
        create: [
          { name: "Bacon-wrapped scallops", category: "APPETIZER", quantity: 280, unitPrice: 4.5, position: 1, menuItemId: byName("Bacon-wrapped scallops").id },
          { name: "Caprese skewers", category: "APPETIZER", quantity: 280, unitPrice: 3, position: 2, menuItemId: byName("Caprese skewers").id },
          { name: "Caesar salad", category: "SALAD", quantity: 140, unitPrice: 8, position: 3, menuItemId: byName("Caesar salad").id },
          { name: "Beef tenderloin, red wine jus", category: "ENTREE", quantity: 90, unitPrice: 34, position: 4, menuItemId: byName("Beef tenderloin").id },
          { name: "Seared salmon, lemon beurre blanc", category: "ENTREE", quantity: 40, unitPrice: 30, position: 5, menuItemId: byName("Seared salmon").id },
          { name: "Wild mushroom risotto (v)", category: "ENTREE", quantity: 10, unitPrice: 24, position: 6, menuItemId: byName("Wild mushroom").id },
          { name: "Garlic mashed potatoes", category: "SIDE", quantity: 140, unitPrice: 5, position: 7, menuItemId: byName("Garlic mashed").id },
          { name: "Roasted seasonal vegetables", category: "SIDE", quantity: 140, unitPrice: 6, position: 8, menuItemId: byName("Roasted seasonal").id },
          { name: "Chocolate torte", category: "DESSERT", quantity: 140, unitPrice: 9, position: 9, menuItemId: byName("Chocolate torte").id },
          { name: "Coffee & tea service", category: "BEVERAGE", quantity: 140, unitPrice: 3.5, position: 10, menuItemId: byName("Coffee & tea").id },
          { name: "China & flatware setting", category: "RENTAL", quantity: 140, unitPrice: 9, position: 11, menuItemId: byName("China & flatware").id },
          { name: "Bartender", category: "LABOR", quantity: 6, unitPrice: 45, position: 12, menuItemId: byName("Bartender").id },
        ],
      },
      payments: {
        create: [{ amount: 4000, method: "ACH", reference: "Deposit e-transfer" }],
      },
      scheduled: {
        create: [
          { label: "50% deposit", amount: 4000, dueAt: at(-10, 12), paid: true },
          { label: "Final balance", amount: 8500, dueAt: at(14, 12) },
        ],
      },
      shifts: {
        create: [
          { position: "Chef", startAt: at(21, 13), endAt: at(21, 23), staffId: staff[0].id },
          { position: "Captain", startAt: at(21, 15), endAt: at(21, 23), staffId: staff[2].id },
          { position: "Server", startAt: at(21, 16), endAt: at(21, 23), staffId: staff[3].id },
          { position: "Bartender", startAt: at(21, 17), endAt: at(21, 23), staffId: staff[4].id },
        ],
      },
      tasks: {
        create: [
          { title: "Confirm final guest count with Mira", dueAt: at(14, 12) },
          { title: "Order linens in blush", dueAt: at(10, 12) },
          { title: "Send BEO to venue coordinator", done: true },
        ],
      },
    },
  });

  await db.event.create({
    data: {
      name: "Acme quarterly all-hands lunch",
      clientId: acme.id,
      status: "DEFINITE",
      serviceType: "BUFFET",
      eventType: "Corporate",
      guestCount: 65,
      startAt: at(6, 12),
      endAt: at(6, 14),
      arrivalAt: at(6, 10),
      siteAddress: "900 Industrial Pkwy, Hamilton",
      serviceChargePct: 15,
      kitchenNotes: "Two nut-free trays labelled separately.",
      items: {
        create: [
          { name: "Garden salad, house vinaigrette", category: "SALAD", quantity: 65, unitPrice: 7, position: 1, menuItemId: byName("Garden salad").id },
          { name: "Herb-roasted chicken supreme", category: "ENTREE", quantity: 45, unitPrice: 26, position: 2, menuItemId: byName("Herb-roasted chicken").id },
          { name: "Wild mushroom risotto (v)", category: "ENTREE", quantity: 20, unitPrice: 24, position: 3, menuItemId: byName("Wild mushroom").id },
          { name: "Roasted seasonal vegetables", category: "SIDE", quantity: 65, unitPrice: 6, position: 4, menuItemId: byName("Roasted seasonal").id },
          { name: "Assorted mini pastries", category: "DESSERT", quantity: 65, unitPrice: 7, position: 5, menuItemId: byName("Assorted mini").id },
          { name: "Chafing dish set", category: "RENTAL", quantity: 6, unitPrice: 25, position: 6, menuItemId: byName("Chafing dish").id },
        ],
      },
      shifts: {
        create: [
          { position: "Sous chef", startAt: at(6, 9), endAt: at(6, 15), staffId: staff[1].id },
          { position: "Server", startAt: at(6, 11), endAt: at(6, 15), staffId: staff[3].id },
        ],
      },
      tasks: { create: [{ title: "Send invoice to AP", dueAt: at(8, 12) }] },
    },
  });

  await db.event.create({
    data: {
      name: "City Hospital gala — cocktail reception",
      clientId: cityHospital.id,
      status: "TENTATIVE",
      serviceType: "COCKTAIL",
      eventType: "Fundraiser",
      venueId: garden.id,
      guestCount: 200,
      startAt: at(48, 18),
      endAt: at(48, 22),
      clientNotes: "Awaiting board approval on budget.",
      items: {
        create: [
          { name: "Mini crab cakes", category: "APPETIZER", quantity: 400, unitPrice: 4, position: 1, menuItemId: byName("Mini crab cakes").id },
          { name: "Bacon-wrapped scallops", category: "APPETIZER", quantity: 400, unitPrice: 4.5, position: 2, menuItemId: byName("Bacon-wrapped scallops").id },
          { name: "Sparkling wine toast", category: "BAR", quantity: 200, unitPrice: 6, position: 3, menuItemId: byName("Sparkling wine").id },
          { name: "Server", category: "LABOR", quantity: 24, unitPrice: 38, position: 4, menuItemId: byName("Server").id },
        ],
      },
      tasks: { create: [{ title: "Follow up on board approval", dueAt: at(5, 12) }] },
    },
  });

  await db.event.create({
    data: {
      name: "Acme holiday party (last year)",
      clientId: acme.id,
      status: "COMPLETED",
      serviceType: "STATIONS",
      eventType: "Corporate",
      guestCount: 120,
      startAt: at(-120, 18),
      endAt: at(-120, 23),
      items: {
        create: [
          { name: "Mini crab cakes", category: "APPETIZER", quantity: 240, unitPrice: 4, position: 1, menuItemId: byName("Mini crab cakes").id },
          { name: "Beef tenderloin, red wine jus", category: "ENTREE", quantity: 120, unitPrice: 32, position: 2, menuItemId: byName("Beef tenderloin").id },
          { name: "Chocolate torte", category: "DESSERT", quantity: 120, unitPrice: 9, position: 3, menuItemId: byName("Chocolate torte").id },
        ],
      },
      payments: { create: [{ amount: 7800, method: "CARD", reference: "Visa ••4421" }] },
    },
  });

  await db.lead.createMany({
    data: [
      {
        contactName: "Sam Whitfield",
        companyName: "Whitfield & Co.",
        email: "sam@whitfieldco.com",
        phone: "(555) 300-7712",
        source: "Website inquiry",
        status: "NEW",
        eventDate: at(75, 18),
        guestCount: 80,
        budget: 6500,
        notes: "Client appreciation dinner, downtown venue TBD.",
      },
      {
        contactName: "Renée Dubois",
        email: "renee.dubois@example.com",
        source: "Referral",
        status: "CONTACTED",
        eventDate: at(120, 16),
        guestCount: 160,
        budget: 14000,
        notes: "Wedding, wants tasting in three weeks.",
      },
      {
        contactName: "Owen Park",
        companyName: "Northline Tech",
        email: "opark@northline.io",
        source: "Instagram",
        status: "PROPOSAL_SENT",
        eventDate: at(40, 12),
        guestCount: 45,
        budget: 3800,
        notes: "Monthly lunch program — proposal sent for pilot.",
      },
    ],
  });

  await db.task.create({
    data: { title: "Renew catering insurance certificate", dueAt: at(20, 12) },
  });

  console.log(`Seeded. Wedding event id: ${wedding.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
