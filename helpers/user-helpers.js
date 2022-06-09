const bcrypt = require("bcrypt");

const { ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const { resolve } = require("path");
const db = require("../config/connection");
const collection = require("../config/collection");

const instance = new Razorpay({
  key_id: "rzp_test_pVpVEwHMBqRS5h",
  key_secret: "5f10YKqKV11JcD5tv8at39Do",
});

module.exports = {
  doSignup: (userData) =>
    new Promise(async (resolve, _) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.cPassword = null;
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email })
        .then((state) => {
          if (state) {
            state.emailExists = true;
            resolve(state);
          } else {
            userData.isBlocked = false;
            db.get()
              .collection(collection.USER_COLLECTION)
              .insertOne(userData)
              .then(async (status) => {
                const user = await db
                  .get()
                  .collection(collection.USER_COLLECTION)
                  .findOne({ _id: ObjectId(status.insertedId) });
                user.status = true;
                resolve(user);
              });
          }
        });
    }),
  doLogin: (userData) =>
    new Promise(async (resolve, reject) => {
      // const loginStatus = false;
      const response = {};
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (user) {
        bcrypt.compare(userData.password, user.password).then((state) => {
          if (state) {
            response.user = user;
            response.status = true;

            resolve(response);
          } else {
            resolve(response);
          }
        });
      } else {
        resolve(response);
      }
    }),
  getLocation: () =>
    new Promise(async (resolve, reject) => {
      const locations = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          { $unwind: "$rooms" },
          { $match: { "rooms.qty": { $gte: 1 } } },
          { $group: { _id: "$district" } },
        ])
        .toArray();
      resolve(locations);
    }),
  getRooms: (searchDatas) =>
    new Promise(async (resolve, reject) => {
      let rooms = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          { $match: { district: searchDatas.location } },
          { $unwind: "$rooms" },
          { $project: { idProof: 0 } },
        ])
        .toArray();
      let bookedRooms = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          { $unwind: "$bookings" },
          {
            $match: {
              $or: [
                {
                  $and: [
                    { "bookings.checkOut": { $lte: searchDatas.checkOut } },
                    { "bookings.checkIn": { $gte: searchDatas.checkIn } },
                  ],
                },
                {
                  $and: [
                    { "bookings.checkOut": { $gte: searchDatas.checkOut } },
                    { "bookings.checkIn": { $lte: searchDatas.checkIn } },
                  ],
                },
              ],
            },
          },
          { $project: { bookings: 1 } },
        ])
        .toArray();
      console.log(rooms,'rooms',bookedRooms,"booked")
      
      for (const x in rooms) {
        for (const y in bookedRooms) {
          if (rooms[x].rooms.roomId.equals(bookedRooms[y].bookings.roomId)) {
            //  rooms[x].rooms.bookingCount=count++
            
            rooms[x].rooms.remainingQty =
              rooms[x].rooms.qty - bookedRooms[y].bookings.roomCount;
              if(rooms[x].rooms.remainingQty==0){
                rooms.splice(x,1)
              }
          } 
        }
      }
      
      resolve(rooms)
    }),
  getRoomDetails: (roomId) =>
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
  doBookings: (details, userId) =>
    new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $push: {
              bookings: { ...details },
            },
          },
          { upsert: true }
        )
        .then((status) => {
          
          resolve(status);
        });
    }),
  updateQty: (details) =>
    new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          {
            "rooms.roomId": ObjectId(details.roomId),
          },
          {
            $inc: {
              "rooms.$.qty": -1,
              "rooms.$.bookingCount": 1,
            },
          }
        )
        .then((status) => {
          if (status) {
            db.get()
              .collection(collection.VENDOR_COLLECTION)
              .updateOne(
                { "rooms.qty": { $lt: 1 } },
                {
                  $set: { "rooms.$.isAvailable": false },
                }
              );
          }
          resolve(status);
        });
    }),
  generateRazorpay: (orderId, totalPrice) =>
    new Promise((resolve, reject) => {
      const Razorpay = require("razorpay");

      const options = {
        amount: totalPrice, // amount in the smallest currency unit
        currency: "INR",
        receipt: `${orderId}`,
      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    }),
  verifyPayment: (details) =>
    new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "5f10YKqKV11JcD5tv8at39Do");
      hmac.update(
        `${details["payment[razorpay_order_id]"]}|${details["payment[razorpay_payment_id]"]}`
      );
      hmac = hmac.digest("hex");

      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        console.log(err);
        reject(err);
      }
    }),
  changePaymentStatus: (bookingId, paymentId) =>
    new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          {
            "bookings.bookingId": ObjectId(bookingId),
          },
          {
            $set: {
              "bookings.$.bookingStatus": "confirmed",
              "bookings.$.paymentId": paymentId,
            },
          }
        )
        .then((status) => {
          resolve(status);
        });
    }),
  getProfile: (userId) =>
    new Promise(async (resolve, reject) => {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      resolve(user);
    }),
  updateProfile: (data, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              name: data.name,
              number: data.number,
              email: data.email,
              country: data.country,
              state: data.state,
              district: data.district,
            },
          }
        )
        .then((status) => {
          resolve(status);
        });
    });
  },
  getBookings: (userId) =>
    new Promise(async (resolve, reject) => {
      const bookings = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      resolve(bookings);
    }),
  cancelBooking: (bookingId) =>
    new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          {
            "bookings.bookingId": ObjectId(bookingId),
          },
          {
            $set: {
              "bookings.$.bookingStatus": "cancelled",
            },
          }
        )
        .then((status) => {
          resolve(status);
        });
    }),
};
