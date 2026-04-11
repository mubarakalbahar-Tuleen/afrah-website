async function checkAuth(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const session = await env.SITE_KV.get(`session:${token}`);
  return session === 'valid';
}

// GET — get site content
export async function onRequestGet(context) {
  const { env } = context;
  const contentJson = await env.SITE_KV.get('site_content');
  const content = contentJson ? JSON.parse(contentJson) : {};
  return new Response(JSON.stringify(content), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// PUT — update site content
export async function onRequestPut(context) {
  const { request, env } = context;
  if (!await checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const update = await request.json();
  const contentJson = await env.SITE_KV.get('site_content');
  const content = contentJson ? JSON.parse(contentJson) : {};

  // Merge update into content
  Object.assign(content, update);
  await env.SITE_KV.put('site_content', JSON.stringify(content));

  return new Response(JSON.stringify(content), {
    headers: { 'Content-Type': 'application/json' }
  });
}
