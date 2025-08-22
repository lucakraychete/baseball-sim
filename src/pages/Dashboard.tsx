export default function Dashboard() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="card p-4">
          <h2 className="font-medium">Next Task</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Define ratings schema (20–80) and data model.</p>
        </div>
        <div className="card p-4">
          <h2 className="font-medium">Quick Sim</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Hook up a stub pitch simulation loop.</p>
        </div>
        <div className="card p-4">
          <h2 className="font-medium">Design</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Approve typography, spacing, and card look.</p>
        </div>
      </div>
    </section>
  );
}
