async function checkAuth(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const session = await env.SITE_KV.get(`session:${token}`);
  return session === 'valid';
}

// PUT — change password
export async function onRequestPut(context) {
  const { request, env } = context;
  if (!await checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { current, newPassword } = await request.json();
  const adminPassword = await env.SITE_KV.get('admin_password') || 'afrah2026';

  if (current !== adminPassword) {
    return new Response(JSON.stringify({ success: false, error: 'كلمة المرور الحالية غير صحيحة' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  await env.SITE_KV.put('admin_password', newPassword);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
