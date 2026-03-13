/**
 * Firebase infrastructure — public API
 *
 * Import from this barrel when wiring Firebase services into feature slices
 * or application-layer use cases.
 *
 * @example
 * import { getFirebaseAuth } from "@/shared-infra/firebase";
 * import { getFirestoreDb }  from "@/shared-infra/firebase";
 */

export { getFirebaseApp } from "./app";
export { getFirebaseAuth, GoogleAuthProvider, GithubAuthProvider, EmailAuthProvider } from "./auth";
export {
  getFirestoreDb,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "./firestore";
export {
  getFirebaseStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type StorageReference,
  type UploadTask,
  type UploadMetadata,
} from "./storage";
export { getFirebaseMessaging, requestFcmToken, onMessage } from "./messaging";
export {
  getFirebaseAnalytics,
  logEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from "./analytics";
export { initAppCheck } from "./app-check";
export { getFirebaseDatabase, dbRef, get, set, update, remove, push, onValue, off, rtdbServerTimestamp, type DataSnapshot, type DatabaseReference, type Unsubscribe } from "./database";