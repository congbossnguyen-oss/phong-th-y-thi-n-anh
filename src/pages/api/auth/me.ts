import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ user: null }), { status: 200 });
  }
  const { name, email } = locals.user;
  return new Response(JSON.stringify({ user: { name, email } }), { status: 200 });
};
