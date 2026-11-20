import { useState } from "react";

const STEPS = [
  { title: "Welcome to the catalog", body: "This is the shared list of books. Anyone can browse it; signed-in users can change it." },
  { title: "Add a book", body: "Fill in the title, author and publication year, then choose Add book. New books appear at the top of page one." },
  { title: "Find a book", body: "Type in the search box to match a title or an author. The results and page count update as you type." },
  { title: "Edit or remove", body: "Use Edit on a row to correct its details, or Delete to remove it. Deleting asks you to confirm first." },
  { title: "Move between pages", body: "Each page holds five books. Previous, Next and the page numbers keep your current search." },
];

export default function Tour() {
  const [done, setDone] = useState(() => localStorage.getItem("tourDone") === "true");
  const [i, setI] = useState(0);
  if (done) return null;

  const finish = () => { localStorage.setItem("tourDone", "true"); setDone(true); };
  const last = i === STEPS.length - 1;

  return (
    <div className="tour-backdrop">
      <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <p className="tour-count">Step {i + 1} of {STEPS.length}</p>
        <h2 id="tour-title">{STEPS[i].title}</h2>
        <p>{STEPS[i].body}</p>
        <div className="tour-actions">
          <button className="btn ghost" onClick={finish}>Skip tour</button>
          <span className="spacer" />
          {i > 0 && <button className="btn" onClick={() => setI(i - 1)}>Back</button>}
          <button className="btn primary" autoFocus onClick={() => (last ? finish() : setI(i + 1))}>
            {last ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
