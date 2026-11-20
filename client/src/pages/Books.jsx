import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import Spinner from "../components/Spinner";
import Tour from "../components/Tour";

const LIMIT = 5;
const EMPTY = { title: "", author: "", year: "" };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0); // bump to refetch the current view

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch whenever the search term or page changes (search is debounced slightly).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/books", { params: { page, limit: LIMIT, search } });
        if (cancelled) return;
        setBooks(data.data);
        setMeta({ totalItems: data.totalItems, totalPages: data.totalPages });
        setError("");
        // Page no longer exists (e.g. last item on it was deleted): step back.
        if (data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Could not load books"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [search, page, reload]);

  const onSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const resetForm = () => { setForm(EMPTY); setEditingId(null); setFormError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    const payload = { title: form.title, author: form.author, year: Number(form.year) };
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, payload);
        resetForm();
        setReload((n) => n + 1);
      } else {
        await api.post("/books", payload);
        resetForm();
        setPage(1);
        setReload((n) => n + 1); // refetch even if already on page one
      }
    } catch (err) {
      setFormError(errorMessage(err, "Could not save book"));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({ title: b.title, author: b.author, year: String(b.year) });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete “${b.title}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/books/${b._id}`);
      if (editingId === b._id) resetForm();
      setReload((n) => n + 1);
    } catch (err) {
      setError(errorMessage(err, "Could not delete book"));
    }
  };

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);

  return (
    <main className="catalog">
      <Tour />

      <section className="panel" aria-labelledby="form-title">
        <h2 id="form-title">{editingId ? "Edit book" : "Add a book"}</h2>
        <form className="book-form" onSubmit={submit}>
          <label>Title
            <input value={form.title} onChange={setField("title")} required maxLength={200} />
          </label>
          <label>Author
            <input value={form.author} onChange={setField("author")} required maxLength={120} />
          </label>
          <label className="year">Year
            <input type="number" value={form.year} onChange={setField("year")} required min={1000} max={new Date().getFullYear() + 1} />
          </label>
          <div className="form-actions">
            <button className="btn primary" disabled={saving}>
              {saving ? "Saving" : editingId ? "Save changes" : "Add book"}
            </button>
            {editingId && <button type="button" className="btn" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
        {formError && <p className="error" role="alert">{formError}</p>}
      </section>

      <section aria-labelledby="list-title">
        <div className="list-head">
          <h2 id="list-title">Books <span className="count">{meta.totalItems}</span></h2>
          <input
            className="search"
            type="search"
            placeholder="Search by title or author"
            aria-label="Search by title or author"
            value={search}
            onChange={onSearch}
          />
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="table-wrap" aria-busy={loading}>
          <table>
            <thead>
              <tr><th>Title</th><th>Author</th><th className="num">Year</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id} className={b._id === editingId ? "editing" : ""}>
                  <td className="title">{b.title}</td>
                  <td>{b.author}</td>
                  <td className="num">{b.year}</td>
                  <td className="row-actions">
                    <button className="btn small" onClick={() => startEdit(b)}>Edit</button>
                    <button className="btn small danger" onClick={() => remove(b)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && books.length === 0 && !error && (
                <tr><td colSpan={4} className="empty">
                  {search ? `No books match “${search}”. Try a different title or author.` : "The catalog is empty. Add the first book above."}
                </td></tr>
              )}
            </tbody>
          </table>
          {loading && <div className="loading"><Spinner label="Loading books" /></div>}
        </div>

        {meta.totalPages > 1 && (
          <nav className="pager" aria-label="Pagination">
            <button className="btn small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            {pages.map((n) => (
              <button key={n} className={`btn small ${n === page ? "current" : ""}`} aria-current={n === page ? "page" : undefined} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="btn small" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </nav>
        )}
      </section>
    </main>
  );
}
