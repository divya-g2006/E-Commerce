export const EXPECTED_DELIVERY_DAYS = 9;

export const getExpectedDeliveryDate = (createdAt, days = EXPECTED_DELIVERY_DAYS) => {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  return new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
};

export const isDelayedOrder = (createdAt, now = new Date(), days = EXPECTED_DELIVERY_DAYS) => {
  const expected = getExpectedDeliveryDate(createdAt, days);
  if (!expected) return false;
  return now.getTime() > expected.getTime();
};

