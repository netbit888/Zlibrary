var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// server/api/worker.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token"
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}
__name(json, "json");
async function readFileFromKV(key, env) {
  const file = await env.FILES_KV.get(key, { type: "arrayBuffer" });
  if (!file) return null;
  const meta = await env.FILES_KV.getWithMetadata(key);
  const contentType = meta?.metadata?.contentType || "application/octet-stream";
  return { body: file, contentType };
}
__name(readFileFromKV, "readFileFromKV");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "admin";
    const token = request.headers.get("x-admin-token");
    try {
      if (path === "/api/health") {
        return json({ status: "ok", db: "d1", storage: "kv" });
      }
      if (path === "/api/categories") {
        const { results } = await env.DB.prepare(
          'SELECT DISTINCT category FROM books WHERE category IS NOT NULL AND category != "" ORDER BY category'
        ).all();
        return json(results.map((r) => r.category));
      }
      if (path === "/api/books/popular") {
        const limit = parseInt(url.searchParams.get("limit") || "8");
        const { results } = await env.DB.prepare(
          "SELECT * FROM books ORDER BY downloads DESC LIMIT ?"
        ).bind(limit).all();
        return json(results.map(rowToBook));
      }
      if (path.startsWith("/api/files/")) {
        const key = decodeURIComponent(path.replace("/api/files/", ""));
        const file = await readFileFromKV(key, env);
        if (!file) return json({ error: "\u6587\u4EF6\u4E0D\u5B58\u5728" }, 404);
        return new Response(file.body, {
          headers: {
            "Content-Type": file.contentType,
            "Cache-Control": "public, max-age=31536000",
            ...corsHeaders
          }
        });
      }
      if (path.startsWith("/api/books/") && path.includes("/download/")) {
        const parts = path.split("/");
        const id = parts[3];
        const format = parts[5];
        const book = await env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first();
        if (!book) return json({ error: "\u4E66\u7C4D\u672A\u627E\u5230" }, 404);
        const urlKey = `${format}_url`;
        const fileUrl = book[urlKey];
        if (!fileUrl) return json({ error: "\u8BE5\u683C\u5F0F\u6587\u4EF6\u4E0D\u5B58\u5728" }, 404);
        const key = fileUrl.replace(/^\//, "");
        const file = await readFileFromKV(key, env);
        if (!file) return json({ error: "\u6587\u4EF6\u4E0D\u5B58\u5728" }, 404);
        await env.DB.prepare("UPDATE books SET downloads = downloads + 1 WHERE id = ?").bind(id).run();
        return new Response(file.body, {
          headers: {
            "Content-Type": file.contentType,
            "Content-Disposition": `attachment; filename="${book.title}.${format}"`,
            ...corsHeaders
          }
        });
      }
      if (path === "/api/books/search") {
        const q = url.searchParams.get("q") || "";
        const category = url.searchParams.get("category") || "";
        const format = url.searchParams.get("format") || "";
        const language = url.searchParams.get("language") || "";
        const sortBy = url.searchParams.get("sortBy") || "relevance";
        const page = parseInt(url.searchParams.get("page") || "1");
        const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
        let sql = "SELECT * FROM books WHERE 1=1";
        const params = [];
        if (q) {
          sql += " AND (title LIKE ? OR author LIKE ? OR description LIKE ?)";
          const term = `%${q}%`;
          params.push(term, term, term);
        }
        if (category) {
          sql += " AND category = ?";
          params.push(category);
        }
        if (format) {
          sql += " AND formats LIKE ?";
          params.push(`%${format}%`);
        }
        if (language) {
          sql += " AND language = ?";
          params.push(language);
        }
        if (sortBy === "rating") sql += " ORDER BY rating DESC";
        else if (sortBy === "year") sql += " ORDER BY year DESC";
        else sql += " ORDER BY downloads DESC";
        sql += " LIMIT ? OFFSET ?";
        params.push(pageSize, (page - 1) * pageSize);
        const { results } = await env.DB.prepare(sql).bind(...params).all();
        return json({ books: results.map(rowToBook), page, pageSize });
      }
      if (path.match(/^\/api\/books\/[\w-]+$/)) {
        const id = path.split("/").pop();
        const book = await env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first();
        if (!book) return json({ error: "\u4E66\u7C4D\u672A\u627E\u5230" }, 404);
        return json(rowToBook(book));
      }
      if (path === "/api/admin/login" && method === "POST") {
        const body = await request.json();
        if (body.password === ADMIN_PASSWORD) {
          return json({ token: ADMIN_PASSWORD, success: true });
        }
        return json({ error: "\u5BC6\u7801\u9519\u8BEF", success: false }, 401);
      }
      if (path.startsWith("/api/admin")) {
        if (token !== ADMIN_PASSWORD) {
          return json({ error: "\u672A\u6388\u6743" }, 401);
        }
      }
      if (path === "/api/admin/books" && method === "GET") {
        const q = url.searchParams.get("q") || "";
        const page = parseInt(url.searchParams.get("page") || "1");
        const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
        let sql = "SELECT * FROM books";
        const params = [];
        if (q) {
          sql += " WHERE title LIKE ? OR author LIKE ?";
          const term = `%${q}%`;
          params.push(term, term);
        }
        sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
        params.push(pageSize, (page - 1) * pageSize);
        const { results } = await env.DB.prepare(sql).bind(...params).all();
        return json({ books: results.map(rowToBook), page, pageSize });
      }
      if (path === "/api/admin/books" && method === "POST") {
        const body = await request.json();
        if (!body.title || !body.author) {
          return json({ error: "\u4E66\u540D\u548C\u4F5C\u8005\u5FC5\u586B" }, 400);
        }
        const result = await env.DB.prepare(
          `INSERT INTO books (title, author, cover, publisher, year, pages, language, rating, downloads, category, formats, description, pdf_url, epub_url, mobi_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.title,
          body.author,
          body.cover || "",
          body.publisher || "",
          parseInt(body.year) || 0,
          parseInt(body.pages) || 0,
          body.language || "\u4E2D\u6587",
          parseFloat(body.rating) || 0,
          parseInt(body.downloads) || 0,
          body.category || "",
          Array.isArray(body.formats) ? body.formats.join(",") : body.formats || "",
          body.description || "",
          body.pdf_url || "",
          body.epub_url || "",
          body.mobi_url || ""
        ).run();
        return json({ id: result.meta.last_row_id, success: true });
      }
      if (path.match(/^\/api\/admin\/books\/[\w-]+$/) && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
        const fields = [];
        const params = [];
        const editable = [
          ["title", (v) => v],
          ["author", (v) => v],
          ["cover", (v) => v],
          ["publisher", (v) => v],
          ["year", (v) => parseInt(v) || 0],
          ["pages", (v) => parseInt(v) || 0],
          ["language", (v) => v],
          ["rating", (v) => parseFloat(v) || 0],
          ["downloads", (v) => parseInt(v) || 0],
          ["category", (v) => v],
          ["formats", (v) => Array.isArray(v) ? v.join(",") : v],
          ["description", (v) => v],
          ["pdf_url", (v) => v],
          ["epub_url", (v) => v],
          ["mobi_url", (v) => v]
        ];
        for (const [key, transform] of editable) {
          if (body[key] !== void 0) {
            fields.push(`${key} = ?`);
            params.push(transform(body[key]));
          }
        }
        if (fields.length === 0) return json({ success: true });
        params.push(id);
        await env.DB.prepare(`UPDATE books SET ${fields.join(", ")} WHERE id = ?`).bind(...params).run();
        return json({ success: true });
      }
      if (path.match(/^\/api\/admin\/books\/[\w-]+$/) && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
        return json({ success: true });
      }
      if (path === "/api/admin/upload" && method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        const type = url.searchParams.get("type") || "cover";
        if (!file) return json({ error: "\u672A\u4E0A\u4F20\u6587\u4EF6" }, 400);
        const MAX_SIZE = 25 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          return json({ error: `\u6587\u4EF6\u8D85\u8FC7 25MB \u9650\u5236\uFF08\u5F53\u524D ${(file.size / 1024 / 1024).toFixed(2)}MB\uFF09` }, 413);
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
        const prefix = type === "book" ? "books" : "covers";
        const key = `${prefix}/${filename}`;
        await env.FILES_KV.put(key, file.stream(), {
          metadata: { contentType: file.type, originalName: file.name }
        });
        return json({ url: `/${prefix}/${filename}`, filename, size: file.size });
      }
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};
function rowToBook(row) {
  return {
    id: String(row.id),
    title: row.title,
    author: row.author,
    cover: row.cover,
    publisher: row.publisher,
    year: row.year,
    pages: row.pages,
    language: row.language,
    rating: row.rating,
    downloads: row.downloads,
    category: row.category,
    formats: row.formats ? row.formats.split(",").filter(Boolean) : [],
    description: row.description,
    pdf_url: row.pdf_url || "",
    epub_url: row.epub_url || "",
    mobi_url: row.mobi_url || ""
  };
}
__name(rowToBook, "rowToBook");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
