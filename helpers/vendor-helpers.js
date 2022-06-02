const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const collection = require('../config/collection');

module.exports = {
  doSignup: (vendorData) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      vendorData.password = await bcrypt.hash(vendorData.password, 10);
      vendorData.cPassword = null;

      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .findOne({ email: vendorData.email })
        .then((state) => {
          if (state) {
            response.exists = true;
            resolve(response);
          } else {
            vendorData.isApproved = false;
            vendorData.isBlocked = false;
            db.get()
              .collection(collection.VENDOR_COLLECTION)
              .insertOne(vendorData)
              .then((data) => {
                response.entered = true;
                response.id = data.insertedId;
                response.user = vendorData.name;
                resolve(response);
              });
          }
        });
    });
  },
  doLogin: (vendorData) => new Promise(async (resolve, reject) => {
    const vendor = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .findOne({ email: vendorData.email });
    const response = {};
    if (vendor) {
      bcrypt.compare(vendorData.password, vendor.password).then((state) => {
        if (state) {
          response.logged = true;
          response.user = vendor.name;
          response.id = vendor._id;

          resolve(response);
        } else {
          response.passwordErr = true;
          resolve(response);
        }
      });
    } else {
      response.emailErr = true;
      resolve(response);
    }
  }),
  addRooms: (roomData, hotelId) => new Promise(async (resolve, reject) => {
    roomData.roomId = ObjectId();
    roomData.isAvailable = true;
    category = roomData.category;
    db.get()
      .collection(collection.VENDOR_COLLECTION)
      .updateOne(
        { _id: ObjectId(hotelId) },
        {
          $push: {
            rooms: { ...roomData },
          },
        },
        { upsert: true },
      )
      .then((data) => {
        data.roomId = roomData.roomId;
        resolve(data);
      });
  }),
  getRooms: (hotelId) => new Promise(async (resolve, reject) => {
    const rooms = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([
        {
          $match: { _id: ObjectId(hotelId) },
        },
        {
          $unwind: '$rooms',
        },
      ])
      .toArray();

    resolve(rooms);
  }),
  editRoom: (roomId) => new Promise(async (resolve, reject) => {
    const room = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([
        {
          $unwind: '$rooms',
        },
        {
          $match: { 'rooms.roomId': ObjectId(roomId) },
        },
      ])
      .toArray();
    resolve(room);
  }),
  updateRoom: (roomData, roomId) => new Promise(async (resolve, reject) => {
    roomData.isAvailable = true;
    roomData.roomId = ObjectId(roomId);
    db.get()
      .collection(collection.VENDOR_COLLECTION)
      .updateOne(
        {
          'rooms.roomId': ObjectId(roomId),
        },
        {
          $set: {
            'rooms.$': { ...roomData },
          },
        },
      )
      .then((response) => {
        resolve(response);
      });
  }),
  getBookings: (vendorId) => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$bookings',
        },
        {
          $match: {
            'bookings.hotelId': ObjectId(vendorId),
          },
        },
        {
          $project: {
            password: 0,
            cPassword: 0,
          },
        },
      ])
      .toArray();
    resolve(bookings);
  }),
  deleteRoom: (roomId) => new Promise((resolve, reject) => {
    db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .updateMany(
        { 'rooms.roomId': ObjectId(roomId) },
        { $pull: { rooms: { roomId: ObjectId(roomId) } } }).then((status) => {
          resolve(status)
        });
  }),
};
