var getOrderStateGroup = function () {
  return {
    AWAITING_DISPATCH: 1,
    IN_TRANSMISSION: 2,
    DELIVERED: 3,
    CANCELLED: 4,
    IN_PROGRESS: 5,
  };
};
export { getOrderStateGroup };
