const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const collection = require('../config/collection');

module.exports = {
  doLogin: (data) => new Promise(async (resolve, reject) => {
    db.get()
      .collection(collection.ADMIN_COLLECTION)
      .findOne({ name: data.name, password: Number(data.password) })
      .then((state) => {
        if (state) {
          console.log(state, 'admin Logged');
          resolve(state);
        } else {

          resolve(state);
        }
      });
  }),
  getVendors: () => new Promise(async (resolve, reject) => {
    const vendors = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .find()
      .toArray();
    resolve(vendors);
  }),
  getUsers: () => new Promise(async (resolve, reject) => {
    const users = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .find()
      .toArray();
    resolve(users);
  }),
  getRooms: (vendorId) => new Promise(async (resolve, reject) => {
    const rooms = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([
        { $match: { _id: ObjectId(vendorId) } },
        { $unwind: '$rooms' },
      ])
      .toArray();
    console.log(rooms);
    resolve(rooms);
  }),
  doBlock: (userId) => new Promise(async (resolve, reject) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectId(userId) },
        { $set: { isBlocked: true } },
        { upsert: true },
      )
      .then((status) => {
        resolve(status);
      });
  }),
  doUnblock: (userId) => new Promise(async (resolve, reject) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne({ _id: ObjectId(userId) }, { $set: { isBlocked: false } })
      .then((status) => {
        resolve(status);
      });
  }),
  acceptVendor: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne({ _id: ObjectId(hotelId) }, { $set: { isApproved: true } })
        .then((status) => {
          if (status) resolve(status);
          else {
            reject(error);
          }
        });
    });
  },
  rejectVendor: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { _id: ObjectId(hotelId) },
          { $set: { isApproved: 'rejected' } },
        )
        .then((status) => {
          if (status) resolve(status);
          else reject(error);
        });
    });
  },
  blockVendor: (hotelId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne({ _id: ObjectId(hotelId) }, { $set: { isBlocked: true } })
        .then((status) => {
          if (status) resolve(status);
          else reject(error);
        });
    });
  },
  unBlockVendor: (hotelId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne({ _id: ObjectId(hotelId) }, { $set: { isBlocked: false } })
        .then((status) => {
          if (status) resolve(status);
          else reject(error);
        });
    });
  },
  viewBookings: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      const bookings = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $unwind: '$bookings',
          },
          {
            $match: { 'bookings.hotelId': ObjectId(hotelId) },
          },
        ])
        .toArray();
        if(bookings){
          resolve(bookings)
        }else{
          reject(error)
        }
      
    });
  },
};
