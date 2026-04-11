async function checkAuth(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const session = await env.SITE_KV.get(`session:${token}`);
  return session === 'valid';
}

// GET — list all posts
export async function onRequestGet(context) {
  const { env } = context;
  const postsJson = await env.SITE_KV.get('blog_posts');
  const posts = postsJson ? JSON.parse(postsJson) : [];
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST — create a new post
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!await checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const post = await request.json();
  const postsJson = await env.SITE_KV.get('blog_posts');
  const posts = postsJson ? JSON.parse(postsJson) : [];

  const newPost = {
    id: crypto.randomUUID(),
    title_ar: post.title_ar || '',
    title_en: post.title_en || '',
    body_ar: post.body_ar || '',
    body_en: post.body_en || '',
    date: new Date().toISOString(),
  };

  posts.unshift(newPost);
  await env.SITE_KV.put('blog_posts', JSON.stringify(posts));

  return new Response(JSON.stringify(newPost), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// PUT — update a post
export async function onRequestPut(context) {
  const { request, env } = context;
  if (!await checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const update = await request.json();
  const postsJson = await env.SITE_KV.get('blog_posts');
  const posts = postsJson ? JSON.parse(postsJson) : [];

  const idx = posts.findIndex(p => p.id === update.id);
  if (idx === -1) return new Response('Not found', { status: 404 });

  posts[idx] = { ...posts[idx], ...update, date: posts[idx].date };
  await env.SITE_KV.put('blog_posts', JSON.stringify(posts));

  return new Response(JSON.stringify(posts[idx]), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// DELETE — delete a post
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!await checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await request.json();
  const postsJson = await env.SITE_KV.get('blog_posts');
  const posts = postsJson ? JSON.parse(postsJson) : [];

  const filtered = posts.filter(p => p.id !== id);
  await env.SITE_KV.put('blog_posts', JSON.stringify(filtered));

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
