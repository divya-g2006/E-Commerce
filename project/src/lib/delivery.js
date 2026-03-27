export const EXPECTED_DELIVERY_DAYS = 9;

export function getExpectedDeliveryDate(createdAt, days = EXPECTED_DELIVERY_DAYS) {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  return new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isDelayed(createdAt, now = new Date(), days = EXPECTED_DELIVERY_DAYS) {
  const expected = getExpectedDeliveryDate(createdAt, days);
  if (!expected) return false;
  return now.getTime() > expected.getTime();
}

export function getDisplayStatus(status, createdAt, now = new Date(), days = EXPECTED_DELIVERY_DAYS) {
  if (status === 'Completed') return 'Completed';
  if (isDelayed(createdAt, now, days)) return 'Out for Delivery';
  return status;
}

export function getOrderMessage(status, createdAt, now = new Date(), days = EXPECTED_DELIVERY_DAYS) {
  const displayStatus = getDisplayStatus(status, createdAt, now, days);
  if (displayStatus === 'Completed') return 'Order successfully completed';
  if (displayStatus === 'Out for Delivery') return 'Out for delivery';
  return 'Product processing for delivery';
}
