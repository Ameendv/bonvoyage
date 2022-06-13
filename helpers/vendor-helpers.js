const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const db = require("../config/connection");
const collection = require("../config/collection");

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
  idUpload: (id, idProof) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { _id: id },
          { $set: { idProof: { ...idProof } } },
          { upsert: true }
        )
        .then((status) => {
          resolve(status);
        });
    });
  },
  doLogin: (vendorData) =>
    new Promise(async (resolve, reject) => {
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
            response.vendor = vendor;

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
  addRooms: (roomData, hotelId) =>
    new Promise(async (resolve, reject) => {
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
          { upsert: true }
        )
        .then((data) => {
          data.roomId = roomData.roomId;
          resolve(data);
        });
    }),
  roomUpload: (roomId, imagesData) =>
    new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { "rooms.roomId": ObjectId(roomId) },
          { $set: { "rooms.$.images": imagesData } },
          { upsert: true }
        )
        .then((status) => {
          if (status) {
            resolve(status);
          } else {
            reject(error);
          }
        });
    }),
  editRoomImage: (roomId, images) =>
    new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { "rooms.roomId": ObjectId(roomId) },
          { $set: { "rooms.$.images": images } },
          { upsert: true }
        )
        .then((status) => {
          if (status) {
            resolve(status);
          } else {
            reject(error);
          }
        });
    }),
  getRooms: (hotelId) =>
    new Promise(async (resolve, reject) => {
      const rooms = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(hotelId) },
          },
          {
            $unwind: "$rooms",
          },
        ])
        .toArray();

      resolve(rooms);
    }),
  editRoom: (roomId) =>
    new Promise(async (resolve, reject) => {
      const room = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          {
            $unwind: "$rooms",
          },
          {
            $match: { "rooms.roomId": ObjectId(roomId) },
          },
        ])
        .toArray();
      resolve(room);
    }),
  updateRoom: (roomData, roomId) =>
    new Promise(async (resolve, reject) => {
      roomData.isAvailable = true;
      roomData.roomId = ObjectId(roomId);
      console.log(roomData);
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          {
            "rooms.roomId": ObjectId(roomId),
          },
          {
            $set: {
              "rooms.$.price": roomData.price,
              "rooms.$.category": roomData.category,
              "rooms.$.actualPrice": roomData.actualPrice,
              "rooms.$.offer": roomData.offer,
              "rooms.$.ameneties": roomData.ameneties,
              "rooms.$.isAvailable": roomData.isAvailable,
              "rooms.$.roomId": roomData.roomId,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    }),
  getBookings: (vendorId) =>
    new Promise(async (resolve, reject) => {
      const bookings = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $unwind: "$bookings",
          },
          {
            $match: {
              "bookings.hotelId": ObjectId(vendorId),
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
  deleteRoom: (roomId) =>
    new Promise((resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateMany(
          { "rooms.roomId": ObjectId(roomId) },
          { $pull: { rooms: { roomId: ObjectId(roomId) } } }
        )
        .then((status) => {
          resolve(status);
        });
    }),
  getCancelled: (hotelId) =>
    new Promise(async (resolve, reject) => {
      cancelled = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $unwind: "$bookings",
          },
          {
            $match: {
              $and: [
                { "bookings.hotelId": ObjectId(hotelId) },
                { "bookings.bookingStatus": "cancelled" },
              ],
            },
          },
        ])
        .toArray();
      resolve(cancelled);
    }),
  getSales: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      const sales = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $unwind: "$bookings",
          },
          {
            $match: {
              $and: [
                { "bookings.hotelId": ObjectId(hotelId) },
                { "bookings.bookingStatus": "confirmed" },
              ],
            },
          },
          {
            $group: {
              _id: "$bookings.bookingDate",

              total: { $sum: "$bookings.billAmt" },
            },
          },
        ])
        .toArray();
      resolve(sales);
    });
  },
  getTotalSales: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      const sales = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $unwind: "$bookings",
          },
          {
            $match: {
              $and: [
                { "bookings.hotelId": ObjectId(hotelId) },
                { "bookings.bookingStatus": "confirmed" },
              ],
            },
          },
          {
            $group: {
              _id: " ",
              total: { $sum: "$bookings.billAmt" },
            },
          },
        ])
        .toArray();
      console.log(sales);
      resolve(sales);
    });
  },
  getRoomCount: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      const count = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          { $unwind: "$rooms" },
          { $match: { _id: ObjectId(hotelId) } },

          {
            $group: {
              _id: " ",
              total: { $sum: "$rooms.qty" },
            },
          },
        ])
        .toArray();
      resolve(count);
    });
  },
  getTodaysBookings: (hotelId) => {
    return new Promise(async (resolve, reject) => {

      let today = new Date();
      let year = today.getFullYear();

      let month = ("0" + (today.getMonth() + 1)).slice(-2);
      let day = today.getDate();
      const date = `${year}-${month}-${day}`;

      const bookings = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          { $unwind: "$bookings" },
          {
            $match: {
              $and: [
                { "bookings.hotelId": ObjectId(hotelId) },
                { "bookings.checkIn": { $lte: date } },
                { "bookings.checkOut": { $gte: date } },
              ],
            },
          },
        ]).toArray();
      resolve(bookings)
    })
  },
  getReservations: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      let today = new Date();
      let year = today.getFullYear();

      let month = ("0" + (today.getMonth() + 1)).slice(-2);
      let day = today.getDate();
      const date = `${year}-${month}-${day}`;

      const reservations = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          { $unwind: "$bookings" },
          {
            $match: {
              $and: [
                { "bookings.hotelId": ObjectId(hotelId) },
                { "bookings.checkIn": { $gte: date } },
                { "bookings.bookingStatus": { $ne: 'cancelled' } }

              ],
            },
          },
          {
            $group: { _id: null, total: { $sum: "$bookings.roomCount" } }
          }
        ]).toArray();
      resolve(reservations)
    })
  },
  getDailySales: (hotelId) => {
    return new Promise(async (resolve, reject) => {
      const sales = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $unwind: "$bookings",
          },
          {
            $match: {
              $and: [
                { "bookings.hotelId": ObjectId(hotelId) },
                { "bookings.bookingStatus": "confirmed" },
              ],
            },
          },
          {
            $group: {
              _id: "$bookings.bookingDate",
              total: { $sum: "$bookings.billAmt" },
            },
          },
        ])
        .toArray();
      console.log(sales);
      function compare(a, b) {
        if (a._id.split('-')[2] < b._id.split('-')[2]) {
          return -1;
        }
        if (a._id.split('-')[2] > b._id.split('-')[2]) {
          return 1;
        }
        return 0;
      }

      sales.sort(compare);
      let date = []
      let sales1 = []
      let datas = {
        date, sales1
      }
      for (const x in sales) {
        datas.date[x] = (sales[x]._id).split('-')[2],
          datas.sales1[x] = sales[x].total
      }

      resolve(datas);
    })
  }
};
