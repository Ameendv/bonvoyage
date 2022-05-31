const bcrypt = require("bcrypt");
const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");

module.exports = {
  doLogin: (data) =>
    new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ name: data.name, password: Number(data.password) })
        .then((state) => {
          if (state) {
            console.log(state, "admin Logged");
            resolve(state);
          } else {
            console.log(state, "ghj", data.name, data.password);
            resolve(state);
          }
        });
    }),
  getVendors: () =>
    new Promise(async (resolve, reject) => {
      const vendors = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .find()
        .toArray();
      resolve(vendors);
    }),
  getUsers: () =>
    new Promise(async (resolve, reject) => {
      const users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    }),
  getRooms: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      const rooms = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          { $match: { _id: ObjectId(vendorId) } },
          { $unwind: "$rooms" },
        ])
        .toArray();
      console.log(rooms);
      resolve(rooms);
    });
  },
  doBlock: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          { $set: { isBlocked: true } },
          { upsert: true }
        )
        .then((status) => {
          resolve(status);
        });
    });
  },
  doUnblock: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: ObjectId(userId) }, { $set: { isBlocked: false } })
        .then((status) => {
          resolve(status);
        });
    });
  },
};
