"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubscriptions = exports.removeSubscription = exports.saveSubscription = void 0;
/** Keyed by Push endpoint so browsers can (re)subscribe without a separate user id. */
const subscriptions = new Map();
const saveSubscription = (subscription) => {
    subscriptions.set(subscription.endpoint, subscription);
};
exports.saveSubscription = saveSubscription;
const removeSubscription = (endpoint) => {
    subscriptions.delete(endpoint);
};
exports.removeSubscription = removeSubscription;
const getAllSubscriptions = () => {
    return Array.from(subscriptions.values());
};
exports.getAllSubscriptions = getAllSubscriptions;
//# sourceMappingURL=push.store.js.map