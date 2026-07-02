import { createPagesHandler } from '@cloudflare/pages-adapter';

export const onRequest = createPagesHandler({
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "admin";
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const authAdmin = (req: Request): string | null => {
      return req.headers.get('x-admin-token');
    };

    try {
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', db: 'd1', storage: 'kv' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path === '/api/categories') {
        const { results } = await env.DB.prepare(
          'SELECT DISTINCT category FROM books WHERE category != ""'
        ).all();
        const categories = results.map((r: any) => r.category);
        return new Response(JSON.stringify(categories), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path === '/api/books/popular') {
        const limit = url.searchParams.get('limit') || '8';
        const { results } = await env.DB.prepare(
          'SELECT * FROM books ORDER BY downloads DESC LIMIT ?'
        ).bind(parseInt(limit)).all();
        const books = results.map((row: any) => ({
          ...row,
          formats: row.formats ? row.formats.split(',').filter(Boolean) : [],
        }));
        return new Response(JSON.stringify(books), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 静态文件代理 - 通过 KV 读取
      if (path.startsWith('/api/files/')) {
        const key = decodeURIComponent(path.replace('/api/files/', ''));
        const file = await env.FILES_KV.get(key, { type: 'arrayBuffer' });
        if (!file) {
          return new Response(JSON.stringify({ error: '文件不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        const meta = await env.FILES_KV.getWithMetadata(key);
        const contentType = (meta?.metadata as any)?.contentType || 'application/octet-stream';
        return new Response(file, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
            ...corsHeaders,
          },
        });
      }

      if (path.startsWith('/api/books/') && path.includes('/download/')) {
        const parts = path.split('/');
        const id = parts[3];
        const format = parts[5];
        const bookResult = await env.DB.prepare('SELECT * FROM books WHERE id = ?').bind(id).first();
        if (!bookResult) {
          return new Response(JSON.stringify({ error: '书籍未找到' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        const urlKey = `${format}_url`;
        const fileUrl = (bookResult as any)[urlKey];
        if (!fileUrl) {
          return new Response(JSON.stringify({ error: '该格式文件不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        // fileUrl 形如 /books/时间戳_xxx.pdf，需要从 KV 中读取
        const key = fileUrl.replace(/^\//, '');
        const file = await env.FILES_KV.get(key, { type: 'arrayBuffer' });
        if (!file) {
          return new Response(JSON.stringify({ error: '文件不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        await env.DB.prepare('UPDATE books SET downloads = downloads + 1 WHERE id = ?').bind(id).run();
        const meta = await env.FILES_KV.getWithMetadata(key);
        const contentType = (meta?.metadata as any)?.contentType || 'application/octet-stream';
        return new Response(file, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${bookResult.title}.${format}"`,
            ...corsHeaders,
          },
        });
      }

      if (path === '/api/books/search') {
        const q = url.searchParams.get('q') || '';
        const category = url.searchParams.get('category') || '';
        const format = url.searchParams.get('format') || '';
        const language = url.searchParams.get('language') || '';
        const sortBy = url.searchParams.get('sortBy') || 'relevance';
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

        let sql = 'SELECT * FROM books WHERE 1=1';
        const params: any[] = [];

        if (q) {
          sql += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
          const qTerm = `%${q}%`;
          params.push(qTerm, qTerm, qTerm);
        }
        if (category) {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (format) {
          sql += ' AND formats LIKE ?';
          params.push(`%${format}%`);
        }
        if (language) {
          sql += ' AND language = ?';
          params.push(language);
        }

        if (sortBy === 'rating') sql += ' ORDER BY rating DESC';
        else if (sortBy === 'year') sql += ' ORDER BY year DESC';
        else sql += ' ORDER BY downloads DESC';

        sql += ' LIMIT ? OFFSET ?';
        params.push(pageSize, (page - 1) * pageSize);

        const { results } = await env.DB.prepare(sql).bind(...params).all();
        const books = results.map((row: any) => ({
          ...row,
          formats: row.formats ? row.formats.split(',').filter(Boolean) : [],
        }));

        return new Response(JSON.stringify({ books, page, pageSize }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path.match(/^\/api\/books\/[\w-]+$/)) {
        const id = path.split('/').pop();
        const book = await env.DB.prepare('SELECT * FROM books WHERE id = ?').bind(id).first();
        if (!book) {
          return new Response(JSON.stringify({ error: '书籍未找到' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        return new Response(JSON.stringify({
          ...book,
          formats: book.formats ? book.formats.split(',').filter(Boolean) : [],
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path === '/api/admin/login' && method === 'POST') {
        const body = await request.json();
        const { password } = body;
        if (password === ADMIN_PASSWORD) {
          return new Response(JSON.stringify({ token: ADMIN_PASSWORD, success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        return new Response(JSON.stringify({ error: '密码错误', success: false }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const token = authAdmin(request);
      if (path.startsWith('/api/admin')) {
        if (token !== ADMIN_PASSWORD) {
          return new Response(JSON.stringify({ error: '未授权' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }

      if (path === '/api/admin/books' && method === 'GET') {
        const q = url.searchParams.get('q') || '';
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

        let sql = 'SELECT * FROM books';
        const params: any[] = [];

        if (q) {
          sql += ' WHERE title LIKE ? OR author LIKE ?';
          const qTerm = `%${q}%`;
          params.push(qTerm, qTerm);
        }

        sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        params.push(pageSize, (page - 1) * pageSize);

        const { results } = await env.DB.prepare(sql).bind(...params).all();
        const books = results.map((row: any) => ({
          ...row,
          formats: row.formats ? row.formats.split(',').filter(Boolean) : [],
        }));

        return new Response(JSON.stringify({ books, page, pageSize }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path === '/api/admin/books' && method === 'POST') {
        const body = await request.json();
        const {
          title, author, cover, publisher, year, pages, language,
          rating, downloads, category, formats, description,
          pdf_url, epub_url, mobi_url
        } = body;

        if (!title || !author) {
          return new Response(JSON.stringify({ error: '书名和作者必填' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const result = await env.DB.prepare(
          `INSERT INTO books (title, author, cover, publisher, year, pages, language, rating, downloads, category, formats, description, pdf_url, epub_url, mobi_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          title, author, cover || '', publisher || '', parseInt(year) || 0, parseInt(pages) || 0,
          language || '中文', parseFloat(rating) || 0, parseInt(downloads) || 0, category || '',
          Array.isArray(formats) ? formats.join(',') : formats || '', description || '',
          pdf_url || '', epub_url || '', mobi_url || ''
        ).run();

        return new Response(JSON.stringify({ id: result.meta.last_row_id, success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path.match(/^\/api\/admin\/books\/[\w-]+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json();
        const {
          title, author, cover, publisher, year, pages, language,
          rating, downloads, category, formats, description,
          pdf_url, epub_url, mobi_url
        } = body;

        const updates: string[] = [];
        const params: any[] = [];

        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (author !== undefined) { updates.push('author = ?'); params.push(author); }
        if (cover !== undefined) { updates.push('cover = ?'); params.push(cover); }
        if (publisher !== undefined) { updates.push('publisher = ?'); params.push(publisher); }
        if (year !== undefined) { updates.push('year = ?'); params.push(parseInt(year) || 0); }
        if (pages !== undefined) { updates.push('pages = ?'); params.push(parseInt(pages) || 0); }
        if (language !== undefined) { updates.push('language = ?'); params.push(language); }
        if (rating !== undefined) { updates.push('rating = ?'); params.push(parseFloat(rating) || 0); }
        if (downloads !== undefined) { updates.push('downloads = ?'); params.push(parseInt(downloads) || 0); }
        if (category !== undefined) { updates.push('category = ?'); params.push(category); }
        if (formats !== undefined) { updates.push('formats = ?'); params.push(Array.isArray(formats) ? formats.join(',') : formats); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (pdf_url !== undefined) { updates.push('pdf_url = ?'); params.push(pdf_url); }
        if (epub_url !== undefined) { updates.push('epub_url = ?'); params.push(epub_url); }
        if (mobi_url !== undefined) { updates.push('mobi_url = ?'); params.push(mobi_url); }

        if (updates.length === 0) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        params.push(id);
        await env.DB.prepare(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path.match(/^\/api\/admin\/books\/[\w-]+$/) && method === 'DELETE') {
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM books WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (path === '/api/admin/upload' && method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = url.searchParams.get('type') || 'cover';

        if (!file) {
          return new Response(JSON.stringify({ error: '未上传文件' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // KV 单个值最大 25MB
        const MAX_SIZE = 25 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          return new Response(JSON.stringify({ error: `文件超过 25MB 限制（当前 ${(file.size / 1024 / 1024).toFixed(2)}MB）` }), {
            status: 413,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
        const prefix = type === 'book' ? 'books' : 'covers';
        const key = `${prefix}/${filename}`;

        await env.FILES_KV.put(key, file.stream(), {
          metadata: { contentType: file.type, originalName: file.name },
        });

        const urlPath = `/${prefix}/${filename}`;
        return new Response(JSON.stringify({ url: urlPath, filename, size: file.size }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
});

export {};
