import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Buat Event Baru
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Isi detail event yang akan diselenggarakan.
        </p>
      </div>

      <EventForm />
    </div>
  );
}
