"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SignInParams, SignUpParams, User } from "@/types";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("__session", sessionCookie, {
    maxAge: SESSION_DURATION,
    expires: new Date(Date.now() + SESSION_DURATION * 1000),
    httpOnly: true,
    secure: true, // Force true for production/Vercel
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email, role = "user" } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: true,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      role,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: unknown) {
    // Changed 'any' to 'unknown'
    console.error("Error creating user:", error);
    let errorMessage = "Failed to create account. Please try again.";

    // Handle Firebase specific errors if 'error' is an object with a 'code' property
    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string; message?: string };
      if (firebaseError.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "This email is already in use",
        };
      }
      // Use the Firebase error message if available
      errorMessage = firebaseError.message || errorMessage;
    } else if (error instanceof Error) {
      // Use standard Error message if available
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
    revalidatePath("/");
  } catch (error: unknown) {
    // Changed 'any' to 'unknown'
    console.log(error); // Logging the error for debugging

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (sessionCookie) {
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      console.error("Error revoking session:", error);
    }
  }

  cookieStore.delete("__session");
  revalidatePath("/");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, false);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error: unknown) {
    // Changed 'any' to 'unknown'
    console.error("Session verification failed:", error); // Changed log to error

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function applyMentorRole(uid: string) {
  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return { success: false, message: "User not found." };
    }

    await userRef.update({ role: "mentor" });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message };
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
