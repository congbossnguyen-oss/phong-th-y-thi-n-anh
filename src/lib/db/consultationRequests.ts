import { db } from "./client";
import { consultationRequests } from "../../../db/schema";

export async function createConsultationRequest(params: {
  name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  message: string | null;
}) {
  const [row] = await db
    .insert(consultationRequests)
    .values({
      name: params.name,
      phone: params.phone,
      email: params.email,
      topic: params.topic,
      message: params.message,
    })
    .returning({ id: consultationRequests.id });

  return row.id;
}
