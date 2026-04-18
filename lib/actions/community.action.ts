"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

// --- FORUMS ---
export async function createForumPost(data: {
  title: string;
  author: string;
  authorId?: string;
  tag: string;
  content: string;
}) {
  try {
    const newPost = {
      ...data,
      replies: 0,
      repliesList: [],
      views: 0,
      upvotes: 0,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("community_posts").add(newPost);
    revalidatePath("/community");
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function createForumReply(
  postId: string,
  data: { content: string; author: string; authorId?: string }
) {
  try {
    const reply = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    // Get the post document
    const postRef = db.collection("community_posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return { success: false, error: "Post not found" };
    }

    const postData = postDoc.data();
    const currentReplies = postData?.repliesList || [];
    const updatedReplies = [
      ...currentReplies,
      { id: Date.now().toString(), ...reply },
    ];

    // Update the post with the new reply
    await postRef.update({
      replies: updatedReplies.length,
      repliesList: updatedReplies,
    });

    revalidatePath("/community");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getForumPosts() {
  try {
    const snapshot = await db
      .collection("community_posts")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

// --- STARTUPS ---
export async function createStartupPitch(data: {
  title: string;
  founder: string;
  founderId: string;
  roles: string[];
  stage: string;
  description: string;
}) {
  try {
    const newStartup = {
      ...data,
      members: 1,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("startups").add(newStartup);
    revalidatePath("/community");
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getStartups() {
  try {
    const snapshot = await db
      .collection("startups")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

// --- MENTORSHIP BOOKING ---
export async function bookMentor(data: {
  mentorId: number;
  mentorName: string;
  userId: string;
  userName: string;
  date: string;
  topic: string;
}) {
  try {
    const newBooking = {
      ...data,
      status: "Scheduled",
      createdAt: new Date().toISOString(),
      room: `https://meet.jit.si/prepwise-${data.mentorId}-${Date.now()}`,
      mentorMessage: "",
    };
    const docRef = await db.collection("mentor_bookings").add(newBooking);
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getUserBookings(userId: string) {
  try {
    const snapshot = await db
      .collection("mentor_bookings")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: unknown) {
    console.error("Failed to get user bookings", error);
    return [];
  }
}

export async function getMentorBookings() {
  try {
    const snapshot = await db
      .collection("mentor_bookings")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: unknown) {
    console.error("Failed to get mentor bookings", error);
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: "Scheduled" | "InProgress" | "Completed",
  opts?: { mentorMessage?: string; room?: string }
) {
  try {
    const updateData: Record<string, unknown> = { status };
    if (opts?.mentorMessage !== undefined)
      updateData.mentorMessage = opts.mentorMessage;
    if (opts?.room !== undefined) updateData.room = opts.room;

    await db.collection("mentor_bookings").doc(bookingId).update(updateData);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function sendMentorMessage(
  bookingId: string,
  mentorMessage: string
) {
  try {
    await db
      .collection("mentor_bookings")
      .doc(bookingId)
      .update({ mentorMessage });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// --- SHARED TRANSCRIPTS (HALL OF FAME) ---
export async function shareTranscript(data: {
  interviewId: string;
  userId: string;
  userName: string;
  role: string;
  score: number;
  transcript: any[];
}) {
  try {
    const sharedData = {
      ...data,
      upvotes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("shared_transcripts").add(sharedData);
    revalidatePath("/community");
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getSharedTranscripts() {
  try {
    const snapshot = await db
      .collection("shared_transcripts")
      .orderBy("score", "desc")
      .limit(10)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

// --- STARTUP APPLICATIONS & MESSAGING ---
export async function applyToStartup(data: {
  startupId: string;
  startupTitle: string;
  founderId: string;
  founderName: string;
  applicantId: string;
  applicantName: string;
  message?: string;
}) {
  try {
    // Check if already applied
    const existing = await db.collection("startup_applications")
      .where("startupId", "==", data.startupId)
      .where("applicantId", "==", data.applicantId)
      .get();
    
    if (!existing.empty) {
      return { success: false, error: "Application already submitted for this venture." };
    }

    const application = {
      ...data,
      status: "pending",
      jitsiRoom: `https://meet.jit.si/antigravity-connect-${data.startupId}-${data.applicantId}`,
      createdAt: new Date().toISOString(),
    };

    await db.collection("startup_applications").add(application);
    revalidatePath("/community");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getReceivedApplications(userId: string) {
  try {
    const snapshot = await db.collection("startup_applications")
      .where("founderId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Failed to fetch applications", error);
    return [];
  }
}

export async function getSentApplications(userId: string) {
  try {
    const snapshot = await db.collection("startup_applications")
      .where("applicantId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Failed to fetch sent applications", error);
    return [];
  }
}

export async function updateApplicationStatus(applicationId: string, status: "accepted" | "rejected") {
  try {
    await db.collection("startup_applications").doc(applicationId).update({ status });
    revalidatePath("/community");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

