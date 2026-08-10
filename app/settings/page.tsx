export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Manage your workspace.</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-medium">Profile</h2>
            <p className="text-sm text-muted-foreground">Manage your personal information.</p>
            <div className="mt-4 flex max-w-md flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Name
                <input className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none ring-ring focus:ring-2" defaultValue="Jordan Davis" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Email
                <input type="email" className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none ring-ring focus:ring-2" defaultValue="jordan@example.com" />
              </label>
              <button className="w-fit rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
