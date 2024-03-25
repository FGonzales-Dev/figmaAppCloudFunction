import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
// const collectionName = "subscriptions";
const firestore = admin.firestore();
export const getFirestoreCollection = functions.https.onRequest(
  async (request, response) => {
    try {
      const snapshot = await db.collection("user").get();
      const data = snapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));
      data.forEach((user) => {
        console.log("user.id"+ user.id);
      });
      response.json({success: true, data});
    } catch (error) {
      console.error(error);
      response.status(500).json(
        {success: false, error: "Internal Server Error"});
    }
  });

export const getTestData =
functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  try {
    // Get the main collection
    const mainCollectionRef = firestore.collection("user");
    const mainCollectionSnapshot = await mainCollectionRef.get();
    const mainCollectionData = mainCollectionSnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));
    mainCollectionData.forEach((data) => {
          console.log("mainDoc.id"+ data.id);
    });
    const result = await Promise.all(mainCollectionData.map(async (mainDoc) => {
      try {
        mainCollectionData.forEach(async (data) => {
          const userRef = firestore.collection("user").doc(data.id);
          const subcollectionRef = mainCollectionRef.doc(data.id).collection("profile");
          const subcollectionSnapshot = await subcollectionRef.get();
          const profileData = subcollectionSnapshot.docs.map((doc) => doc.data());
          userRef.set({
             email: profileData[0].email,
             name: profileData[0].name,
        });
       });
      } catch (error) {
        console.error("Error moving profile:", error);
        return null;
    }

      return {
        mainCollectionData,
      };
    }));
    res.json({success: true, result});
  } catch (error) {
    res.json({success: true, error});
    console.error("Error:", error);
  }
});


export const getTestData2 = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  try {
      // Get the main collection
      const mainCollectionRef = firestore.collection("user");
      const mainCollectionSnapshot = await mainCollectionRef.get();
      const mainCollectionData = mainCollectionSnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
      }));
      for (const doc of mainCollectionData) {
          try {
              const subcollectionRef = mainCollectionRef.doc(doc.id).collection("profile");
              const subcollectionSnapshot = await subcollectionRef.get();
              const profileData = subcollectionSnapshot.docs.map((doc) => doc.data())[0]; // Assuming only one document in profile collection
              await mainCollectionRef.doc(doc.id).set({
                  email: profileData.email,
                  name: profileData.name,
              }, {merge: true}); // Merge data instead of overwriting
              console.log(`Profile moved for user ${doc.id}`);
          } catch (error) {
              console.error(`Error moving profile for user ${doc.id}:`, error);
              // Handle errors gracefully
          }
      }
      res.json({success: true, message: "Data migration successful"});
  } catch (error) {
      res.status(500).json({success: false, message: "Internal server error"});
      console.error("Error:", error);
  }
});

export const copyUserId = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  try {
      // Get the main collection
      const mainCollectionRef = firestore.collection("user");
      const mainCollectionSnapshot = await mainCollectionRef.get();
      const mainCollectionData = mainCollectionSnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
      }));
      for (const doc of mainCollectionData) {
          try {
              const subcollectionRef = mainCollectionRef.doc(doc.id).collection("url");
              const subcollectionSnapshot = await subcollectionRef.get();
              subcollectionSnapshot.forEach(async (urlDoc) => {
                await urlDoc.ref.update({
                    userId: doc.id,
                });
            });
              // const profileData = subcollectionSnapshot.docs.map((doc) => doc.data())[0]; // Assuming only one document in profile collection
              // await mainCollectionRef.doc(doc.id).set({
              //     email: profileData.email,
              //     name: profileData.name,
              // }, {merge: true}); // Merge data instead of overwriting
              // console.log(`Profile moved for user ${doc.id}`);
          } catch (error) {
              console.error(`Error moving profile for user ${doc.id}:`, error);
              // Handle errors gracefully
          }
      }
      res.json({success: true, message: "Data migration successful"});
  } catch (error) {
      res.status(500).json({success: false, message: "Internal server error"});
      console.error("Error:", error);
  }
});
