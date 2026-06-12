/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Workspace scope for full read/write Drive access as requested by the user
provider.addScope("https://www.googleapis.com/auth/drive");

// Flag to track sign-in progress
let isSigningIn = false;
// Cache the access token in client memory ONLY, as security policy mandates
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Registers callbacks for state changes.
export const initDriveAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  // Try retrieving from session token cache if page refreshed within the same session
  const sessionToken = sessionStorage.getItem("gdrive_access_token");
  if (sessionToken) {
    cachedAccessToken = sessionToken;
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      sessionStorage.removeItem("gdrive_access_token");
      onAuthFailure();
    }
  });
};

// Sign in with Google Popup and capture Drive access tokens
export const googleSignInForDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to capture critical access token from Google Credentials Provider.");
    }

    cachedAccessToken = credential.accessToken;
    // Session caching helps withstand mild page transitions cleanly
    sessionStorage.setItem("gdrive_access_token", cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Firebase Sign In Exception:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieves modern token cached in client-memory safely
export const getCachedAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    cachedAccessToken = sessionStorage.getItem("gdrive_access_token");
  }
  return cachedAccessToken;
};

// Standard safe signOut routine
export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  sessionStorage.removeItem("gdrive_access_token");
};

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

// Lists PDF, TXT or custom resume files from Google Drive
export async function listDriveFiles(accessToken: string): Promise<DriveFile[]> {
  const query = "mimeType = 'application/pdf' or mimeType = 'text/plain' or name contains 'resume' or name contains 'cv'";
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=40&q=${encodeURIComponent(
    `trashed = false and (${query})`
  )}&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive list failed: ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

// Download file metadata and body content from Google Drive
export async function downloadDriveFile(
  accessToken: string,
  fileId: string
): Promise<{ blob: Blob; name: string; mimeType: string }> {
  // First, get the filename and mimetype
  const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`;
  const metaResponse = await fetch(metaUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!metaResponse.ok) {
    throw new Error("Failed to fetch file metadata from Drive.");
  }

  const metadata = await metaResponse.json();

  // Next, fetch media stream content
  const mediaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const mediaResponse = await fetch(mediaUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!mediaResponse.ok) {
    throw new Error("Failed to download media content from Google Drive.");
  }

  const blob = await mediaResponse.blob();
  return {
    blob,
    name: metadata.name,
    mimeType: metadata.mimeType,
  };
}

// Uploads document to Google Drive using secure multipart encoding
export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  content: string | Blob
): Promise<{ id: string; name: string }> {
  const boundary = "314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const contentBlob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;

  // Let's read contentBlob as an ArrayBuffer or binary string to formulate valid multipart payload safely
  const reader = new FileReader();
  const binaryContentPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(contentBlob);
  });

  const arrayBuffer = await binaryContentPromise;

  // Construct binary headers
  const headerText = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}${delimiter}Content-Type: ${mimeType}\r\n\r\n`;
  
  const footerText = `${closeDelimiter}`;

  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(headerText);
  const footerBytes = encoder.encode(footerText);

  // Combine bytes
  const combinedBuffer = new Uint8Array(headerBytes.length + arrayBuffer.byteLength + footerBytes.length);
  combinedBuffer.set(headerBytes, 0);
  combinedBuffer.set(new Uint8Array(arrayBuffer), headerBytes.length);
  combinedBuffer.set(footerBytes, headerBytes.length + arrayBuffer.byteLength);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: combinedBuffer,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed: ${errorText}`);
  }

  return response.json();
}
