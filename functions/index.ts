/**
 * Firebase Functions v2 Firestore trigger for wendelin-muth comments.
 *
 * Writes unread notifications into a per-user inbox:
 *   notifications/{userId}/inbox/{commentId}
 *
 * - A reply notifies the author of the parent comment (never the replier).
 * - The admin always gets notified for every comment they did not write.
 *
 * Bundled to CJS for the Firebase Functions runtime via build.ts (deno).
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { FieldValue } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin, db } from './lib/firebase.ts';

const ADMIN_UID = 'gB9DEJyxjbQWI7cliTcDukRzD5l1';

type CommentData = {
  route_id: string;
  user_id: string;
  author: string;
  body: string;
  parent_id: string | null;
};

initializeFirebaseAdmin();

setGlobalOptions({ region: 'europe-west1' });

// ── Firestore Triggers (Notifications) ────────────────────────────────────

export const onCommentCreated = onDocumentCreated('comments/{commentId}', async (event) => {
  const { commentId } = event.params;
  const data = event.data?.data() as CommentData | undefined;
  if (!data) return;

  const commenterUid = data.user_id;
  const commenterName = data.author;

  const recipients: { uid: string; reply_to: string | null }[] = [];

  // Notify the author of the comment being replied to, unless it's yourself.
  if (data.parent_id) {
    const parentSnap = await db().collection('comments').doc(data.parent_id).get();
    const parentUserId = parentSnap.data()?.user_id as string | undefined;
    if (parentUserId && parentUserId !== commenterUid) {
      recipients.push({ uid: parentUserId, reply_to: data.parent_id });
    }
  }

  // Notify the admin about every comment except their own.
  if (commenterUid !== ADMIN_UID) {
    recipients.push({ uid: ADMIN_UID, reply_to: data.parent_id ?? null });
  }

  for (const recipient of recipients) {
    await db()
      .collection('notifications')
      .doc(recipient.uid)
      .collection('inbox')
      .doc(commentId)
      .set({
        from_uid: commenterUid,
        from_name: commenterName,
        body: data.body,
        route: data.route_id,
        comment_id: commentId,
        reply_to: recipient.reply_to,
        read: false,
        created_date: FieldValue.serverTimestamp()
      });
  }
});