export async function onRequestPost(context) {
  const { request, env } = context;
  const { password } = await request.json();
  const adminPassword = await env.SITE_KV.get('admin_password') || 'afrah2026';

  if (password === adminPassword) {
    const token = crypto.randomUUID();
    await env.SITE_KV.put(`session:${token}`, 'valid', { expirationTtl: 86400 });
    return new Response(JSON.stringify({ success: true, token }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: false }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
